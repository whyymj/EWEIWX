var app = getApp();
var core = app.requirejs('/core');
var $ = app.requirejs('jquery');
Page({
  data: {
    list: [],
    page: 1,
    status: 'all',
    loading: false,
    args: {
      id: ''
    }
  },

  onLoad: function (options) {
    var $this = this;
    var args = { id: options.id }
    $this.setData({ 'args.id': options.id})
    $this.getlist(args)
  },


  // 上拉加载
  onReachBottom: function () {
    var $this = this, page = $this.data.page, status = $this.data.status,args = $this.data.args;
    $this.getlist(args)
  },

  getlist: function (args) {
    var $this = this;
    $this.setData({ loading: true })
    core.get('dividend/log/orders', args, function (res) {
      console.error(res)
      if (res.error == 0) {
        if (res.list.length > 0 && $this.data.list.length < res.total) {
          var list = $this.data.list.concat(res.list);
          args.page = args.page + 1;
        }
        $this.setData({ sysset: res.sysset,set: res.set, list: list, loading: false, total: res.total, page: args.page, stop: false })
      }
    })
  }

})
