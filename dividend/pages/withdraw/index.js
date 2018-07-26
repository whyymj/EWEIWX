var app = getApp();
var core = app.requirejs('/core');
var $ = app.requirejs('jquery');
Page({
  data: {

  },
  onLoad: function (options) {
    var $this = this;
    var isIpx = app.getCache('isIpx');
    if (isIpx) {
      $this.setData({
        isIpx: true,
      })
    } else {
      $this.setData({
        isIpx: false,
      })
    }
    core.get('dividend/withdraw', '', function (res) {
      $this.setData({ msg: res })
    })
  },
  onShow: function (options) {
    var $this = this;
    core.get('dividend/withdraw', '', function (res) {
      $this.setData({ msg: res })
    })
  },
  // 提现
  submit: function(e){
    var price = e.currentTarget.dataset.price;
    if(price <= 0){
      return
    }
    wx.navigateTo({
      url: '/dividend/pages/apply/index'
    })
  }
})