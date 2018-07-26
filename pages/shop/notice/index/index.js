//index.js
//获取应用实例
var app = getApp();
var core = app.requirejs('core');


Page({
    data: {
        page: 1,
        loaded: false,
        loading: false,
        list: []
    },
    getList: function () {
        var $this = this;
        $this.setData({loading: true});
        core.get('shop/notice/get_list', {page: this.data.page}, function (result) {
            $this.setData({loading: false,show:true});
            if (result.list.length > 0) {
                $this.setData({
                    page: $this.data.page + 1,
                    list: $this.data.list.concat(result.list)
                });
            } else {
                if (result.list.length < result.pagesize) {
                    $this.setData({
                        loaded: true
                    });
                }
            }
        });
    },
    onReachBottom: function () {
        if (this.data.loaded) {
            return;
        }
        this.getList();
    },
    onLoad: function (options) {
        app.url(options);
        this.getList();
    }
})
