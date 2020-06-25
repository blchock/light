/**
 * 函数内容都写在这里，然后使用下面的工具压缩后存储到json中
 * https://c.runoob.com/front-end/51
 */

//////////////////////////////////// created ////////////////////////////////////

//////////////////////////////////// mounted ////////////////////////////////////

() => {
    console.log('begin test..');
    wx.ready(function () {
        console.log('begin test2');
        wx.checkJsApi({
            jsApiList: ['scanQRCode', 'chooseImage'],
            success: function (res) {
                console.log(res)
            }
        });
    })
};

//////////////////////////////////// func ////////////////////////////////////

