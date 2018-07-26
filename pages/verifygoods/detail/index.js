// pages/verifygoods/detail/index.js
var app = getApp(), core = app.requirejs('core'), $ = app.requirejs('jquery');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    verifygoods:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: options
    });
    app.url(options);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.get_detail();
  },
  get_detail: function () {
    var $this = this;
    core.get('verifygoods/get_detail', $this.data.options, function (result) {
      if (result.error == 0) {
        console.log(result);
        $this.setData({ verifygoods: result.item,store:result.store,canverify:result.canverify,canverify_message:result.canverify_message, qrcode: result.qrcode, verifygoodlogs: result.verifygoodlogs, verifynum: result.verifynum, limitdatestr: result.limitdatestr, verifycode: result.verifycode })
      } else {
        if (result.error != 50000) {
          core.toast(result.message, 'loading');
        }
        wx.redirectTo({
          url: '/pages/verifygoods/index'
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})