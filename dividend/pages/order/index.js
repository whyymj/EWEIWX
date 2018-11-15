var app = getApp();
var core = app.requirejs('/core');
var $ = app.requirejs('jquery');
Page({
  data: {
    list: [],
    page: 1,
    status: 'all',
    loading: false
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  // 跳转到快速购买
  goIndex: function(){
    wx.navigateTo({
      url: '/pages/quickbuy/index',
    })
  },
  
  onLoad: function () {
    var $this = this;
    var args = {page: 1}
    $this.getlist(args)
  },

  tab: function(e){
    var status = e.currentTarget.dataset.status, 
        args = { page: 1, status: status == 'all' ? '' : status };
    this.setData({ status: status, list:[]})
    this.getlist(args)
  },

  // 上拉加载
  onReachBottom: function () {
    var $this = this, page = $this.data.page, status = $this.data.status;
    var args = { page: page, status: status }
    $this.getlist(args)
  },

  getlist: function (args) {
    var $this = this;
    $this.setData({ loading: true })
    core.get('dividend/order', args, function (res) {
      if (res.error == 0) {
        if (res.list.length > 0) {
          var orderlist = $this.data.list.concat(res.list);
          args.page = args.page + 1;
        }
        wx.setNavigationBarTitle({
          title: res.textdividend+'订单' || '分红订单'
        });
        $this.setData({ member: res.member, list: orderlist, loading: false, total: res.total, page: args.page, stop: false, ordercount: res.ordercount, textyuan: res.textyuan, textdividend: res.textdividend })
      }
    })
  }
})
