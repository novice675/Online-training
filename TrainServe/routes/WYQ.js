const {Company,Employee,Visitor,Moment}=require('../models/database')
const mongoose=require('mongoose')
var express = require('express')
var multiparty=require('multiparty')
var router = express.Router()
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
router.post('/comupload',(req,res)=>{
    console.log(req.body);
    const form=new multiparty.Form()
    form.uploadDir='upload'
    form.parse(req,(err,fields,files)=>{
        console.log(err,fields,files,3);
        let url="http://localhost:3008/"+files.file[0].path.replace("\\","/")
        console.log(url,'url');
        res.send({
            code:200,
            url:url
        })
    })
})

// addcom_em
router.post('/addcomem',async(req,res)=>{
    console.log(req.body)
    await Employee.create(req.body)
    res.send({
        code:200,
        msg:"添加成功"
    })
})

// upload,addcomem
router.post('/uploadcomem',async(req,res)=>{
    console.log(req.body)
    let form=new multiparty.Form()
    form.uploadDir='upload'
    form.parse(req,(err,fields,files)=>{
        // console.log(err,fields,files,2);
        let url='http://localhost:3008/'+files.file[0].path.replace('\\','/')
        console.log(url,'url');
        res.send({
            code:200,
            url
        })
    })
})

// add访客
router.post('/addvisitor',async(req,res)=>{
    console.log(req.body)
    let info=await Company.findOne({name:req.body.company})
    if(info){
        console.log(1);
        
        await Visitor.create({...req.body,company_id:info._id})
        res.send({
            code:200,
            msg:"添加成功"
        })
    }else{
        res.send({
            code:400,
            msg:"该企业名称不存在",
        })
    }
})

router.get("/company", async (req, res) => {
  console.log(2); // 输出查询参数
  const list = await Company.find(
    req.query.name ? { name: req.query.name } : {}
  );
  res.send({
    code: 200,
    list,
  });
});

router.get("/comitem", async (req, res) => {
    console.log(req.query); // 输出查询参数
    const {_id}=req.query
    console.log(_id);
    
    const item = await Company.findOne(req.query)
    console.log(item);
    
    res.send({
      code: 200,
      item,
    });
  });

module.exports = router