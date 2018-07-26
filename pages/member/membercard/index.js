var app = getApp();
var core = app.requirejs('core');
var foxui = app.requirejs('foxui');
Page({
  data: {
    page: 1,
    cate: 'all',
    list:[]
  },
  onLoad: function (options) {
    var $this = this;
    $this.setData({options: options,cate: options.cate})
    if (options.hasmembercard == 'true') {
      $this.setData({ cate: 'my' })
    }
    console.error(options)
    $this.get_list()
  },

  tab: function(e){
    var $this = this;
    $this.setData({ cate: e.currentTarget.dataset.cate,list: [],page: 1})
    $this.get_list()
  },
  onReachBottom: function () {
    console.error(this.data.loaded + '  ' + this.data.list.length + '  ' + this.data.total)
    
    if (this.data.loaded || this.data.list.length == this.data.total) {
      return;
    }
    this.get_list();
  },
  get_list: function () {
    var $this = this;
    $this.setData({ loading: true });
    core.get('membercard.getlist', { page: $this.data.page, cate: $this.data.cate}, function (res) {
      console.error(res)
      if (res.error == 0) {
        $this.setData({ loading: false, total: res.total, empty: true, all_total: res.all_total, my_total: res.my_total});
        if (res.list.length > 0) {
          $this.setData({
            page: $this.data.page + 1,
            list: $this.data.list.concat(res.list)
          });
        }
        if (res.list.length > res.pagesize) {
          $this.setData({
            loaded: true
          });
        }
      } else {
        core.toast(res.message, 'loading')
      }
    }, this.data.show);
  },
  // 立即开通
  // 购买
  submit: function (e) {
    var data = e.currentTarget.dataset,$this = this;
    if (data.startbuy == -1){
      return
    }
    if (data.stock == '0') {
      foxui.toast($this, '库存不足');
      return
    }
    core.post('membercard.order.create_order', { id: data.id }, function (res) {
      if (res.error != 0) {
        foxui.toast($this, res.message);
        return;
      }
      wx.navigateTo({
        url: '/pages/member/membercard/pay/index?order_id=' + res.order.order_id
      })
    })
  },
})