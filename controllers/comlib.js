var fs = require('fs');
var path = require("path");
var uuid = require('node-uuid');
var crypto = require('crypto');

var com = {}

com.getPath = function () {
    const process = require('process');
    return process.cwd();
}

// 递归创建目录 异步方法  
com.mkdirs = function (dirname, callback) {
    let that = this;
    fs.exists(dirname, function (exists) {
        if (exists) {
            callback();
        } else {
            // console.log(path.dirname(dirname));  
            that.mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
                // console.log('在' + path.dirname(dirname) + '目录创建好' + dirname  +'目录');
            });
        }
    });
}

com.saveFile = function (data, dir, file) {
    this.mkdirs(dir, () => {
        fs.writeFile(dir + file, data, function (err) {
            console.error(err);
        });
    });
}

// 生成商店标识
com.getShopID = (comp, shop) => {
    return comp + "-" + shop;
}

// 生成通用唯一识别码UUID
com.newUUID = (useV1) => {
    if (useV1) return uuid.v1();
    else return uuid.v4();
}

// 查询列表中的值
com.getValueAt = (list, name) => {
    for (let id in list) {
        let item = list[id];
        if (item.name === name) {
            return item.value;
        }
    }
}

com.md5 = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

com.sha1 = (str) => {
    return crypto.createHash('sha1').update(str).digest('hex').toUpperCase();
}

// 获取配置参数
com.getConfig = (name, func) => {
    var fs = require('fs')
    fs.readFile('./config.json', function (err, data) {
        if (err) { console.log(err); if (func) func(); return }
        let json = JSON.parse(data.toString())//将二进制的数据转换为字符串再转换为json对象
        if (func) {
            if (name) {
                if (typeof name == 'object' || typeof name == 'array') {
                    let ret = {}
                    for (let i = 0; i < name.length; i++) {
                        ret[name[i]] = json[name[i]];
                    }
                    func(ret);
                } else {
                    func(json[name])
                }
            }
            else func(json)
        }
    })
}

// 设置配置参数值 conf: [{"k":"CompanyName","v":"公司名称"}]
com.setConfig = (conf, func) => {
    var fs = require('fs')
    fs.readFile('./config.json', function (err, data) {
        if (err) { console.log(err); if (func) func(err); return }
        let json = JSON.parse(data.toString())//将二进制的数据转换为字符串再转换为json对象
        Object.assign(json, conf);
        fs.writeFile('./config.json', JSON.stringify(json), func) //因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
    })
}

module.exports = com;