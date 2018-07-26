/**
 *
 * coupon\my\index\index.js
 *
 * @create 2017-02-07
 * @author 晚秋
 *
 * @update  晚秋 2017-02-07
 *
 */

var app = getApp();
var core = app.requirejs('core');

Page({
    data: {
        cate: '',
        page: 1,
        loading: false,
        loaded: false,
        list: [],
        approot: app.globalData.approot
    },
    onLoad: function (options) {
        this.getList();
    },
    myTab: function (e) {
        var $this = this;
        var cate = core.pdata(e).cate;
        $this.setData({cate: cate, page: 1, list: []});
        $this.getList();
    },
    getList: function () {
        var $this = this;
        core.loading();
        this.setData({loading: true});
        core.get('sale/coupon/my/getlist', {page:this.data.page, cate:this.data.cate}, function (ret) {
            var data = {loading: false, total: ret.total, pagesize: ret.pagesize, closecenter:ret.closecenter};
            if (ret.list.length > 0) {
                data.page = $this.data.page + 1;
                data.list = $this.data.list.concat(ret.list);
                if(ret.list.length<ret.pagesize) {
                    data.loaded = true
                }
            }
            $this.setData(data);
            core.hideLoading();
        });
    },
    onReachBottom: function () {
        if (this.data.loaded || this.data.list.length==this.data.total) {
            return;
        }
        this.getList();
    },
    jump: function (e) {
        var id = core.pdata(e).id;
        if(id>0){
            wx.navigateTo({url: '/pages/sale/coupon/my/detail/index?id=' + id});
        }
    }
})