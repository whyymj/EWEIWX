var app = getApp();
var core = require('./../../../utils/core.js')

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
            console.log(userInfo)
              $this.setData({ userInfo: userInfo})
            }else{

            }
          }
        })
      }, 1000);
  },

  // 点击open-type="getUserInfo"时候的回调函数
  bindGetUserInfo: function (res) {
    const routeData = app.getCache('routeData');
    let { url, params } = routeData;
    // 拼接重新跳转的url
    let ret = '';
    Object.keys(params).forEach(key => {
      ret += key + '=' + params[key] + '&'
    })
    params = ret.substring(0, ret.length - 1)
    var redirectUrl = '/' + url + '?' + params;
    console.log(redirectUrl)

    wx.login({
      success: function (ret) {
        core.post('wxapp/login', { code: ret.code }, function (login_res) {
          if (login_res.error) {
            core.alert('获取用户登录态失败:' + login_res.message);
            return;
           }
          core.get('wxapp/auth', {
            data: res.detail.encryptedData,
            iv: res.detail.iv,
            sessionKey: login_res.session_key
          }, function (auth_res) {
            if (auth_res.isblack == 1) {
              wx.showModal({
                title: '无法访问',
                content: '您在商城的黑名单中，无权访问！',
                success: function (res) {
                  if (res.confirm) {
                    app.close();
                  }
                  if (res.cancel) {
                    app.close();
                  }
                }
              })
            }
            res.detail.userInfo.openid = auth_res.openId
            res.detail.userInfo.id = auth_res.id
            res.detail.userInfo.uniacid = auth_res.uniacid
            app.setCache('userinfo', res.detail.userInfo);
            app.setCache('userinfo_openid', res.detail.userInfo.openid);
            app.setCache('userinfo_id', auth_res.id);
            app.getSet();
            wx.reLaunch({
              url: redirectUrl
            })
          })
        })
      },
      fail: function () {
        core.alert('获取用户信息失败!');
      }
    })
  }
})