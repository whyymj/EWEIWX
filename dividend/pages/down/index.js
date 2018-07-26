var app = getApp();
var core = app.requirejs('/core');
var $ = app.requirejs('jquery');
Page({
  data: {
    list: [],
    page: 1,
    loading: false
  },

  onLoad: function () {
    var $this = this;
    var args = { page: 1 }
    $this.getlist(args)
  },


  getlist: function (args) {
    var $this = this;
    $this.setData({ loading: true })
    console.error($this.data.loading)
    core.get('dividend/down', args, function (res) {
      console.error(res)
      if (res.error == 0) {
        if (res.list.length > 0) {
          var list = $this.data.list.concat(res.list);
          args.page = args.page + 1;
        }
        $this.setData({ member: res.member, list: list, loading: false, total: res.total, page: args.page, stop: false })
      }
    })
  }

})
