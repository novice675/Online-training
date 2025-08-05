const express = require('express');
const router = express.Router();
const { Wenzhang } = require('../models/Wenzhang');
const multiparty = require('multiparty');

router.post('/upload', (req, res) => {
    const form = new multiparty.Form();
    form.uploadDir = 'upload';
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.send({
                code: 400,
                msg: "上传失败",
                error: err
            });
        }

        let url = "http://localhost:3008/" + files.file[0].path.replace("\\", "/");
        res.send({
            code: 200,
            msg: "上传成功",
            url: url
        });
    });
});

//获取文章列表
router.get('/list', async (req, res) => {
    try {
        let { page, size, title, type } = req.query;

        let tj = {}
        if(title){  
            tj.title = RegExp(title)
        }
        if(type){
            tj.type = type
        }
        const data = await Wenzhang.find(tj).skip((page - 1) * size).limit(size)
        const total = await Wenzhang.countDocuments(tj)
        res.send({
            code: 200,
            msg: "获取成功",
            data,
            total
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "获取文章列表失败",
            error: error.message
        });
    }
});

// 获取文章详情
router.get('/detail/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Wenzhang.findById(id);
        
        if (!article) {
            return res.send({
                code: 404,
                msg: "文章不存在"
            });
        }
        
        res.send({
            code: 200,
            msg: "获取成功",
            data: article
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "获取文章详情失败",
            error: error.message
        });
    }
});

//创建文章
router.post('/add', async (req, res) => {
    try {
        await Wenzhang.create(req.body);
        res.send({
            code: 200,
            msg: "文章创建成功"
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "创建文章失败",
            error: error.message
        });
    }
});

// 修改文章
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updated_at: new Date()
        };
        
        const article = await Wenzhang.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!article) {
            return res.send({
                code: 404,
                msg: "文章不存在"
            });
        }
        
        res.send({
            code: 200,
            msg: "文章更新成功",
            data: article
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "更新文章失败",
            error: error.message
        });
    }
});

// 删除单个文章
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Wenzhang.findByIdAndDelete(id);
        
        if (!article) {
            return res.send({
                code: 404,
                msg: "文章不存在"
            });
        }
        
        res.send({
            code: 200,
            msg: "文章删除成功"
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "删除文章失败",
            error: error.message
        });
    }
});

// 批量删除文章
router.delete('/batch-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.send({
                code: 400,
                msg: "请提供要删除的文章ID列表"
            });
        }
        
        const result = await Wenzhang.deleteMany({ _id: { $in: ids } });
        
        res.send({
            code: 200,
            msg: `成功删除 ${result.deletedCount} 篇文章`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "批量删除文章失败",
            error: error.message
        });
    }
});

module.exports = router; 