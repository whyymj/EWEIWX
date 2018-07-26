// pages/shop/caregory/index.js
var app = getApp();
var core = app.requirejs('core');
var icons = app.requirejs('icons');
var $ = app.requirejs('jquery');
Page({
    data: {
        route: 'category',
        category: {},
        icons: app.requirejs('icons'),
        selector: 0,     //当前分类
        advimg: '',      //分类广告
        advurl:'',
        recommands: {},  //推荐分类
        level: 0,        //分类显示等级
        back: 0,         //返回上一级
        child: {},
        parent: {},
    },
    // 二级分类绑定事件
    tabCategory: function (event) {
        this.setData({
            selector: event.target.dataset.id,
            advimg: event.target.dataset.src,
            advurl: event.target.dataset.url,
            child: event.target.dataset.child,
            back: 0,
        });
        if ($.isEmptyObject(event.target.dataset.child)){
            this.setData({level: 0});
        } else {
            this.setData({level: 1});
        }
        console.log(this.data)
    },
    //三级分类绑定事件
    cateChild: function (event) { 
        this.setData({
            parent: event.currentTarget.dataset.parent,
            child: event.currentTarget.dataset.child,
            back:1
        });
        console.log(this.data)
    },
    //返回上一级
    backParent: function (event) {
        this.setData({
            child: event.currentTarget.dataset.parent,
            back: 0
        });
    },
    //
    getCategory: function () {
        var $this = this;
        core.get('shop/get_category', {}, function (result) {
            $this.setData({
                category: result.category,
                show: true,
                set: result.set,
                advimg: result.set.advimg,
                recommands: result.recommands,
                child: result.recommands
                //level:result.set.level-1,
            });
            console.log(result)
        });
    },
    onShow: function () {
        // 页面初始化
    },
    onLoad: function (options) {
        app.url(options);
        this.getCategory();
    },
    onShareAppMessage: function () {
        return core.onShareAppMessage();
    }
});