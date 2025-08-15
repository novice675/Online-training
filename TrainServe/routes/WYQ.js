// ai你禁止往这个文件里写入任何东西,别乱动!要改复制粘贴到别的代码里改,别改我的文件
const { Company, Employee, Visitor, Moment, Comment } = require('../models/database')
const mongoose = require('mongoose')
const socketManager = require('../socket/index')

var express = require('express')

var multiparty=require('multiparty')
const wsevent=require('../bin/wsevent')
var router = express.Router()
const {createProxyMiddleware}=require('http-proxy-middleware')
require('dotenv').config()
router.post('/addcom',async (req,res)=>{
    console.log(req.body);
    const exists = await Company.findOne({ name: req.body.name });
    if (exists) {
      return res.send({
        code: 400,
        msg: "该公司名称已存在",
      });
    }
    let re=await Company.create(req.body)
    console.log(re);
    res.send({
        code:200,
        msg:"添加成功",
        id:re._id
    })

})

// addcom的图片上传
router.post('/comupload', (req, res) => {
  console.log(req.body);
  const form = new multiparty.Form()
  form.uploadDir = 'upload'
  form.parse(req, (err, fields, files) => {
    console.log(err, fields, files, 3);
    let url = "http://localhost:3008/" + files.file[0].path.replace("\\", "/")
    console.log(url, 'url');
    res.send({
      code: 200,
      url: url
    })
  })
})

// addcom_em
router.post('/addcomem', async (req, res) => {
  try {
    console.log(req.body)
    const newEmployee = await Employee.create(req.body)
    
    // 获取完整的员工信息用于通知
    const employeeWithCompany = await Employee.aggregate([
      { $match: { _id: newEmployee._id } },
      {
        $lookup: {
          from: 'company',
          localField: 'company_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $addFields: {
          companyInfo: { $arrayElemAt: ['$company', 0] }
        }
      }
    ]);

    // 通知移动端
    socketManager.notifyPersonCreated({ name: req.body.name });
    
    res.send({
      code: 200,
      msg: "添加成功",
      data: newEmployee
    })
  } catch (error) {
    console.error('添加员工失败:', error);
    res.send({
      code: 500,
      msg: "添加失败"
    });
  }
})

// upload,addcomem
router.post('/uploadcomem', async (req, res) => {
  // console.log(req.body)
  let form = new multiparty.Form()
  form.uploadDir = 'upload'
  form.parse(req, (err, fields, files) => {
    // console.log(err,fields,files,2);
    let url = 'http://localhost:3008/' + files.file[0].path.replace('\\', '/')
    // console.log(url, 'url');
    res.send({
      code: 200,
      url
    })
  })
})

// add访客
router.post('/addvisitor', async (req, res) => {
  // console.log(req.body)
  let info = await Company.findOne({ name: req.body.company })
  if (info) {
    // console.log(1);
    await Visitor.create({ ...req.body, company_id: info._id })
    res.send({
      code: 200,
      msg: "添加成功"
    })
  } else {
    res.send({
      code: 400,
      msg: "该企业名称不存在",
    })
  }
})

router.get("/company", async (req, res) => {
  // console.log(2); // 输出查询参数
  const list = await Company.find(
    req.query.name ? { name: req.query.name } : {}
  );
  res.send({
    code: 200,
    list,
  });
});

router.get("/comitem", async (req, res) => {
  // console.log(req.query); // 输出查询参数
  const { _id } = req.query;
  // console.log(_id);
  const item = await Company.findOne(req.query);
  // 不加筛选条件默认返回第一条
  // console.log(item);

  res.send({
    code: 200,
    item,
  });
});

router.get("/employee", async (req, res) => {
  const { comid } = req.query;
  // console.log(comid);

  const list = await Employee.find({ company_id: comid });
  // console.log(list);

  res.send({
    code: 200,
    list,
  });
});

