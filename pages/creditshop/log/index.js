var app = getApp();
var core = app.requirejs('core');
var icons = app.requirejs('icons');
var foxui = app.requirejs('foxui');
var parser = app.requirejs('wxParse/wxParse');
var $ = app.requirejs('jquery');

Page({
  data: {
    status: 0,
    showcode: false,
    list:{},
    page:1,
    total:0,
    more:true,
    load:true,
    notgoods:true,

  },

  onLoad: function (options) {
        var $this = this;
        $this.get_list();
  },

  // tab切换
  tab: function(e){
      var status = e.currentTarget.dataset.type;
      this.setData({ status: status });
      this.setData({page:1});
      this.get_list();
  },
  finish: function (e) {
    var $this = this;
    var logid = e.currentTarget.dataset.logid;
    wx.showModal({
      title: '提示',
      content: '确认已收到货了吗？',
      success: function (sm) {
        if (sm.confirm) {
          core.get('creditshop/log/finish', { id: logid }, function (res) {
            if (res.error == 0) {
              foxui.toast($this, "确认收货");
              $this.onShow();
            }else{
              foxui.toast($this, res.message);
              return;
            }
          });
        }
      }
    })
  },

  //拉取列表
  get_list: function (onpage){
    var $this = this;
    core.post('creditshop/log/getlist', { page: $this.data.page, status: $this.data.status},function(msg){
      if( msg.error == 0 ){

        if (!onpage) {
          $this.setData({ list: msg.list });
        } else {
          //如果是翻页的话则追加
          msg.list = $this.data.list.concat(msg.list);
          $this.setData({ list: msg.list });
        }

        $this.setData({ total: msg.total });
      }
      
      if( msg.pagesize >= msg.next_page) {
        $this.setData({more:false});
      }

      if (msg.total == 0 ){
        $this.setData({ more: true });
      }

      if( !onpage ){
          $this.setData({ datas: msg.list });
        }else{
          //如果是翻页的话则追加
          msg.list = $this.data.datas.concat(msg.list );
          $this.setData({ datas: msg.list });
        }


      if ($this.data.total <= 0) {

        $this.setData({ notgoods: false });
      } else {
        $this.setData({ notgoods: true });
      }
    });


    
  },

  onReachBottom: function (e) {
    this.setData({ page: this.data.page + 1, load: false });
    this.get_list(true);
    this.setData({ load: true });
  },
  /*
  exchange:function(e){
    var url = '/pages/creditshop/verify/index?id='+e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: url
    });
  }
  */


})