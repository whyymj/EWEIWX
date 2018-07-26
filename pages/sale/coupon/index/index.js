/**
 *
 * coupon\index\index.js
 *
 * @create 2017-02-03
 * @author 晚秋
 *
 * @update  晚秋 2017-02-04
 *
 */

var app = getApp();
var core = app.requirejs('core');

Page({
    data: {
        cates: [],
        cateid: 0,
        page: 1,
        loading: false,
        loaded: false,
        list: [],
        approot: app.globalData.approot
    },
    onLoad: function (options) {
        if(options.cateid){
            this.setData({cateid: options.cateid});
        }
        this.getCate();
        this.getList();
    },
    getCate: function () {
        var $this = this;
        core.get('sale/coupon/getCouponCate', {}, function (ret) {
            if(ret.list.length>0){
                $this.setData({cates: ret.list});
            }
        });
    },
    getList: function () {
        var $this = this;
        core.loading();
        this.setData({loading: true});
        core.get('sale/coupon/getlist', {page: this.data.page, cateid:this.data.cateid}, function (ret) {
            var data = {loading: false, total: ret.total, pagesize: ret.pagesize};
            if (ret.list.length > 0) {
                data.page = $this.data.page + 1;
                data.list = $this.data.list.concat(ret.list);
                if(ret.list.length<ret.pagesize) {
                    data.loaded = true
                }
                $this.setSpeed(ret.list);
            }
            $this.setData(data);
            core.hideLoading();
        });
    },
    setSpeed:function (list) {
        if (!list || list.length<1){
            return
        }
        for(var i in list){
            var item = list[i];
            if(isNaN(item.lastratio)){
                continue;
            }
            var angle = item.lastratio / 100 * 2.5;
            var context = wx.createContext();
            context.beginPath()
            context.arc(34, 35, 30, 0.5 * Math.PI, 2.5 * Math.PI);
            context.setFillStyle('rgba(0,0,0,0)');
            context.setStrokeStyle('rgba(0,0,0,0.2)');
            context.setLineWidth(4);
            context.stroke();
            context.beginPath()
            context.arc(34, 35, 30, 0.5 * Math.PI, angle * Math.PI);
            context.setFillStyle('rgba(0,0,0,0)');
            context.setStrokeStyle('#ffffff');
            context.setLineWidth(4);
            context.setLineCap('round');
            context.stroke();
            var canvasId = 'coupon-'+item.id;
            wx.drawCanvas({
                canvasId: canvasId,
                actions: context.getActions(),
            })
        }
    },
    bindTab: function (e) {
        var cateid = core.pdata(e).cateid;
        this.setData({cateid: cateid, page: 1, list:[]});
        this.getList();
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
            wx.navigateTo({url: '/pages/sale/coupon/detail/index?id=' + id});
        }
    }
})