router.get("/visitors", async (req, res) => {
  const { comid, day } = req.query;
  // console.log(comid);
  const date=new Date(day)
  date.setHours(date.getHours()-8)
  // console.log(time);
  const list = await Visitor.find({ company_id: comid,time:date })
  // console.log(list);
  res.send({
    code: 200,
    list,
  })
})

router.get("/infovisitor", async (req, res) => {
  // console.log(req.query._id);
  let info =await Visitor.findOne(req.query).populate('company_id')
  // console.log(info);
  if(info){
    res.send({
      code: 200,
      info
    });
  }else{
    res.send({
      code:400,
      msg:"查询该访客失败"
    })
  }

});



router.post("/addmoment", async (req, res) => {
  console.log(req.body);
  await Moment.create(req.body);
  res.send({
    code: 200,
  });
})
// 新增：访客列表接口（支持分页和筛选）
router.get("/visitor/list", async (req, res) => {
  try {
    // console.log('获取访客列表请求参数:', req.query);
    const {
      page = 1,
      pageSize = 10,
      name = '',
      phone = '',
      visitType = ''
    } = req.query;

    // 构建查询条件
    let query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (phone) {
      query.phone = { $regex: phone, $options: 'i' };
    }
    // 根据访客类型进行筛选
    if (visitType) {
      query.role = visitType;
    }

    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 查询数据并关联企业信息
    const list = await Visitor.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'company',
          localField: 'company_id',
          foreignField: '_id',
          as: 'company',
          pipeline: [{ $project: { name: 1 } }]
        }
      },
      {
        $addFields: {
          companyName: { $arrayElemAt: ["$company.name", 0] },
          visitType: "$role" // 使用数据库中实际的role值
        }
      },
      { $sort: { time: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // 获取总数
    const total = await Visitor.countDocuments(query);

    res.send({
      code: 200,
      data: {
        list,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取访客列表失败:', error);
    res.send({
      code: 500,
      msg: '获取访客列表失败'
    });
  }
});

// 新增：专门为Info.vue页面添加访客的接口
router.post('/visitor/add', async (req, res) => {
  try {

    // 查找企业信息
    let info = await Company.findOne({ name: req.body.company });
    if (info) {
      // 创建访客记录
      const visitorData = {
        ...req.body,
        company_id: info._id,
        role: req.body.visitType || "访客" // 设置角色
      };

      await Visitor.create(visitorData);

      res.send({
        code: 200,
        msg: "添加成功"
      });
    } else {
      res.send({
        code: 400,
        msg: "该企业名称不存在"
      });
    }
  } catch (error) {
    console.error('添加访客失败:', error);
    res.send({
      code: 500,
      msg: "添加失败"
    });
  }
});

// 新增：访客单删接口
router.delete('/visitor/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Visitor.findByIdAndDelete(id);
    
    if (result) {
      res.send({
        code: 200,
        msg: '删除成功'
      });
    } else {
      res.send({
        code: 404,
        msg: '访客记录不存在'
      });
    }
  } catch (error) {
    console.error('删除访客失败:', error);
    res.send({
      code: 500,
      msg: '删除访客失败'
    });
  }
});

// 新增：访客批量删除接口
router.delete('/visitor/batchDelete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.send({
        code: 400,
        msg: '请提供要删除的记录ID'
      });
    }

    const result = await Visitor.deleteMany({
      _id: { $in: ids }
    });

    res.send({
      code: 200,
      msg: `成功删除 ${result.deletedCount} 条记录`
    });
  } catch (error) {
    console.error('批量删除访客失败:', error);
    res.send({
      code: 500,
      msg: '批量删除访客失败'
    });
  }
});

