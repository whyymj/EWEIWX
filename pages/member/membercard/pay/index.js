/**
 *
 * order/pay/index.js
 *
 * @create 2017-1-5
 * @author Young
 *
 * @update  Young 2017-01-10
 *
 */
var app = getApp();
var core = app.requirejs('core');
var foxui = app.requirejs('foxui');
Page({
    data: {
        icons:app.requirejs('icons'),
        success:false,
        successData:{},

        coupon: false,
        show: true
    },
    onLoad: function (options) {
        var $this = this;
        this.setData({
            options: options
        });
    },
    onShow:function () {
        this.get_list();
    },
    get_list:function () {
        var $this=this;
        this.setData({ order_id: $this.data.options.order_id});
        core.post('membercard.order.pay', { order_id: $this.data.options.order_id}, function (res) {
            console.error(res)
            
            if( res.error == 1 ){
              core.alert(res.message);
            }
            $this.setData({ wechat: res.wechat, credit: res.credit, order: res.order, show: true })
            return
        });
    },
    pay: function (e) {
        var type = core.pdata(e).type,$this=this,wechat = this.data.wechat;
        if (type == 'wechat') {
          core.pay(wechat.payinfo,function (res) {
                if (res.errMsg == "requestPayment:ok"){
                    $this.complete(type)
                }
            });
        } else if (type == 'credit') {
            core.confirm('确认要支付吗?', function () {
                $this.complete(type)
            }, function () {
            })
        } else {
            $this.complete(type)
        }
    },
    complete: function (type) {
        var $this = this;
        core.post('membercard/order/complete', {id: $this.data.order.id, type: type}, function (ret) {
          if(ret.error != 0){
            foxui.toast($this, ret.message)
            return
          }
          if (ret.error == 0) {
                wx.setNavigationBarTitle({title: '支付成功'});
                $this.setData({
                    success: true,
                    pay_type: ret.type,
                    pay_fee: ret.fee,
                    orderno: ret.orderno,
                    pay_msg: ret.msg
                });
            }
            foxui.toast($this, ret.msg)
            setTimeout(function(){
              wx.reLaunch({
                url: '/pages/member/membercard/index?cate=my',
              })
            },500)
        }, true, true)
    }
});