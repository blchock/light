/**
 * Class Name: 通用配置页面
 * Author: Bl.Chock
 * Update time: 2020年6月25日 17:41:35
 */
var Page = require('../models/Page');
var com = require("./comlib");
var i18n = require('i18n');
var axios = require('axios');
var fs = require('fs');

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

var accessTokenJson = {
    access_token: '',
    expires_time: 0
}
var config_nonceStr = '' //随机字符串
var config_timestamp = '' //时间戳

/*获取token*/
function getToken(APP_ID, APP_SECRET) {
    return new Promise((resolve, reject) => {
        //获取当前时间 
        var currentTime = new Date().getTime();
        if (accessTokenJson.access_token === '' || accessTokenJson.expires_time < currentTime) {
            axios.get('https://api.weixin.qq.com/cgi-bin/token', {
                params: {
                    appid: APP_ID,
                    secret: APP_SECRET,
                    grant_type: 'client_credential'
                }
            }).then(res => {
                accessTokenJson.access_token = res.data.access_token;
                accessTokenJson.expires_time = new Date().getTime() + (parseInt(res.data.expires_in) - 200) * 1000;
                resolve(accessTokenJson.access_token)
            }).catch(err => {
                return Promise.reject(err);
            })
        } else {
            resolve(accessTokenJson.access_token)
        }
    })
}

/* 通过token，获取jsapi_ticket */
function getTicket(accessToken) {
    return new Promise((resolve, reject) => {
        axios.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket', {
            params: {
                type: 'jsapi',
                access_token: accessToken
            }
        }).then(res => {
            resolve(res.data.ticket);
        }).catch(err => {
            return Promise.reject(err);
        })
    })
}

/* 生成随机字符串 */
function createNonceStr() {
    return Math.random().toString(36).substr(2, 15);
}

/* 获取当前时间戳 */
function createTimestamp() {
    return parseInt(new Date().getTime() / 1000) + '';
}

/* 排序拼接 */
function raw(args) {
    let keys = Object.keys(args).sort(); //获取args对象的键值数组,并对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）
    let newArgs = {}
    keys.forEach(key => {
        newArgs[key.toLowerCase()] = args[key];
    })
    let string = '';
    for (let k in newArgs) {// 循环新对象，拼接为字符串
        string += `&${k}=${newArgs[k]}`
    }
    string = string.substr(1)// 截取第一个字符以后的字符串（去掉第一个'&'）
    return string;
}

/**
 * 签名算法
 * @param ticket 用于签名的 jsapi_ticket
 * @param url 用于签名的 url ，注意必须动态获取
 * @return sha1算法加密的字符串
 */
function signature(ticket, url) {
    config_nonceStr = createNonceStr() // 生成随机字符串
    config_timestamp = createTimestamp() // 获取当前时间戳
    let ret = {
        jsapi_ticket: ticket,
        nonceStr: config_nonceStr,
        timestamp: config_timestamp,
        url: url,
    }
    var string = raw(ret) // 排序拼接为字符串
    console.log(string)
    return com.sha1(string) // 返回sha1加密的字符串
}
/**
 * 获取微信配置Config
 * @param {*} req 
 * @param {*} res 
 */
exports.getWxConfig = (req, res) => {
    let url = req.query.url;  // 获取url
    com.getConfig(['app_id', 'app_secret'], (data) => {
        getToken(data.app_id, data.app_secret).then(getTicket).then(ret => {
            res.json({ // 返回前端需要的配置config
                code: 1,
                msg: 'success',
                data: {
                    appid: data.app_id,
                    signature: signature(ret, url),
                    timestamp: config_timestamp,
                    nonceStr: config_nonceStr
                }
            })
        })
    })
}

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
                    // console.log("#TEST:", args);
                    res.render('page', args);
                }
                else res.render('mvcerror', ret);
            });
        })
    } else {
        res.render('mvcerror', { msg: 'code and version and orgId is necessary', data: '' });
    }
}
