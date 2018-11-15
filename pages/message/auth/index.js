var app = getApp();
Page({
  data: {
    close:0,
    text:''
   },
    onLoad: function (options) {
      this.setData({
        imgUrl: app.globalData.approot
      });
      this.setData({close: options.close, text: options.text});
    },
    onShow: function () {
        var name = app.getCache('sysset').shopname;
        wx.setNavigationBarTitle({title: name||'提示'});
    },

    bind: function(){
      var $this = this;
      var timer =  setInterval(function () {
        wx.getSetting({
          success: function (res) {
            var userInfo = res.authSetting['scope.userInfo'];
            if (userInfo){
              wx.reLaunch({
                url: '/pages/index/index'
              })
              clearInterval(timer)
              $this.setData({ userInfo: userInfo})
            }else{

            }
          }
        })
      }, 1000);
    }
})