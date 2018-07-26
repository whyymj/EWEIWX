/**
 *
 * order/index.js
 *
 * @create 2017-1-15
 * @author Young
 *
 * @update  Young 2017-02-04
 *
 */
var app = getApp(),
  core = app.requirejs('core'),
  order = app.requirejs('biz/order');
Page({
  data: {
    icons: app.requirejs('icons'),
    status: '',
    list: [],
    page: 1,
    code: false,
    cancel: order.cancelArray,
    cancelindex: 0
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      options: options,
      status: options.status || ''
    });
    app.url(options);
    this.get_list();
  },
  get_list: function () {
    var $this = this;
    $this.setData({ loading: true });
    core.get('order/cycel_orderList', { page: $this.data.page, status: $this.data.status, merchid: 0 }, function (list) {
      if (list.error == 0) {
        $this.setData({ loading: false, show: true, total: list.total, empty: true });
        if (list.list.length > 0) {
          $this.setData({
            page: $this.data.page + 1,
            list: $this.data.list.concat(list.list)
          });
        }
        if (list.list.length < list.pagesize) {
          $this.setData({
            loaded: true
          });
        }
      } else {
        core.toast(list.message, 'loading')
      }
    }, this.data.show);
  },
  selected: function (e) {
    var status = core.data(e).type;
    this.setData({
      list: [],
      page: 1,
      status: status,
      empty: false
    });
    this.get_list();
  },
  onReachBottom: function () {
    if (this.data.loaded || this.data.list.length == this.data.total) {
      return;
    }
    this.get_list();
  },
  code: function (e) {
    var $this = this, orderid = core.data(e).orderid;
    core.post('verify/qrcode', { id: orderid }, function (json) {
      if (json.error == 0) {
        $this.setData({
          code: true,
          qrcode: json.url
        })
      } else {
        core.alert(json.message);
      }
    }, true);
  },
  close: function () {
    this.setData({
      code: false
    })
  },
  cancel: function (e) {
    var orderid = core.data(e).orderid;
    order.cancel(orderid, e.detail.value, '/pages/order/index?status=' + this.data.status);
  },
  delete: function (e) {
    var type = core.data(e).type, orderid = core.data(e).orderid;
    order.delete(orderid, type, '/pages/order/index', this);
  },
  finish: function (e) {
    var type = core.data(e).type, orderid = core.data(e).orderid;;
    order.finish(orderid, '/pages/order/index');
  },
  onShareAppMessage: function () {
    return core.onShareAppMessage();
  }
});