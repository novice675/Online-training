var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

// 确保数据库连接在应用启动时建立
require('./db');

// MongoDB监听服务
const mongoWatcher = require('./services/mongoWatcher');

const RbacRouter = require('./routes/RBACinit')
const LCY = require('./routes/LCY')
const LCYping = require('./routes/LCYping')
const LCYchat = require('./routes/LCYchat')
const WYQ = require('./routes/WYQ')

const Service=require('./routes/Service')

const Menjin = require('./routes/Menjin')
const HeTong = require('./routes/HeTong')
const KeHu = require('./routes/KeHu')
const Vehicle = require('./routes/Vehicle')
const Upload = require('./routes/upload')
const ZuHuXinXi = require('./routes/ZuHuXinXi')
const Building = require('./routes/Building')
const House = require('./routes/House')
const TenantBill = require('./routes/TenantBill')
const OperationOverview = require('./routes/OperationOverview')
const MongoStatus = require('./routes/mongoStatus')



var app = express();

app.use(cors());
app.use('/_AMapService',Service)
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/upload', express.static(path.join(__dirname, 'upload')));

app.use('/', RbacRouter);
app.use('/LCY',LCY)
app.use('/LCYping',LCYping)
app.use('/LCYchat',LCYchat)
app.use('/WYQ',WYQ)
app.use('/menjin',Menjin)
app.use('/hetong', HeTong)
app.use('/kehu', KeHu)
app.use('/vehicle',Vehicle)
app.use('/upload', Upload)
app.use('/zuhuxinxi', ZuHuXinXi)
app.use('/Building', Building)
app.use('/House', House)
app.use('/tenantbill', TenantBill)
app.use('/operation', OperationOverview)
app.use('/mongo', MongoStatus)


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// 启动MongoDB监听服务
async function startMongoWatcher() {
  try {
    await mongoWatcher.connect();
    await mongoWatcher.startWatching();
    console.log('✅ MongoDB监听服务已启动');
  } catch (error) {
    console.error('❌ 启动MongoDB监听服务失败:', error);
  }
}

// 应用启动后启动监听服务
setTimeout(startMongoWatcher, 2000); // 延迟2秒启动，确保数据库连接稳定

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('🛑 正在关闭应用...');
  await mongoWatcher.stopWatching();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 正在关闭应用...');
  await mongoWatcher.stopWatching();
  process.exit(0);
});

module.exports = app;

