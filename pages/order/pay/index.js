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

        coupon: false
    },
    onLoad: function (options) {
        var $this = this, goodslist = {};
        this.setData({
            options: options
        });
        app.url(options);
    },
    onShow:function () {
        this.get_list();
    },
    get_list:function () {
        var $this=this;
        core.get('order/pay', $this.data.options, function (list) {
            if (list.error == 50018) {
                wx.navigateTo({
                    url: '/pages/order/details/index?id='+$this.data.options.id
                });
                return;
            }
            if (!list.wechat.success && list.order.price != '0.00' && list.wechat.payinfo){
                core.alert(list.wechat.payinfo.message + '\n不能使用微信支付!');
            }
            $this.setData({
                list: list,
                show:true
            });
        });
    },
    pay: function (e) {
        var $this = this;
        var type = core.pdata(e).type,$this=this,wechat = this.data.list.wechat;
        core.post('order/pay/checkstock', { id: $this.data.options.id }, function (check_json) {
        if (check_json.error != 0) {
          foxui.toast($this, check_json.message);
          return;
        }
        if (type == 'wechat') {
          core.pay(wechat.payinfo, function (res) {
            if (res.errMsg == "requestPayment:ok") {
              $this.complete(type)
              // $this.setData({coupon: true})
            }
          });
        } else if (type == 'credit') {
          core.confirm('确认要支付吗?', function () {
            $this.complete(type)
            // $this.setData({ coupon: true })
          }, function () {
          })
        } else if (type == 'cash') {
          core.confirm('确认要使用货到付款吗?', function () {
            $this.complete(type)
            // $this.setData({ coupon: true })
          }, function () {
          })
        } else {
          $this.complete(type)
          // $this.setData({ coupon: true })
        }
      }, true, true) 
    },
    complete: function (type) {
        var $this = this;
        core.post('order/pay/complete', {id: $this.data.options.id, type: type}, function (pay_json) {
            if (pay_json.error == 0) {
                wx.setNavigationBarTitle({title: '支付成功'});
                var ordervirtualtype = Array.isArray(pay_json.ordervirtual);
                $this.setData({
                    success: true,
                    successData: pay_json,
                    order: pay_json.order,
                    ordervirtual: pay_json.ordervirtual,
                    ordervirtualtype
                });
                return
            }
            foxui.toast($this,pay_json.message)
        }, true, true)
    },
    shop:function(e){
        var send = core.pdata(e).id;
        if(send==0){
            this.setData({ shop:1 });
        }else{
            this.setData({ shop:0 });
        }
    },
    phone:function(e){
        core.phone(e);
    },

    closecoupon: function(){
      this.setData({ coupon: false})
    }
});