var app = getApp();
var core = app.requirejs('/core');
var foxui = app.requirejs('foxui');
var $ = app.requirejs('jquery');

Page({
  data: {
    activity_setting: {},
    shareid: '',
    id: '',
    share_id: ''
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
    // app.checkAuth()
    core.get('friendcoupon/divide', args , function (ret) {
        if(ret.error == 0){
          foxui.toast($this, '瓜分成功');
          $this.getList();
        } else {
          foxui.toast($this, ret.message);
        }
    })
  },

  // 分享
  onShareAppMessage(res) {
    var $this = this;
    if (res.from === 'button') {

      console.log(res.target)
    }
    return {
      title: '好友瓜分券',
      path: '/friendcoupon/index?shareid=' + $this.data.shareid
    }
  },

  // 获取数据
  getList() {
    var $this = this;
    core.get('friendcoupon', { id: $this.data.id, share_id: $this.data.share_id}, function (ret) {
      if(ret.error == 0){
        if (ret.currentActivityInfo){
          ret.currentActivityInfo.enough = Number(ret.currentActivityInfo.enough);
        }
        
        $this.setData({ 
          activityData: ret.activityData,
          activityData: ret.activityData,
          data: ret,
          shareid: ret.currentActivityInfo ? ret.currentActivityInfo.headerid : ''
        })
      }else{
        foxui.toast($this, ret.message);
      }
    })
  }
})