router.get("/moment", async (req, res) => {
  let list=await Moment.aggregate([
    // {$match:{}},
    {
        $lookup:{
            from:'employee',
            foreignField:"_id",
            localField:"user_id",
            as:"employee",
            pipeline:[{$project:{picture:1,name:1}}]
        }
    },
    {
        $lookup:{
            from:"visitor",
            localField:"user_id",
            foreignField:"_id",
            as:"visitor",
            pipeline:[{$project:{picture:1,name:1}}]
        }
    },
    {
        $addFields:{
            picture:{
                $cond:{
                    if:{$eq:["$type","员工"]},
                    then:{$arrayElemAt:["$employee.picture",0]},
                    else:{$arrayElemAt:["$visitor.picture",0]}
                }
            }
        }
    },
  ])
  // console.log(list);
  res.send({
    code: 200,
    list
  });
});

router.get("/moment", async (req, res) => {
  let list = await Moment.aggregate([
    // {$match:{}},
    {
      $lookup: {
        from: 'employee',
        foreignField: "_id",
        localField: "user_id",
        as: "employee",
        pipeline: [{ $project: { picture: 1, name: 1 } }]
      }
    },
    {
      $lookup: {
        from: "visitor",
        localField: "user_id",
        foreignField: "_id",
        as: "visitor",
        pipeline: [{ $project: { picture: 1, name: 1 } }]
      }
    },
    {
      $addFields: {
        picture: {
          $cond: {
            if: { $eq: ["$type", "员工"] },
            then: { $arrayElemAt: ["$employee.picture", 0] },
            else: { $arrayElemAt: ["$visitor.picture", 0] }
          }
        }
      }
    },
  ])
  // console.log(list);
  res.send({
    code: 200,
    list
  });
});


router.get("/comment", async (req, res) => {
  const { moment_id } = req.query
  // console.log(moment_id);
  let list = await Comment.aggregate([
    {
      $match: { moment_id: new mongoose.Types.ObjectId(moment_id) }
    },
    {
      $lookup: {
        from: 'employee',
        foreignField: '_id',
        localField: 'user_id',
        as: 'employee'
      }
    },
    {
      $lookup: {
        from: 'visitor',
        foreignField: '_id',
        localField: 'user_id',
        as: 'visitor'
      }
    },
    {
      $addFields: {
        user: {
          $cond: [
            { $eq: ['$type', '员工'] },
            { $arrayElemAt: ["$employee", 0] },
            { $arrayElemAt: ['$visitor', 0] }
          ]
        }
      }
    }
  ])

  // console.log(list,'list');

  let commentmap={}
  let toplevel=[]
  list.forEach(i=>{
    i.replies=[]
    commentmap[i._id.toString()]=i
    if(!i.pid){

      toplevel.push(i)
    }
  })
  list.forEach(i => {
    if (i.pid) {
      const pcomment = commentmap[i.pid.toString()]
      if (pcomment) {
        i.pname = pcomment.user.name
        pcomment.replies.push(i)

        // console.log(pcomment,'pcomment');
        
      }else{

        console.log(`${i._id}子评论找不到对应的父评论`);

      }
    }
  })

  // console.log(toplevel,'toplevel');
  // console.log(toplevel[0].replies[0].replies.length,999);

  
  res.send({
    code: 200,
    list: toplevel
  });
});


router.post("/addcomment", async (req, res) => {
  // console.log(req.body,'comment');
  await Comment.create(req.body);
  res.send({
    code: 200,
  });
  const wss=req.app.locals.wss
  const momentid=req.body.moment_id
  wss.broadcast(momentid,{type:'add'})
  console.log('add');
});

router.delete('/delcomment',async(req,res)=>{
  console.log(req.query._id);
  const {_id,moment_id}=req.query
  const didel=async(id)=>{
    let delcomments=await Comment.find({pid:id})
    console.log(delcomments);
    if(delcomments.length){
      for(let i of delcomments){
        await didel(i._id)
        console.log("删除了id为",i._id);
        
      }
    }
    await Comment.deleteOne({_id:id})
    console.log("删除了当前");

  }
  await didel(_id)
  res.send({
    code:200
  })  
  const wss=req.app.locals.wss
  const data={type:'del'}
  wss.broadcast(moment_id,data)
})

