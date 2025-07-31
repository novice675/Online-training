const mongoose = require('mongoose');
const Menjin = require('../models/menjin');

// 直接连接数据库，添加连接选项
mongoose.connect('mongodb+srv://mariadigo45566:sJj2QDWGxaBpltgW@cluster0.ke8hvn6.mongodb.net/OnlineTraining', {
    serverSelectionTimeoutMS: 30000, // 30秒超时
    socketTimeoutMS: 45000
}).then(() => {
    console.log("数据库连接成功");
}).catch(err => {
    console.error("数据库连接失败:", err);
    process.exit(1);
});

// 生成智能门禁测试数据的函数
function generateMenjinData() {
    const deviceTypes = ['围墙门禁', '通道门禁', '展示门禁', '车库门禁', '办公门禁', '会议室门禁'];
    const deviceModels = ['ISIS-MJ-400', 'ISIS-MJ-600', 'ISCS-MJ-600', 'ZK-ACCESS-2024', 'HK-SMART-2023', 'TC-GATE-2024', 'DS-ACCESS-2023', 'SEC-PRO-2024'];
    const statusOptions = ['正常', '故障', '维护中', '离线'];
    const followUpPersons = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十', '刘一', '陈二', '杨三', '黄四', '朱五', '林六', '何七', '罗八'];
    const buildings = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'];
    const floors = ['一层', '二层', '三层', '四层', '五层', '六层', '七层', '八层', '九层', '十层', '十一层', '十二层'];
    const areas = ['大厅', '走廊', '办公区', '会议室', '休息区', '茶水间', '洗手间', '楼梯间', '电梯间', '储物间', '机房', '档案室'];

    const menjinData = [];

    for (let i = 1; i <= 100; i++) {
        const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        const building = buildings[Math.floor(Math.random() * buildings.length)];
        const floor = floors[Math.floor(Math.random() * floors.length)];
        const area = areas[Math.floor(Math.random() * areas.length)];
        const followUpPerson = followUpPersons[Math.floor(Math.random() * followUpPersons.length)];
        const deviceModel = deviceModels[Math.floor(Math.random() * deviceModels.length)];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        
        // 生成设备编号，格式如 ISS20200816
        const deviceNumber = `ISS2020${String(800 + i).padStart(4, '0')}`;
        
        // 生成手机号
        const phoneNumber = `138${String(Math.floor(Math.random() * 90000000) + 10000000)}`;
        
        const device = {
            deviceName: deviceType,
            deviceNumber: deviceNumber,
            deviceModel: deviceModel,
            runningStatus: status,
            followUpPerson: followUpPerson,
            contactInfo: phoneNumber,
            installLocation: `${building}栋${floor}${area}`,
            sceneImage: `/images/scene/${deviceType.toLowerCase()}_${i}.jpg`,
            deviceImage: `/images/device/${deviceModel.toLowerCase().replace(/-/g, '_')}.jpg`
        };

        menjinData.push(device);
    }

    return menjinData;
}

// 生成100条智能门禁数据
const menjinData = generateMenjinData();

// 插入数据函数
async function insertMenjinData() {
    try {
        // 等待数据库连接就绪
        if (mongoose.connection.readyState !== 1) {
            console.log('等待数据库连接...');
            await new Promise((resolve, reject) => {
                mongoose.connection.on('connected', resolve);
                mongoose.connection.on('error', reject);
                // 如果已经连接，立即resolve
                if (mongoose.connection.readyState === 1) {
                    resolve();
                }
            });
        }
        
        console.log('开始插入智能门禁数据...');
        
        // 清空现有数据（可选）
        // await Menjin.deleteMany({});
        // console.log('已清空现有数据');
        
        // 插入新数据
        const result = await Menjin.insertMany(menjinData);
        console.log(`成功插入 ${result.length} 条智能门禁数据:`);
        
        // 只显示前10条数据，避免输出过多
        result.slice(0, 10).forEach((device, index) => {
            console.log(`${index + 1}. ${device.deviceName} - 设备编号: ${device.deviceNumber} - 状态: ${device.runningStatus}`);
        });
        
        if (result.length > 10) {
            console.log(`... 以及其他 ${result.length - 10} 条数据`);
        }
        
        console.log('数据插入完成！');
        
    } catch (error) {
        console.error('插入数据时发生错误:', error);
        
        // 处理重复键错误
        if (error.code === 11000) {
            console.log('提示: 部分设备编号已存在，请检查数据库中的现有记录');
        }
    } finally {
        // 关闭数据库连接
        await mongoose.connection.close();
        console.log('数据库连接已关闭');
    }
}

// 等待一下再运行插入函数，确保数据库连接完成
setTimeout(() => {
    insertMenjinData();
}, 2000); 