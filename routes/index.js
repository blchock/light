var express = require('express');
var router = express.Router();
var page = require('../controllers/PageController');

// 渲染page
router.get('/page', page.renderPage);
// 修改语言
router.get('/set-language', page.setLanguage);

module.exports = router;
