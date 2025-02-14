const mongoose = require('mongoose');
const { Schema } = mongoose;

const ApplianceSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    energyConsumption: {
        type: Number,
        required: false // Or false, depending on your needs
    },
    applianceName: {
        type: String,
        required: false // Or false, depending on your needs
    }
});

const Appliance = mongoose.model('Appliance', ApplianceSchema);
module.exports = Appliance;