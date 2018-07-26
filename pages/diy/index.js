// pages/diy/index.js
var app = getApp();
var icons = app.requirejs('icons');
var core = app.requirejs('core');
var Base64 = app.requirejs('base64');
var parser = app.requirejs('wxParse/wxParse');
Page({
  data: {
        route: 'home',
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 500,
        circular: true,
        hotimg: "/static/images/hotdot.jpg",
        saleout1: "/static/images/saleout-1.png",
        saleout2: "/static/images/saleout-2.png",
        saleout3: "/static/images/saleout-3.png",
        icons: app.requirejs('icons'),
        diypage:''
       },
    onReady:function(){
      // 页面渲染完成
      
    },
    onShow:function(){
      var $this = this;
      core.get('diypage&id=1', {}, function (result) {
        var data = { loading: false, diypage: result.diypage};
        $this.setData(data);
      });
    },
    onHide:function(){
      // 页面隐藏
    },
    onUnload:function(){
      // 页面关闭
    }
  })