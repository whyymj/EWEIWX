var app = getApp();
var core = app.requirejs('/core');
var foxui = app.requirejs('foxui');
var $ = app.requirejs('jquery');

Page({
  data: {
    activity_setting: {},
    shareid: '',
    id: '',
    share_id: '',
    time: ['00', '00', '00', '00'],
    listlength: false,
  },

  onLoad: function (options) {
    var $this = this;
    if(options.share_id){
      $this.setData({ share_id: options.share_id});
    }
    if (options.id) {
      $this.setData({ id: options.id });
    }
    $this.getList();
  },

  onShow: function() {
    var $this = this;
    $this.getList();
  },

  // 领取优惠券
  getCoupon: function(){
    var $this = this;
    var args = { id: $this.data.id, share_id: $this.data.share_id};
    if (!$this.data.isLogin) {
      app.checkAuth();
      return;
    }
    core.get('friendcoupon/receive', args , function (ret) {
      if(ret.error == 0){
        foxui.toast($this, '领取成功');
        $this.getList();
      }else{
        foxui.toast($this, ret.message);
      }
    })
  },

  // 参与瓜分  
  carve: function () {
    var $this = this;
    var args = { id: $this.data.id, share_id: $this.data.share_id };
    if (!$this.data.isLogin){
      app.checkAuth();
      return;
    }
    core.get('friendcoupon/divide', args , function (ret) {
        if(ret.error == 0){
          foxui.toast($this, '瓜分成功');
          $this.getList();
        } else {
          foxui.toast($this, ret.message);
        }
    })
  },

  // 查看我的
  mycoupon: function() {
    this.setData({ id: this.data.mylink})
    this.getList();
  },

  // 分享
  onShareAppMessage(res) {
    var $this = this;
    return {
      title: '好友瓜分券',
      path: '/friendcoupon/index?share_id=' + $this.data.shareid + '&id=' + $this.data.id
    }
  },

  // 查看更多
  more: function(){
    this.setData({ listlength: true});
  },

  // 获取数据
  getList() {
    var $this = this;
    core.get('friendcoupon', { id: $this.data.id, share_id: $this.data.share_id}, function (ret) {
      if(ret.error == 0){
        console.error(ret)
        if (ret.currentActivityInfo){
          ret.currentActivityInfo.enough = Number(ret.currentActivityInfo.enough);
        }
        
        $this.setData({ 
          activityData: ret.activityData,
          data: ret,
          isLogin: ret.isLogin,
          mylink: ret.mylink,
          invalidMessage: ret.invalidMessage,
          shareid: ret.currentActivityInfo ? ret.currentActivityInfo.headerid : ''
        })

        if (ret.overTime){
          let timer = setInterval(function () {
            $this.setData({
              time: core.countDown(ret.overTime)
            })
            if (!$this.data.time) {
              clearInterval(timer);
              $this.getList();
            }
          }, 1000);
        }
      }else{
        foxui.toast($this, ret.message);
      }
    })
  }
})