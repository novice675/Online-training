const mongoose = require('../db/index');

const VisitorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
})

const VisitorModel = mongoose.model('Visitor', VisitorSchema);
module.exports = VisitorModel;