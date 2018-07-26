var app = getApp();
var core = app.requirejs('core');
var foxui = app.requirejs('foxui');
Page({
  data: {
    list: [
      
    ],
    indicatorDots: false,
    autoplay: false,
    current: 0,
    
    modal: false,
  },

  onLoad: function(options){
    var $this = this, args = {cate: options.cate};
    var isIpx = app.getCache('isIpx');
    if (isIpx) {
      $this.setData({
        isIpx: true,
        iphonexnavbar: 'fui-iphonex-navbar'
      })
    } else {
      $this.setData({
        isIpx: false,
        iphonexnavbar: ''
      })
    }
    $this.setData({ options: options })
    if(options.id){
      args.id = options.id;
      args.page = options.page;
      $this.setData({id: options.id})
    }
    $this.getlist(args)
  },

  // submit: function(){
  //   this.setData({ modal: false})
  // },

  swiperchange: function(e){
    this.setData({ current: e.detail.current})
  },
  getlist: function(args){
    var $this = this;
    core.get('membercard.detail', args, function(res){
      if(res.error == 0){
        if (args.id){
          for(var i in res.list){
            if (args.id == res.list[i].id){
              $this.setData({ current: i})
            }
          }
        }
        $this.setData({list: res.list})
      }
    })
  },

  // 购买
  submit: function(e){
    var data = e.currentTarget.dataset,$this = this;
    console.error(data)
    if (data.startbuy == -1) {
      return
    }
    if (data.stock == '0') {
      foxui.toast($this, '库存不足');
      return
    }
    core.post('membercard.order.create_order', { id: data.id }, function(res){
      if (res.error != 0) {
        foxui.toast($this, res.message);
        return;
      }
      wx.navigateTo({
        url: '/pages/member/membercard/pay/index?order_id=' + res.order.order_id
      })
    }) 
  },

  // 领取每月优惠券
  coupon: function(e){
    var $this = this, data = e.currentTarget.dataset, current = $this.data.current, list = $this.data.list, options = $this.data.options, arg = { cate: options.cate };
    var args = { id: data.id, couponid: data.couponid }
    if (data.issend){
      return
    }
    if (options.id) {
      arg.id = options.id;
    }

    core.post('membercard.get_month_coupon', args, function(res){
      if(res.error == 0){
        foxui.toast($this, '领取成功')
        for (var i in list[current].month_coupon) {
          if (data.couponid == list[current].month_coupon[i].id) {
            list[current].month_coupon[i].isget_month_coupon = true
            $this.setData({list: list})
          }
        }
      }else{
        foxui.toast($this, res.message)
      }
    })
  },

  // 领取每月积分
  credit: function (e) {
    var $this = this, data = e.currentTarget.dataset, list = $this.data.list, current = $this.data.current,options = $this.data.options, arg = { cate: options.cate };
    var args = { id: data.id }
    if (data.iscredit) {
      return
    }
    core.post('membercard.get_month_point', args, function (res) {
      if (res.error == 0) {
        foxui.toast($this, '领取成功')
        list[current].isget_month_point = 1;
        $this.setData({list: list})
      } else {
        foxui.toast($this, res.message)
      }
    })
  }
})