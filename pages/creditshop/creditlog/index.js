var app = getApp();
var core = app.requirejs('core');
var $ = app.requirejs('jquery');


// pages/integral/my/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      page:1,
      list:{},
      total:0,
      load:true,
      more:true,
      notgoods:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
        var $this = this;
        $this.get_list();
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
  
  },
  get_list: function (onpage){
    var $this = this;
    core.post('creditshop/creditlog/getlist',{page:$this.data.page},function(msg){
        $this.setData({total:msg.credit});
        if( !onpage ){
          $this.setData({ list: msg.list });
        }else{
          //如果是翻页的话则追加
          msg.list = $this.data.list.concat(msg.list );
          $this.setData({ list: msg.list });
        }

        if( msg.total == 0 ){
          $this.setData({ notgoods:false});
        }else{
          $this.setData({ notgoods: true });
        }


        if( msg.pagesize >= msg.next_page ){
          $this.setData({ more: false });
        }else{
          $this.setData({ more: true });
        }


    });
  },

  onReachBottom: function (e) {
    this.setData({ page: this.data.page + 1, load: false });
    this.get_list(true);
    this.setData({ load: true });
  },

})