var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var i18n = require('i18n');

var indexRouter = require('./routes/index');
var com = require("./controllers/comlib");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
i18n.configure({
  locales: ['en-US', 'zh-CN', 'zh-CHT'],  // setup some locales - other locales default to en_US silently
  defaultLocale: 'zh-CN',
  directory: __dirname + '/locales',
  updateFiles: false,
  indent: "\t",
  extension: '.json'
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/en', express.static(__dirname + '/www'));
// app.use('/de', express.static(__dirname + '/www'));

///////////////////////////////////// init /////////////////////////////////////
// 设置全局对象
app.locals.t = function(key){
  return i18n.__(key);
};
// 初始化语言
com.getConfig('language',(lang) => {
  i18n.setLocale(lang);
});

////////////////////////////////////////////////////////////////////////////////

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
