const mongoose = require('../db/index');

// 楼栋
const BuildingSchema = new mongoose.Schema({
    name: String,
});

const BuildingModel = mongoose.model('Building', BuildingSchema, 'Building')

module.exports = BuildingModel