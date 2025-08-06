var express = require('express');
var router = express.Router();
const BuildingModel = require('../models/Building')
router.get('/Building', async (req, res) => {
    try {
        let user = await BuildingModel.find();
        res.send({
            code: 200,
            data,
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: '内部服务器错误'
        });
    }
});
module.exports = router;
