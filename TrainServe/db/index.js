const mongoose = require("mongoose");

// 建立数据库连接
mongoose
  .connect(
    "mongodb+srv://mariadigo45566:sJj2QDWGxaBpltgW@cluster0.ke8hvn6.mongodb.net/OnlineTraining"
  )
  .then((res) => {
    //链接后面改成OnlineTraining
    console.log("连接成功,端口号3008");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = mongoose;
