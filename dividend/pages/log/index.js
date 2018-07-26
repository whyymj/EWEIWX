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

  onLoad: function () {
    var $this = this;
    var args = { page: 1,status: '' }
    $this.getlist(args)
  },

  tab: function (e) {
    var status = e.currentTarget.dataset.status,
      args = { page: 1, status: status == 'all' ? '' : status };
      console.error(status)
    this.setData({ status: status, list: [] })
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
    core.get('dividend/log/get_list', args, function (res) {
      console.error(res)
      if (res.error == 0) {
        if (res.list.length > 0) {
          var list = $this.data.list.concat(res.list);
          args.page = args.page + 1;
        }
        $this.setData({ dividendcount: res.dividendcount, list: list, loading: false, total: res.total, page: args.page, stop: false })
      }
    })
  }

})
