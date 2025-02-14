const connectDB = require("./DB");
const mongoose = require('mongoose'); // Import mongoose
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
var cors = require("cors");
require("dotenv").config();
const Appliance = require("./models/Appliance");
const authenticateToken = require("./middleware/fetchuser");



connectDB();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// Set the system instruction during model initialization

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are an expert in energy consumption calculation and energy saving techniques.If asked about anything related to energy answer nicely in gemini style else A user will provide you with the name of an appliance, its power rating (in watts or kilowatts), and the duration of its usage. You will calculate the energy consumption in kilowatt-hours (kWh). Provide a detailed breakdown of the calculation. Return the energyConsumption first in the format "energyConsumption: <int>" , "applianceName: <string>" and then the appliance details in normal gemini style(maintain the similar style).If invalid input return error that this input is not acceptable`,
});


// //Avilable Routes
app.use("/api/auth", require("./routes/auth"));
app.post(
  "/ask-ai",
  authenticateToken,
  async (req, res) => {
    try {
      const { prompt } = req.body;
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Extract energyConsumption
      const energyConsumptionMatch = responseText.match(
        /energyConsumption:\s*(\d+(?:\.\d+)?)/i
      );
      const applianceNameMatch = responseText.match(
        /applianceName:\s*([a-zA-Z0-9\s]+)/i
      );

      const applianceNameValue = applianceNameMatch
        ? applianceNameMatch[1].trim()
        : undefined;
      const energyConsumptionValue = energyConsumptionMatch
        ? parseFloat(energyConsumptionMatch[1].trim())
        : undefined;

      // Check if the appliance data already exists for the user
      const existingAppliance = await Appliance.findOne({
        user: req.user.id,
        applianceName: applianceNameValue,
        energyConsumption: energyConsumptionValue,
      });

      if (existingAppliance) {
        return res.json({
          energyConsumption: energyConsumptionValue,
          response: responseText,
          message: "Appliance data already exists.",
        });
      }

      const newApplianceData = {
        energyConsumption: energyConsumptionValue,
        applianceName: applianceNameValue,
        user: req.user.id,
      };

      const appliance = new Appliance(newApplianceData);
      await appliance.save();

      res.json({
        energyConsumption: energyConsumptionValue,
        response: responseText,
      });
      
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ error: "Input correct info or Internal server Error.." });
    }
  }

  
);

//Api to fetch all the appliances to charts
app.get("/api/appliances-chart", authenticateToken, async (req, res) => {
  const appliances = await Appliance.find({ user: req.user.id });
  res.json(appliances);
});


//Api to delete the appliance
app.delete("/api/delete-appliance/:id", authenticateToken, async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid appliance ID format" });
    }

    const appliance = await Appliance.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!appliance) {
      return res.status(404).json({ 
        success: false, 
        error: "Appliance not found or unauthorized" 
      });
    }

    return res.json({ 
      success: true, 
      message: "Appliance deleted successfully",
      deletedAppliance: appliance 
    });

  } catch (error) {
    console.error("Delete operation error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
});



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});