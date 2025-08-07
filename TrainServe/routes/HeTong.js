const express = require('express');
const router = express.Router();
const { HeTong } = require('../models/HeTong');

//获取合同列表
router.get('/list', async (req, res) => {
    try {
        let { page, size, he_bian, shuxing, qianPeople, status_filter } = req.query;
        
        // 设置默认分页参数
        page = parseInt(page) || 1;
        size = parseInt(size) || 10;

        let tj = {}
        if(he_bian && he_bian.trim()){
            tj.he_bian = { $regex: he_bian.trim(), $options: 'i' }
        }
        if(shuxing){
            tj.shuxing = shuxing
        }
        if(qianPeople && qianPeople.trim()){  
            tj.qianPeople = { $regex: qianPeople.trim(), $options: 'i' }
        }
        if(status_filter){
            const now = new Date();
            if(status_filter === '生效中'){
                tj.endDate = { $gt: now }
            } else if(status_filter === '已到期'){
                tj.endDate = { $lte: now }
            }
        }
        
        const data = await HeTong.find(tj)
            .skip((page - 1) * size)
            .limit(size)
            .sort({ created_at: -1 })
        const total = await HeTong.countDocuments(tj)
        
        res.send({
            code: 200,
            msg: "获取成功",
            data,
            total
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "获取合同列表失败",
            error: error.message
        });
    }
});

// 获取合同详情
router.get('/detail/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const hetong = await HeTong.findById(id);
        
        if (!hetong) {
            return res.send({
                code: 404,
                msg: "合同不存在"
            });
        }
        
        res.send({
            code: 200,
            msg: "获取成功",
            data: hetong
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "获取合同详情失败",
            error: error.message
        });
    }
});

//创建合同
router.post('/add', async (req, res) => {
    try {
        // 检查合同编号是否已存在
        const existingContract = await HeTong.findOne({ he_bian: req.body.he_bian });
        if (existingContract) {
            return res.send({
                code: 400,
                msg: "合同编号已存在"
            });
        }

        await HeTong.create(req.body);
        res.send({
            code: 200,
            msg: "合同创建成功"
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "创建合同失败",
            error: error.message
        });
    }
});

// 修改合同
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // 检查合同编号是否被其他合同使用
        if (req.body.he_bian) {
            const existingContract = await HeTong.findOne({ 
                he_bian: req.body.he_bian,
                _id: { $ne: id }
            });
            if (existingContract) {
                return res.send({
                    code: 400,
                    msg: "合同编号已被其他合同使用"
                });
            }
        }
        
        const updateData = {
            ...req.body,
            updated_at: new Date()
        };
        
        const hetong = await HeTong.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!hetong) {
            return res.send({
                code: 404,
                msg: "合同不存在"
            });
        }
        
        res.send({
            code: 200,
            msg: "合同更新成功",
            data: hetong
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "更新合同失败",
            error: error.message
        });
    }
});

// 删除单个合同
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const hetong = await HeTong.findByIdAndDelete(id);
        
        if (!hetong) {
            return res.send({
                code: 404,
                msg: "合同不存在"
            });
        }
        
        res.send({
            code: 200,
            msg: "合同删除成功"
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "删除合同失败",
            error: error.message
        });
    }
});

// 批量删除合同
router.delete('/batch-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.send({
                code: 400,
                msg: "请提供要删除的合同ID列表"
            });
        }
        
        const result = await HeTong.deleteMany({ _id: { $in: ids } });
        
        res.send({
            code: 200,
            msg: `成功删除 ${result.deletedCount} 个合同`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "批量删除合同失败",
            error: error.message
        });
    }
});

// 获取即将到期的合同
router.get('/expiring', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const now = new Date();
        const warningDate = new Date(now.getTime() + parseInt(days) * 24 * 60 * 60 * 1000);
        
        const expiringContracts = await HeTong.find({
            endDate: { 
                $gt: now,  // 还未到期
                $lte: warningDate  // 但在指定天数内会到期
            }
        }).sort({ endDate: 1 });
        
        res.send({
            code: 200,
            msg: "获取成功",
            data: expiringContracts,
            total: expiringContracts.length
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "获取即将到期合同失败",
            error: error.message
        });
    }
});

// 获取合同统计信息
router.get('/statistics', async (req, res) => {
    try {
        // 总合同数
        const totalContracts = await HeTong.countDocuments();
        
        // 按属性统计
        const shuxingStats = await HeTong.aggregate([
            { $group: { _id: '$shuxing', count: { $sum: 1 } } }
        ]);
        
        // 即将到期数量（30天内）
        const now = new Date();
        const warningDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiringCount = await HeTong.countDocuments({
            endDate: { $gt: now, $lte: warningDate }
        });
        
        // 已到期数量
        const expiredCount = await HeTong.countDocuments({
            endDate: { $lt: now }
        });
        
        res.send({
            code: 200,
            msg: "获取统计信息成功",
            data: {
                totalContracts,
                shuxingStats,
                expiringCount,
                expiredCount
            }
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: "获取统计信息失败",
            error: error.message
        });
    }
});

//生成合同编号
router.get('/generate-number', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const prefix = `HT${currentYear}`;
        
        // 查找当前年份最大的合同编号
        const latestContract = await HeTong.findOne({
            he_bian: { $regex: `^${prefix}\\d{4}$` }
        }).sort({ he_bian: -1 });
        
        let newNumber = 1;
        if (latestContract && latestContract.he_bian) {
            const numberPart = latestContract.he_bian.replace(prefix, '');
            const currentNumber = parseInt(numberPart);
            if (!isNaN(currentNumber)) {
                newNumber = currentNumber + 1;
            }
        }
        
        // 格式化为4位数字
        const formattedNumber = newNumber.toString().padStart(4, '0');
        const newHebian = `${prefix}${formattedNumber}`;
        
        // 检查生成的编号是否已存在（防止并发问题）
        const existing = await HeTong.findOne({ he_bian: newHebian });
        if (existing) {
            // 如果存在，递增直到找到不存在的编号
            let counter = newNumber + 1;
            let uniqueHebian;
            do {
                const testNumber = counter.toString().padStart(4, '0');
                uniqueHebian = `${prefix}${testNumber}`;
                const testExisting = await HeTong.findOne({ he_bian: uniqueHebian });
                if (!testExisting) {
                    break;
                }
                counter++;
            } while (counter < 9999);
            
            res.send({
                code: 200,
                msg: "生成成功",
                data: { he_bian: uniqueHebian }
            });
        } else {
            res.send({
                code: 200,
                msg: "生成成功",
                data: { he_bian: newHebian }
            });
        }
    } catch (error) {
        res.send({
            code: 500,
            msg: "生成合同编号失败",
            error: error.message
        });
    }
});

module.exports = router;
