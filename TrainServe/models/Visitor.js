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

const VisitorModel = mongoose.model('Visitors', VisitorSchema, 'Visitors');
module.exports = VisitorModel;