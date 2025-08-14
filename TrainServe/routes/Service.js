const {
  Company,
  Employee,
  Visitor,
  Moment,
  Comment,
} = require("../models/database");
const mongoose = require("mongoose");
var express = require("express");
var multiparty = require("multiparty");
var router = express.Router();
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

router.use(
  "/",
  createProxyMiddleware({
    target: "https://restapi.amap.com",
    changeOrigin: true,
    pathRewrite: (path) => {
      const sec = process.env.AMAP_SECURITY_CODE || "";
      const joiner = path.includes("?") ? "&" : "?";
      return sec ? `${path}${joiner}jscode=${sec}` : path;
    },
    onProxyRes(proxyRes) {
      console.log("上游响应(_AMapService", proxyRes.statusCode);
    },
    onError(err, req, res) {
      console.error("代理错误(_AMapService)", err?.message);
      res.status(502).send("AMapService proxy failed");
    },
    selfHandleResponse: false,
  })
);



module.exports = router;
