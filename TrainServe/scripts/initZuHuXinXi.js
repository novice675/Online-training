const ZuHuXinXi = require('../models/ZuHuXinXi');
const { HeTong } = require('../models/HeTong');
const { Company, Employee } = require('../models/database');
require('../db/index'); // 连接数据库

/**
 * 初始化租户信息表
 * 插入测试数据，严格按照ZuHuXinXi模型字段定义
 */
async function initZuHuXinXi() {
  try {
    console.log('开始初始化租户信息表...');
    
    // 检查是否已有数据
    const count = await ZuHuXinXi.countDocuments();
    if (count > 0) {
      console.log(`✓ 租户信息表已有 ${count} 条数据，跳过测试数据插入`);
      return;
    }

    // 获取现有的企业数据 - companyId是必需的
    const companies = await Company.find({}, { _id: 1, name: 1 }).sort({ name: 1 });
    
    if (companies.length === 0) {
      console.log('⚠️ 错误: 没有找到企业数据，请先运行企业初始化脚本');
      console.log('无法创建租户数据，因为companyId是必需的');
      return;
    } else {
      console.log(`✓ 找到 ${companies.length} 个可用企业`);
    }

    // 获取现有的员工数据 - employeeId是可选的
    const employees = await Employee.find({}, { _id: 1, company_id: 1, name: 1 }).sort({ company_id: 1, name: 1 });
    
    if (employees.length === 0) {
      console.log('⚠️ 警告: 没有找到员工数据，租户数据将创建，但员工关联字段为空');
    } else {
      console.log(`✓ 找到 ${employees.length} 个可用员工`);
    }

    // 获取现有的合同数据 - hetongId是可选的
    const contracts = await HeTong.find({}, { _id: 1, he_bian: 1 }).sort({ created_at: 1 });
    
    if (contracts.length === 0) {
      console.log('⚠️ 警告: 没有找到合同数据，租户数据将创建，但合同关联字段为空');
    } else {
      console.log(`✓ 找到 ${contracts.length} 个可用合同`);
    }

    // 确定要创建的租户数量（不超过企业数量）
    const tenantCount = Math.min(companies.length, 15);
    console.log(`📊 将创建 ${tenantCount} 个租户（基于可用企业数量）`);

    // 生成测试数据 - 严格按照模型字段定义
    const testTenants = [];
    const statusOptions = ['正常', '暂停', '终止'];
    
    for (let i = 0; i < tenantCount; i++) {
      const company = companies[i];
      
      // 查找该企业对应的员工（如果存在）
      const employee = employees.find(emp => emp.company_id?.toString() === company._id?.toString());
      
      // 随机分配合同（如果存在）
      const contract = contracts.length > 0 ? contracts[i % contracts.length] : null;
      
      const tenant = {
        // 关联企业表 - 必需字段
        companyId: company._id,
        
        // 关联人员表 - 可选字段
        employeeId: employee ? employee._id : null,
        
        // 关联合同表 - 可选字段
        hetongId: contract ? contract._id : null,
        
        // 状态信息 - 必需字段，大部分设为正常，少量设为其他状态
        status: i < tenantCount - 2 ? '正常' : statusOptions[i % statusOptions.length]
      };
      
      testTenants.push(tenant);
    }

    // 批量插入数据
    const result = await ZuHuXinXi.insertMany(testTenants);
    console.log(`✓ 成功插入 ${result.length} 条租户信息数据`);
    
    // 显示插入的数据概览和关联信息
    console.log('\n插入的租户信息概览:');
    for (let i = 0; i < result.length; i++) {
      const tenant = result[i];
      const company = companies.find(c => c._id.toString() === tenant.companyId.toString());
      const employee = employees.find(e => tenant.employeeId && e._id.toString() === tenant.employeeId.toString());
      const contract = contracts.find(c => tenant.hetongId && c._id.toString() === tenant.hetongId.toString());
      
      const companyInfo = company ? `企业: ${company.name}` : '无企业关联';
      const employeeInfo = employee ? `负责人: ${employee.name}` : '无负责人关联';
      const contractInfo = contract ? `合同: ${contract.he_bian}` : '无合同关联';
      
      console.log(`${i + 1}. [${tenant.status}] ${companyInfo} | ${employeeInfo} | ${contractInfo}`);
    }
    
    // 显示关联统计
    const linkedCompanyCount = result.filter(tenant => tenant.companyId).length;
    const linkedEmployeeCount = result.filter(tenant => tenant.employeeId).length;
    const linkedContractCount = result.filter(tenant => tenant.hetongId).length;
    const statusStats = {};
    result.forEach(tenant => {
      statusStats[tenant.status] = (statusStats[tenant.status] || 0) + 1;
    });
    
    console.log(`\n📊 关联统计:`);
    console.log(`  - 企业关联: ${linkedCompanyCount}/${result.length} 个租户已关联企业`);
    console.log(`  - 员工关联: ${linkedEmployeeCount}/${result.length} 个租户已关联员工`);
    console.log(`  - 合同关联: ${linkedContractCount}/${result.length} 个租户已关联合同`);
    console.log(`\n📈 状态分布:`);
    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count} 个租户`);
    });
    
  } catch (error) {
    console.error('❌ 初始化租户信息表失败:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initZuHuXinXi()
    .then(() => {
      console.log('\n🎉 租户信息表初始化完成!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 初始化过程中出现错误:', error);
      process.exit(1);
    });
}

module.exports = initZuHuXinXi; 