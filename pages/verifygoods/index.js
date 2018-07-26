// pages/verifygoods/index.js
var app = getApp(), core = app.requirejs('core'), $ = app.requirejs('jquery');
Page({

  /**
   * 页面的初始数据
   */
  data: {
      list:[],
      page:1,
      cate: '',
      loaded: false,
      loading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.get_list();
  },
  get_list: function () {
    var $this = this;
    $this.setData({ loading: true });
    core.get('verifygoods/get_list', { page: $this.data.page, cate: $this.data.cate }, function (result) {
      var data = { loading: false, total: result.total, show: true };
      if (!result.list) {
        result.list = [];
      }
      if (result.list.length > 0) {
        data.page = $this.data.page + 1;
        data.list = $this.data.list.concat(result.list);
        if (result.list.length < result.pagesize) {
          data.loaded = true
        }
      }
      $this.setData(data);
    });
  },
  selected:function(e){
    var $this = this;
    var cate = e.currentTarget.dataset.cate;
    $this.setData({ cate: cate, page: 1, list: [], loading: true});
    this.get_list();
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  onReachBottom: function () {
    if (this.data.loaded || this.data.list.length == this.data.total) {
      return;
    }
    this.getList();
  }
})