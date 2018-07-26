var app = getApp();
var core = app.requirejs('core');
var icons = app.requirejs('icons');
var foxui = app.requirejs('foxui');
var parser = app.requirejs('wxParse/wxParse');
var $ = app.requirejs('jquery');

// pages/creditshop/verify/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      eno:0,
      qrcode:'',
      logid:0,
      options:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var $this = this;
    options = options || {};
    wx.getSystemInfo({
      success: function (result) {
        $this.setData({
          windowWidth: result.windowWidth,
          windowHeight: result.windowHeight
        });
      }
    });
    $this.setData({ options: options, logid:options.id});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var $this = this;
    // var specs = [];
    // var options = [];
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
    $this.getDetail();
    /*获取授权*/
    wx.getSetting({
      success: function (res) {
        var limits = res.authSetting['scope.userInfo'];
        $this.setData({ limits: limits })
      }
    })
  },
  getDetail:function(id){
    var $this = this;
    core.get('creditshop/exchange/qrcode', { id: $this.data.logid},function(msg){
      $this.setData({eno:msg.eno,qrcode:msg.qrcode});
    })
  }
})