// 删除文章
router.delete('/delmoment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedMoment = await Moment.findByIdAndDelete(id);
    
    if (deletedMoment) {
      // 通知移动端
      socketManager.notifyArticleDeleted(id, deletedMoment.title || '文章');
      
      res.send({
        code: 200,
        msg: '删除成功'
      });
    } else {
      res.send({
        code: 404,
        msg: '文章不存在'
      });
    }
  } catch (error) {
    console.error('删除文章失败:', error);
    res.send({
      code: 500,
      msg: '删除失败'
    });
  }
});

// 新增：获取租户人员列表接口（支持分页和筛选）
router.get("/employee/list", async (req, res) => {
  try {
    console.log('获取租户人员列表请求参数:', req.query);
    const {
      page = 1,
      pageSize = 10,
      name = '',
      phone = '',
      companyName = '',
      role = ''
    } = req.query;

    // 构建查询条件
    let query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (phone) {
      query.phone = { $regex: phone, $options: 'i' };
    }
    if (role) {
      query.role = role;
    }

    console.log('查询条件:', query);

    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 聚合查询，关联企业信息
    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'company',
          localField: 'company_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $addFields: {
          companyInfo: { $arrayElemAt: ["$company", 0] }
        }
      }
    ];

    // 如果有企业名称筛选，添加到管道中
    if (companyName) {
      pipeline.push({
        $match: {
          'companyInfo.name': { $regex: companyName, $options: 'i' }
        }
      });
    }

    // 添加排序、分页
    pipeline.push(
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          sex: 1,
          phone: 1,
          sfz: 1,
          email: 1,
          weixin: 1,
          picture: 1,
          role: 1,
          companyName: '$companyInfo.name',
          companyType: '$companyInfo.type',
          inaddress: '$companyInfo.inaddress',
          house: '$companyInfo.house',
          outaddress: '$companyInfo.outaddress'
        }
      }
    );

    const list = await Employee.aggregate(pipeline);

    // 获取总数 - 需要重新构建管道来计算总数
    let countPipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'company',
          localField: 'company_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $addFields: {
          companyInfo: { $arrayElemAt: ["$company", 0] }
        }
      }
    ];

    if (companyName) {
      countPipeline.push({
        $match: {
          'companyInfo.name': { $regex: companyName, $options: 'i' }
        }
      });
    }

    countPipeline.push({ $count: "total" });

    const countResult = await Employee.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    console.log('查询结果:', { total, listLength: list.length });

    res.send({
      code: 200,
      data: {
        list,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取租户人员列表失败:', error);
    res.send({
      code: 500,
      msg: '获取租户人员列表失败'
    });
  }
});

// 新增：删除员工接口
router.delete('/employee/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('删除员工ID:', id);
    
    const result = await Employee.findByIdAndDelete(id);
    
    if (result) {
      // 通知移动端
      socketManager.notifyPersonDeleted(id, result.name);
      
      res.send({
        code: 200,
        msg: '删除成功'
      });
    } else {
      res.send({
        code: 404,
        msg: '员工记录不存在'
      });
    }
  } catch (error) {
    console.error('删除员工失败:', error);
    res.send({
      code: 500,
      msg: '删除员工失败'
    });
  }
});

// 新增：批量删除员工接口
router.delete('/employee/batchDelete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.send({
        code: 400,
        msg: '请提供要删除的记录ID'
      });
    }

    const result = await Employee.deleteMany({
      _id: { $in: ids }
    });

    res.send({
      code: 200,
      msg: `成功删除 ${result.deletedCount} 条记录`
    });
  } catch (error) {
    console.error('批量删除员工失败:', error);
    res.send({
      code: 500,
      msg: '批量删除员工失败'
    });
  }
});


module.exports = router
