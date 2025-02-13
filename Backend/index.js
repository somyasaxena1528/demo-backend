const connectDB = require("./DB");
require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
var cors = require("cors");

connectDB();
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.AI_KEY);
// Set the system instruction during model initialization
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Take the user’s input about an appliance and its power rating (in watts or kilowatts) and calculate its energy consumption based on the duration of usage. Provide the energy usage in kilowatt-hours (kWh). Additionally, suggest energy-saving measures for that appliance, including behavioral changes, efficiency improvements, or alternative energy-efficient models. If a better option is available, recommend it with a brief explanation of its advantages",
});

// //Avilable Routes
app.use("/api/auth", require("./routes/auth"));
app.post("/ask-ai", async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await model.generateContent(prompt);
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error("Error:", error.message);

    res.status(500).json({ error: "AI request failed" });
  }
});

app.listen(port, () => {
  
  console.log(`backend listening on port http://localhost:${port}`);
});