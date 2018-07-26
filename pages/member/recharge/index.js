/**
 *
 * favorite\index.js
 *
 * @create 2017-01-09
 * @author 晚秋
 *
 * @update  Young 2017-01-18
 *
 */
var app=getApp(),core = app.requirejs('core'),$=app.requirejs('jquery');
Page({
    data: {
        disabled: true,
        coupon: {
            count: 0
        }
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        app.url(options);
        this.get_list();
    },
    onShow: function () {
        var coupon = app.getCache("coupon");
        this.setData({"coupon.id": coupon.id, "coupon.name": coupon.name||''});
    },
    get_list: function () {
        var $this=this;
        core.get('member/recharge',{},function (json) {
            json.show = true;
            $this.setData(json)
        });
    },
    toggle: function (e) {
        var data = core.pdata(e),id=data.id,type=data.type,d={};
        (id == 0 || typeof id =='undefined') ? d[type] = 1 : d[type] = 0;
        this.setData(d);
    },
    money: function (e) {
     
      var disabled = true, money = $.trim(e.detail.value), $this = this;
      if (money>=this.data.minimumcharge){
            disabled = false;
        }
        core.get('sale/coupon/query',{type:1, money: money},function (ret) {
            $this.setData({money: money,disabled:disabled, coupon: {id:0,name:'',count:ret.count}});
        });
    },
    submit: function () {
        var money = $.toFixed(this.data.money,2),data={};
        if (this.data.disabled){
            return;
        }
        if (typeof money == 'undefined' || isNaN(money)){
            core.alert('请填写正确的充值金额!');
            return;
        }
        if (money<=0 || this.data.disabled){
            core.alert('最低充值金额为'+this.data.minimumcharge+'元!');
            return;
        }
        data.money = money;
        data.type = 'wechat';
        data.couponid = this.data.coupon.id;
        core.post('member/recharge/submit',data,function (json) {
            if (json.error==0){
                if (json.wechat.success){
                    core.pay(json.wechat.payinfo,function (res) {
                        if (res.errMsg == "requestPayment:ok"){
                            core.post('member/recharge/wechat_complete',{logid:json.logid},function (js) {
                                if (js.error==0){
                                    wx.navigateBack();
                                }else{
                                    core.alert(js.message);
                                }
                            },true)
                        }
                    })
                }else{
                    core.alert(list.wechat.payinfo.message + '\n不能使用微信支付!')
                }
            }else{
                core.alert(json.message);
            }
        },true);
    }
});