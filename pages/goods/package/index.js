/**
 *
 * package\index.js
 *
 * @create 2017-11-22
 * @author 牟俊羽
 *
 */
  var app = getApp();
  var core = app.requirejs('core');
  var icons = app.requirejs('icons');
  var $ = app.requirejs('jquery');
  Page({
  /**
   * 页面的初始数据
   */
  data: {
    show:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var $this =this;
    core.get('package.get_list', { goodsid: options.id }, function (result) {
      console.log(result.list)
      $this.setData({
        list: result.list
      })
    });
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