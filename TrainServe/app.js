var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

const RbacRouter = require('./routes/RBACinit')
const LCY = require('./routes/LCY')
const LCYchat = require('./routes/LCYchat')
const WYQ = require('./routes/WYQ')
const Menjin = require('./routes/Menjin')
const HeTong = require('./routes/HeTong')
const KeHu = require('./routes/KeHu')
const Vehicle = require('./routes/Vehicle')
const Ping = require('./routes/Ping')
const ZuHuXinXi = require('./routes/ZuHuXinXi')



var app = express();

app.use(cors());

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
app.use('/LCYchat',LCYchat)
app.use('/WYQ',WYQ)
app.use('/menjin',Menjin)
app.use('/hetong', HeTong)
app.use('/kehu', KeHu)
app.use('/vehicle',Vehicle)
app.use('/ping', Ping)
app.use('/zuhuxinxi', ZuHuXinXi)


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
module.exports = app;

