/**
 * Class Name: 通用配置页面
 * Author: Bl.Chock
 * Update time: 2020年6月25日 17:41:35
 */
var Page = require('../models/Page');
var com = require("./comlib");
var i18n = require('i18n');

/**
 * 切换语言
 * @param {String} lang 语言类型：'en-US', 'zh-CN', 'zh-CHT'
 */
exports.setLanguage = (req, res) => {
    let lang = req.query.lang;
    let rep = { cn: 'zh-CN', en: 'en-US', oth: 'zh-CHT' }
    if (rep[lang]) lang = rep[lang];
    com.setConfig({ language: lang }, () => {
        i18n.setLocale(lang);
        res.json(`Set Language to:${lang}`);
    });
};

/**
 * 渲染页面
 * @param accessToken 授权请求头（可选）
 * @param accessToken 授权请求头（可选）
 */
exports.renderPage = (req, res) => {
    var params = req.query;
    if (params.code && params.version && params.orgId) {
        com.getConfig("language", (language) => {
            var args = { language: language }
            Page.MatchingPage(params.code, params.version, params.orgId, (ret) => {
                if (ret.code === 0 && ret.data.length > 0) {
                    var thisPage = ret.data[0];
                    args = Object.assign(args, params, thisPage);
                    args.params = JSON.stringify(params);
                    console.log("#TEST:", args);
                    res.render('page', args);
                }
                else res.render('mvcerror', ret);
            });
        })
    } else {
        res.render('mvcerror', { msg: 'code and version and orgId is necessary', data: '' });
    }
}
