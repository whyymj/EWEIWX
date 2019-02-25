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

  // onShow: function() {
  //   var $this = this;
  //   $this.getList();
  // },

  // 领取优惠券
  getCoupon: function(e){
    var $this = this;
    var args = { id: $this.data.id, share_id: $this.data.share_id, form_id: e.detail.formId};
    if (!$this.data.isLogin) {
      app.checkAuth();
      return;
    }
    core.get('friendcoupon/receive', args , function (ret) {
      if(ret.error == 0){
        foxui.toast($this, '领取成功');
        $this.getList();
      }else{
        //foxui.toast($this, ret.message);
        $this.setData({
          invalidMessage: ret.message.replace('<br>', "\n")
        })
      }
    })
  },

  // 参与瓜分  
  carve: function (e) {
    var $this = this;
    var args = { id: $this.data.id, share_id: $this.data.share_id, form_id: e.detail.formId };
    if (!$this.data.isLogin){
      app.checkAuth();
      return;
    }
    core.get('friendcoupon/divide', args , function (ret) {
        if(ret.error == 0){
          foxui.toast($this, ret.message);
          $this.getList();
        } else {
          foxui.toast($this, ret.message);
        }
    })
  },

  // 查看我的
  mycoupon: function() {
    this.setData({
      id: this.data.data.currentActivityInfo.activity_id,
      share_id: this.data.data.currentActivityInfo.headerid
    })
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
    var $this = this
    core.get('friendcoupon/more', {
      id: $this.data.id,
      share_id: $this.data.shareid,
      pindex: 10
      // pindex: 2
    }, function (ret) {
      if (ret.result.list.length === 0) {
        foxui.toast($this, "没有更多")
      } else {
        
      }
    })
    // core.get('friendcoupon/more', {id: $this.data.id, share_id: $this.data.share_id, pindex: $this.data.data.activityData.length}, function (ret) {
    //     console.log(ret)
    // })

  },

  // 获取数据
  getList() {
    var $this = this;
    core.get('friendcoupon', { id: $this.data.id, share_id: $this.data.share_id}, function (ret) {
      if(ret.error == 0){
        if (ret.currentActivityInfo){
          ret.currentActivityInfo.enough = Number(ret.currentActivityInfo.enough);
        }
        if (typeof (ret.activitySetting.desc) == 'string'){
          $this.setData({ isArray: true })
        }
        $this.setData({ 
          activityData: ret.activityData,
          data: ret,
          isLogin: ret.isLogin,
          mylink: ret.mylink,
          invalidMessage: ret.invalidMessage,
          shareid: ret.currentActivityInfo ? ret.currentActivityInfo.headerid : '',
        })

        console.log($this.data.activityData)


        // 活动还没有结束的时候显示倒计时
        if (+ret.overTime + 3 > Math.round(+new Date / 1000)){
          let timer = setInterval(function () {
            $this.setData({
              time: core.countDown(+ret.overTime + 3)
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