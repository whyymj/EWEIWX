/**
 *
 * favorite\index.js
 *
 * @create 2017-01-09
 * @author 晚秋
 *
 * @update  晚秋 2017-01-09
 *
 */

var app = getApp();
var core = app.requirejs('core');
var parser = app.requirejs('wxParse/wxParse');
var diypage = app.requirejs('biz/diypage');
var $ = app.requirejs('jquery');

Page({
    data: {
        route: "member",
        icons: app.requirejs('icons'),
        member:{},
        diypages:{},
        audios: {},
        audiosObj:{},
        modelShow: false, 
        //轮播
        autoplay: true,
        interval: 5000,
        duration: 500,
        swiperheight:0,
        iscycelbuy:false,
        bargain:false,
    },
    onLoad: function (options) {
      app.checkAuth();
      var $this = this;
      $this.setData({ options: options });
    },
    getInfo: function(){
        var $this = this;
        core.get('member', {}, function(result){
          if (result.isblack == 1){
            wx.showModal({
              title: '无法访问',
              content: '您在商城的黑名单中，无权访问！',
              success: function (res) {
                if (res.confirm) {
                  $this.close()
                }
                if (res.cancel){
                  $this.close()
                }
              }
            })
          }
            if(result.error!=0){
              // $this.setData({ modelShow: true });
                wx.redirectTo({
                  url: '/pages/message/auth/index'
                })
            }else{
              $this.setData({
                member: result, show: true, customer: result.customer, customercolor: result.customercolor, phone: result.phone, phonecolor: result.phonecolor, phonenumber: result.phonenumber, iscycelbuy: result.iscycelbuy,bargain:result.bargain
});
            }
            parser.wxParse('wxParseData','html', result.copyright,$this,'5');
        });
    },
    onShow: function(){
      app.checkAuth();
      var $this = this;
      this.getInfo();      
      wx.getSystemInfo({
        success: function (result) {
          var swiperheight = result.windowWidth / 1.7
          $this.setData({
            windowWidth: result.windowWidth,
            windowHeight: result.windowHeight,
            swiperheight: swiperheight
          });
        }
      });
      // 店铺装修 会员中心
      $this.setData({
        imgUrl: app.globalData.approot
      });
      diypage.get(this, 'member', function (res) { });
    },
    onShareAppMessage: function () {
        return core.onShareAppMessage();
    },
    
    /*用户授权-取消*/
    cancelclick:  function(){
   	  wx.switchTab({
          url: '/pages/index/index'
  	  })
    },
    /*用户授权-去设置*/
    confirmclick: function(){
      // this.setData({modelShow: false})
      wx.openSetting({
        success: function (res) { }
      })
    },
    phone: function () {
      var phoneNumber = this.data.phonenumber + ''
      wx.makePhoneCall({
        phoneNumber: phoneNumber
      })
    },
    play: function (e) {
      var item_id = e.target.dataset.id;
      var innerAudioContext = this.data.audiosObj[item_id] || false;
      if (!innerAudioContext) {
        innerAudioContext = wx.createInnerAudioContext('audio_' + item_id);
        var audiosObj = this.data.audiosObj;
        audiosObj[item_id] = innerAudioContext;
        this.setData({
          audiosObj: audiosObj
        })
      }
      var $this = this;
      innerAudioContext.onPlay(() => {
        var Time = setInterval(function () {
          var width = innerAudioContext.currentTime / innerAudioContext.duration * 100 + '%';
          var minute = Math.floor(Math.ceil(innerAudioContext.currentTime) / 60);  //分
          var second = (Math.ceil(innerAudioContext.currentTime) % 60 / 100).toFixed(2).slice(-2); //秒
          var seconds = Math.ceil(innerAudioContext.currentTime)
          var audioicon = ''
          if (minute < 10) {
            minute = "0" + minute;
          }
          var time = minute + ":" + second;
          var audios = $this.data.audios;
          audios[item_id].audiowidth = width;
          audios[item_id].Time = Time;
          audios[item_id].audiotime = time;
          audios[item_id].seconds = seconds;
          $this.setData({ audios: audios })
        }, 1000)
      })

      var src = e.currentTarget.dataset.audio;
      var time = e.currentTarget.dataset.time;
      var pausestop = e.currentTarget.dataset.pausestop;
      var loopplay = e.currentTarget.dataset.loopplay;
      if (loopplay == 0) {
        innerAudioContext.onEnded((res) => {
          audios[item_id].status = false;
          $this.setData({ audios: audios })
        })
      }
      var audios = $this.data.audios;
      
      if (!audios[item_id]) {
        audios[item_id] = {};
      }
      if (innerAudioContext.paused && time == 0) {
        innerAudioContext.src = src;
        innerAudioContext.play();
        if (loopplay == 1) {
          innerAudioContext.loop = true;
        }
        audios[item_id].status = true;
        $this.pauseOther(item_id)

      } else if (innerAudioContext.paused && time > 0) {
        innerAudioContext.play();
        if (pausestop == 0) {
          innerAudioContext.seek(time);
        } else {
          innerAudioContext.seek(0);
        }
        audios[item_id].status = true;
        $this.pauseOther(item_id)
      }
      else {
        innerAudioContext.pause();
        audios[item_id].status = false;
      }
      $this.setData({ audios: audios })
    },
    pauseOther: function (item_id) {
      var $this = this;
      $.each(this.data.audiosObj, function (id, obj) {
        if (id == item_id) {
          return;
        }
        obj.pause();
        var audios = $this.data.audios;
        if (audios[id]) {
          audios[id].status = false;
          $this.setData({ audios: audios });
        }
      });
    },
    /**
 * 生命周期函数--监听页面隐藏
 */
    onHide: function () {
      this.pauseOther();
      // this.setData({ modelShow: false })
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
      this.pauseOther();
    },
    navigate: function (e) {
      var url = e.currentTarget.dataset.url
      var phone = e.currentTarget.dataset.phone
      var appid = e.currentTarget.dataset.appid
      var appurl = e.currentTarget.dataset.appurl
      if (url) {
        wx.navigateTo({
          url: url,
          fail: function () {
            wx.switchTab({
              url: url,
        })
      }
        })
      }
      if (phone) {
        wx.makePhoneCall({
          phoneNumber: phone
        })
      }
      if (appid) {
        wx.navigateToMiniProgram({
          appId: appid,
          path: appurl
        })
      }
    },
    close: function () {
      app.globalDataClose.flag = true;
      wx.reLaunch({
        url: '/pages/index/index',
      })
    },
});