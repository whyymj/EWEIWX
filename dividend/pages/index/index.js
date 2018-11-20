var app = getApp();
var core = app.requirejs('/core');
var foxui = app.requirejs('/foxui');
var $ = app.requirejs('jquery');
Page({
  data: {
    loading: false
  },
  onLoad: function (options) {
    var $this = this;
    $this.setData({
      imgUrl: app.globalData.approot
    });
    $this.getlist()
  },

  getlist: function(){
    var $this = this;
    core.get('dividend', '', function (res) {
      if (res.error == 1) {
        console.error(res.message)
        foxui.toast($this, res.message);
        setTimeout(function () {
          wx.reLaunch({
            url: '/pages/index/index'
          })
        }, 1000)
        // return
      }
      $this.setData({ message: res })
      if (!res.member) {
        wx.redirectTo({
          url: '/dividend/pages/register/index'
        })
      }else{
        wx.setNavigationBarTitle({
          title: res.set.texts.center || '分红中心'
        });
      }
    })
  },

  // 创建团队
  found: function(){
    var $this = this;
    $this.setData({loading: true})
    core.post('dividend/createTeam', '', function (res) {
      if (res.error == 0) {
        $this.setData({ loading: false })
        foxui.toast($this, '创建完成');
        $this.getlist()
      }
    })
  }
})