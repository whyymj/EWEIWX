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
    data: {},
    onLoad: function (options) {
        this.setData({id: options.id});
        this.getDetail();
    },
    getDetail: function () {
        var $this = this;
        core.get('sale/coupon/my/getdetail', {id: this.data.id}, function (ret) {
            if(ret.error>0){
                wx.navigateBack();
            }else{
                parser.wxParse('wxParseData','html', ret.detail.desc,$this,'5');
                $this.setData({detail: ret.detail, show: true});
            }
        });
    },
    receive: function (e) {
        var detail = this.data.detail,url;
        if(detail.coupontype==0){
            wx.switchTab({
                url: '/pages/index/index'
            })
            return;
        }
        else if(detail.coupontype==1){
            url = "/pages/member/recharge/index";
        }
        else if(detail.coupontype==2){
            url = "/pages/sale/coupon/my/index";
        }
        wx.redirectTo({url: url});
    }
})