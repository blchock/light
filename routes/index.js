var express = require('express');
var router = express.Router();
var page = require('../controllers/PageController');

// 渲染index
router.get('/', page.renderIndex);
// 渲染page
router.get('/page', page.renderPage);
// 修改语言
router.get('/set-language', page.setLanguage);
// 获取微信配置
router.get('/wxconfig', page.getWxConfig);

module.exports = router;
