
var app = getApp();
var core = app.requirejs('core');
var $ = app.requirejs('jquery');
Page({
  data: {
    swiperCurrent:0,
    indicatorDots:true,
    autoplay:true,
    interval:3000,
    duration:800,
    circular:true,
    //轮播图url
    imgUrls:[],
    //轮播图链接
    links:[],
    //参数
    params:{},
    //积分抽奖
    lotterydraws:[],
    //积分兑换
    exchanges:[],
    //优惠券
    coupons:[],
    //余额兑换
    balances:[],
    //红包兑换
    //redbags:[],
    category:[],
    hidden:false,
    keywords:''
  },

  onLoad: function (options) {
    var $this = this;
  },
  doinput: function (e) {
    this.setData({ keywords: e.detail.value });
  },
  search: function () {
    var url = '/pages/creditshop/lists/index?keywords='+this.data.keywords;
    wx.navigateTo({
      url: url
    });
  },

  focus: function(){
    this.setData({showbtn: 'in'})
  },

  onReady:function(){
    var $this = this;
    $this.get_index();
  },

  changeTo:function( e ){
    var url = e.currentTarget.dataset.url+'?id='+e.currentTarget.dataset.gid
    wx.navigateTo({
      url:url
    });
  },

  get_index:function(){
    var $this = this;
    core.post('creditshop/index', $this.data.params,function(msg){
      if( msg.error == 0 ){
        $this.setData({ 
          imgUrls: msg.data.advs, 
          category: msg.data.category,
          lotterydraws: msg.data.lotterydraws,
          exchanges: msg.data.exchanges,
          coupons: msg.data.coupons,
          balances: msg.data.balances,
          redbags: msg.data.redbags,
        });
      }
      $this.setData({ hidden: true });
    });
  
  
  },
  
})