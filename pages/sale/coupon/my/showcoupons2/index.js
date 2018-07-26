/**
 *
 * coupon\my\index\index.js
 *
 * @create 2017-02-07
 * @author 晚秋
 *
 * @update  晚秋 2017-02-07
 *
 */

var app = getApp();
var core = app.requirejs('core');
var parser = app.requirejs('wxParse/wxParse');

Page({
    data: {
        approot: app.globalData.approot
    },
    onLoad: function (options) {
        this.setData({id: options.id});
        this.getDetail();
    },
    getDetail: function (e) {
        var $this = this;
        core.get('sale/coupon/my/showcoupon2', {id: this.data.id}, function (ret) {
            if(ret.error>0){
                wx.redirectTo({
                    url: '/pages/sale/coupon/my/index/index'
                })
            }else{
                parser.wxParse('wxParseData','html', ret.detail.desc,$this,'5');
                $this.setData({detail: ret.detail, goods: ret.goods, show: true});
            }
        });
    }
})