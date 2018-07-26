var app = getApp();
var core = app.requirejs('core');
var $ = app.requirejs('jquery');

Page({
  data: {
      page:1,
      datas:{},
      more:true,
      load:true,
      notgoods:true,
      keywords:'',
      cate:''
  },

  onLoad: function (options) {
    var $this = this;
    if ( options.cate ){
      $this.setData({ cate: options.cate});
    }
    if(options.keywords){
      $this.setData({ keywords: options.keywords} );
    }
    $this.get_list(  );
  },
  //下拉刷新
  onPullDownRefresh: function (e) {
    wx.showNavigationBarLoading();
    this.get_list();
    wx.stopPullDownRefresh();
    wx.hideNavigationBarLoading();
  },
  //上拉翻页
  onReachBottom:function(e){
    this.setData({ page: this.data.page + 1, load:false});
    this.get_list( '' , true );
    this.setData({load: true });
  },

  focus: function () {
    this.setData({ showbtn: 'in' })
  },

  get_list: function ( keywords , onpage ) {
    var $this = this;
    core.post('creditshop/lists/getlist', { page: $this.data.page, keywords: $this.data.keywords, cate: $this.data.cate}, function (msg) {
      if( msg.error == 0 ){
        if (msg.list.length == 0 ){
          //如果没有数据则显示没有更多
          if ($this.data.page == 1 ){
            $this.setData({ notgoods: false });
          }
        }else{

          $this.setData({ notgoods: true });
          if (msg.next_page <= $this.data.page && $this.data.page != 1) {
            $this.setData({ more: false });
          }
        }

        if( !onpage ){
          $this.setData({ datas: msg.list });
        }else{
          //如果是翻页的话则追加
          msg.list = $this.data.datas.concat(msg.list );
          $this.setData({ datas: msg.list });
        }
        
      }
    });
  },
  search:function(){
    this.setData({page:1});
    this.get_list(  );
  },
  doinput:function(e){
    this.setData({keywords:e.detail.value});
  },
  
  
  


})