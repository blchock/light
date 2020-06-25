/**
 * Class Name: 通用配置数据
 * Author: Bl.Chock
 * Update time: 2020年6月25日 19:25:03
 */
var com = require("../controllers/comlib");
var mysql = require('mysql');

var Page = {}
var config = undefined;
com.getConfig(undefined, (data) => {
    config = {
        host: data.mysql_host,
        port: data.mtsql_port,
        user: data.mysql_username,
        password: data.mysql_password,
        database: data.mysql_db,
        table: data.mysql_table
    };
})

/**
 * Mysql查询
 * @param {String} sql SELECT * FROM websites
 * @param {Function} callback 
 */
Page.Query = function (sql, callback) { //执行查询
    if (config) {
        var connection = mysql.createConnection(config);
        connection.connect();
        console.log("#query sql:", sql);
        connection.query(sql, function (error, results, fields) {
            if (error) {
                callback({ code: -1, msg: "query sql error", data: error });
                return;
            }
            callback({ code: 0, msg: "query sucess", data: results });
        });
        connection.end();
    }
}

/**
 * Mysql更新
 * @param {String} sql 'INSERT INTO websites(Id,name,url,alexa,country) VALUES(0,?,?,?,?)';
 * @param {Array} argsArr ['菜鸟工具', 'https://c.runoob.com','23453', 'CN'];
 * @param {Function} callback 
 */
Page.Update = function (sql, argsArr, callback) { //执行查询
    if (config) {
        var connection = mysql.createConnection(config);
        connection.connect();
        connection.query(sql, argsArr, function (error, results, fields) {
            if (error) {
                callback({ code: -1, msg: "update sql error", data: error });
                return;
            }
            callback({ code: 0, msg: "update sucess", data: results });
        });
        connection.end();
    }
}

/**
 * 匹配页面数据
 * @param {String} code 页面code
 * @param {Number} version 页面版本
 * @param {Number} orgId 企业ID
 * @param {Function} callback 回调函数
 */
Page.MatchingPage = function (code, version, orgId, callback) {
    if (config) this.Query(`select * from ${config.table} where is_active=1 and code='${code}' and version=${version} and org_id=${orgId}`, callback);
    else callback({ code: -1, msg: "not found sql config!" });
}

module.exports = Page;

