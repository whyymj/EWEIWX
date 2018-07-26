/**
 *
 * coupon\index\index.js
 *
 * @create 2017-02-04
 * @author 晚秋
 *
 * @update  晚秋 2017-02-06
 *
 */

var app = getApp();
var core = app.requirejs('core');
var fui = app.requirejs('foxui');
var parser = app.requirejs('wxParse/wxParse');

Page({
    data: {
        id: 0,
        detail: {}
    },
    onLoad: function (options) {
        this.setData({id: options.id});
        this.getDetail();
    },
    getDetail: function () {
        var $this = this;
        core.get('sale/coupon/getdetail', {id: this.data.id}, function (ret) {
            if(ret.error>0){
                wx.navigateBack();
            }else{
                parser.wxParse('wxParseData','html', ret.detail.desc,$this,'5');
                $this.setData({detail: ret.detail, show: true});
            }
        });
    },
    receive: function (e) {
        var detail=this.data.detail,$this=this;
        if(this.data.buying){
            fui.toast($this, "正在执行请稍后");
            return;
        }
        if(detail.canget!=1){
            fui.toast($this, detail.getstr);
            return;
        }
        var text = "确认使用";
        if(detail.money>0){
            text += detail.money+"元";
            if(detail.credit>0){
                text += "+";
            }
        }
        if(detail.credit>0){
            text += detail.credit+"积分";
        }
        text += detail.gettypestr+"吗？";

        core.confirm(text, function () {
            $this.setData({buying: true});
            core.post('sale/coupon/pay', {id: $this.data.id}, function (ret) {
                if(ret.error>0){
                    fui.toast($this, ret.message);
                    $this.setData({buying: false});
                    return;
                }
                $this.setData({logid: ret.logid});
                if(ret.wechat && ret.wechat.success){
                    core.pay(ret.wechat.payinfo,function (res) {
                        if (res.errMsg == "requestPayment:ok"){
                            $this.payResult()
                        }
                    });
                }else{
                    $this.payResult();
                }
                $this.setData({buying: false});
            });
        });
    },
    payResult: function () {
        var $this=this,text,url;
        core.get('sale/coupon/payresult', {logid: this.data.logid}, function (ret) {
            if(ret.error>0){
                fui.toast($this, ret.message);
                return;
            }

            if(ret.coupontype==0){
                wx.redirectTo({url: "/pages/sale/coupon/my/showcoupons2/index?id="+ret.dataid});
                return;
            }

            var url = "/pages/sale/coupon/my/index/index";
            if(ret.coupontype==1){
                url = "/pages/member/recharge/index";
            }

            core.confirm(ret.confirm_text, function () {
                wx.redirectTo({url: url});
            }, function () {
                wx.redirectTo({url: "/pages/sale/coupon/my/index/index"});
            })
        })
    }
})