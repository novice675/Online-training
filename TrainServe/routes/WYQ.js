const { Company, Employee, Visitor, Moment } = require('../models/database')
const mongoose = require('mongoose')
var express = require('express')
var multiparty = require('multiparty')
var router = express.Router()
router.post('/addcom', async (req, res) => {
    console.log(req.body);
    await Company.create(req.body)
    res.send({
        code: 200,
        msg: "添加成功"
    })

})

// addcom的图片上传
router.post('/comupload', (req, res) => {
    console.log(req.body);
    const form = new multiparty.Form()
    form.uploadDir = '/upload'
    form.parse(req, (err, fields, files) => {
        console.log(err, fields, files, 3);

    })

})

module.exports = router