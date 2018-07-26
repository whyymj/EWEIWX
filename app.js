/**
 *
 * app.js
 *
 * @create 2017-1-1
 * @author Young
 *
 * @update  Young 2017-01-05
 *
 */
var core = require('utils/core.js');

App({
    onShow: function () {
      this.onLaunch();

    },
    onLaunch: function () {
      var $this = this; 
      wx.getSystemInfo({
        success: function (res) {
          var model = res.model;
          var iponeX = model.indexOf("iPhone X")
          if (iponeX == '0'){
            $this.setCache("isIpx", res.model);
          }else{
            $this.setCache("isIpx", '');
          }
        }
      }) 
      let that = this;
      wx.getSystemInfo({//  获取页面的有关信息
        success: function (res) {

          wx.setStorageSync('systemInfo', res)
          var ww = res.windowWidth;
          var hh = res.windowHeight;
          that.globalData.ww = ww;
          that.globalData.hh = hh;
        }
      }); 
        this.getConfig();
        var userinfo = '';
        if (userinfo == '' || userinfo.needauth) {
            this.getUserInfo(function (res) {
            }, function (text, close) {
                var close = close ? 1 : 0, text = text ? text : '';
                if (close) {
                    wx.redirectTo({
                        url: '/pages/message/auth/index?close=' + close + '&text=' + text
                    })  
                }
            }); 
       }
    },
    requirejs: function (jsname) {
        return require('utils/' + jsname + '.js');
    },
    getConfig: function () {
        if (this.globalData.api !== null) {
            return {
                api: this.globalData.api,
                approot: this.globalData.approot,
                appid: this.globalData.appid
            };
        }
        var ext = wx.getExtConfigSync();
        console.log(ext);
        this.globalData.api = ext.config.api;
        this.globalData.approot = ext.config.approot;
        this.globalData.appid = ext.config.appid;
        return ext.config;
    },
 
    getCache: function (key, defaultValue) {
        var time = (+new Date()) / 1000, data = '';
        time = parseInt(time);
        try {
            data = wx.getStorageSync(key + this.globalData.appid);
            if (data.expire > time || data.expire == 0) {
                data = data.value; 
            } else {
                data = '';
                this.removeCache(key);
            }
        } catch (e) {
            data = typeof (defaultValue) === 'undefined' ? '' : defaultValue;
        }
        data = data || '';
        return data;
    },

    setCache: function (key, value, expire) {
        var time = (+new Date()) / 1000, rt = true;
        var data = {
            expire: expire ? time + parseInt(expire) : 0,
            value: value
        };
        try {
            wx.setStorageSync(key + this.globalData.appid, data);
        } catch (e) {
            rt = false;
        }
        return rt;
    },

    removeCache: function (key) {
        var rt = true;
        try {
            wx.removeStorageSync(key + this.globalData.appid);
        } catch (e) {
            rt = false;
        }  
        return rt; 
    },
    getUserInfo: function (success, cancel){
        var that = this;
        var userinfo = {};
        var userinfo = that.getCache('userinfo');
        if (userinfo && !userinfo.needauth) {
            if (success && typeof success == 'function') {
                success(userinfo);
            } 
            return;
        }

        //调用登录接口
        wx.login({  
            success: function (ret) {
            //  console.log("wx.login=" + JSON.stringify(ret));
              
                if (!ret.code) {
                    core.alert('获取用户登录态失败:' + ret.errMsg);
                    return;
                } 
                
                core.post('wxapp/login', {code: ret.code}, function (login_res) {
                   // core.alert("wxapp/login" + JSON.stringify(login_res));
                  
                    if (login_res.error) {
                        core.alert('获取用户登录态失败:' + login_res.message);
                        return;
                    }
                    
                    if (login_res.isclose && cancel && typeof cancel == 'function') {
                        cancel(login_res.closetext, true);
                        return;
                    } 
                    
                    wx.getUserInfo({
                        success: function (res) {
                         // core.alert("wx.getUserInfo" + JSON.stringify(res));
                            userinfo = res.userInfo;
                             core.get('wxapp/auth', {
                                data: res.encryptedData,
                                iv: res.iv,
                                sessionKey: login_res.session_key
                            }, function (auth_res) {
                                if (auth_res.isblack == 1) {
                                  wx.showModal({
                                    title: '无法访问',
                                    content: '您在商城的黑名单中，无权访问！',
                                    success: function (res) {
                                      if (res.confirm) {
                                        that.close();
                                      }
                                      if (res.cancel) {
                                        that.close();
                                      }
                                    }
                                  })
                                }
                                res.userInfo.openid = auth_res.openId;
                                res.userInfo.id = auth_res.id;
                                res.userInfo.uniacid = auth_res.uniacid;
                                res.needauth = 0;
                                that.setCache('userinfo', res.userInfo, 7200);
                                that.setCache('userinfo_openid', res.userInfo.openid);
                                that.setCache('userinfo_id', auth_res.id);
                                that.getSet();
                                if (success && typeof success == 'function') {
                                    success(userinfo);
                                }
                            });
                        },
                        fail: function () {
                          console.log(login_res)
                            core.get('wxapp/check', {
                                openid: login_res.openid
                            }, function (check_res) {
                              console.log(check_res)
                              if (check_res.isblack == 1) {
                                  wx.showModal({
                                    title: '无法访问',
                                    content: '您在商城的黑名单中，无权访问！',
                                    success: function (res) {
                                      if (res.confirm) {
                                        that.close();
                                      }
                                      if (res.cancel) {
                                        that.close();
                                      }
                                    }
                                  })
                                }
                                check_res.needauth = 1;
                                that.setCache('userinfo', check_res, 7200);
                                that.setCache('userinfo_openid', login_res.openid);
                                that.setCache('userinfo_id', login_res.id);
                                that.getSet();
                                if (success && typeof success == 'function') {
                                    success(userinfo);
                                }
                            });
                        }
                    });
                });
            },
            fail: function () {
                core.alert('获取用户信息失败!');
            }
        });
    }, 
    close: function () {
      this.globalDataClose.flag = true;
      wx.reLaunch({
        url: '/pages/index/index',
      })
    },
    getSet: function () {
        var $this = this;
        var cacheset = $this.getCache("cacheset");
        if (cacheset == '') {
        // var sysset = $this.getCache("sysset");
        // if (sysset == '') {
            setTimeout(function () {
        var cacheset = $this.getCache("cacheset");
                core.get('cacheset', {version: cacheset.version}, function (result) {
                    if (result.update) {
                        $this.setCache("cacheset", result.data);
                    }
                    // $this.setCache("sysset", result.sysset, 7200);
                });
            }, 10);
        }
    },

    url: function (options) {
        options = options || {};
        var arg = {}, mid = '', merchid = '', user = this.getCache('usermid');
        mid = options.mid || '';
        merchid = options.merchid || '';
        if (user != '') {
            if (user.mid == '' || typeof user.mid == 'undefined') {
                arg.mid = mid;
            }
            if (user.merchid == '' || typeof user.merchid == 'undefined') {
                arg.merchid = merchid;
            }
        } else {
            arg.mid = mid;
            arg.merchid = merchid;
        }
        this.setCache('usermid', arg, 7200);
    },
	/*再次发起授权*/
    impower: function(limit, msg, route) {
    	wx.getSetting({
    		success: function(res) {
    			console.log(res)
    			var limits = res.authSetting['scope.' + limit];
    			if(!limits) {
    				wx.showModal({
    					title: '用户未授权',
    					content: '您点击了拒绝授权，暂时无法' + msg + '，点击去设置可重新获取授权喔~',
    					confirmText: '去设置',
    					success: function(res) {
    						if(res.confirm) {
    							wx.openSetting({
    								success: function(res) {}
    							})
    						}else{
    							if(route == 'route'){
    								wx.switchTab({
									    url: '/pages/index/index'
									})
    							}else if(route == 'details'){
    								//停留在当前页面
    							}else{
    								wx.navigateTo({
									    url: '/pages/index/index'
									})
    							}
    							
    						}
    					}
    				})
    			}
    		}
    	})
    },
    globalDataClose: {
      flag: false,
    },
    //晚秋
    // globalData: {
    //   appid:'wxe9154b3ec8bbd183',
    //   api: "https://api.clubmall.cn/app/ewei_shopv2_api.php?i=4",
    //   approot: "https://api.clubmall.cn/addons/ewei_shopv2/",
    //   userInfo: null
    // }

    //姜倩
    // globalData: {
    //   appid: 'wx5f691ef96a19887c',
    //   api: "https://jqnyrv.ifkvip.com/app/ewei_shopv2_api.php?i=4",
    //   approot: "https://jqnyrv.ifkvip.com/addons/ewei_shopv2/",
    //   userInfo: null
    // }

    // demo站点
    // globalData: {
    //     appid: 'wx5d7c9a63ffdf10f8',
    //     api: "https://demo.foxteam.cc/app/ewei_shopv2_api.php?i=11",
    //     approot: "https://demo.foxteam.cc/addons/ewei_shopv2/",
    //     userInfo: null
    // }

    // elinkkc
    // globalData: {
    //   appid:'wx3d3b2fd41970f6db',
    //   api: "https://api.clubmall.cn/app/ewei_shopv2_api.php?i=16",
    //   approot: "https://meilian.weiyunjia.cn/addons/ewei_shopv2/",
    //     userInfo: null
    // }

    // 售后
    // globalData: {
    //   appid: "wx88e4a8da72ca46fb",
    //   api: "https://shn2mgo.ifkvip.com/ewei_shopv2_api.php?i=3",
    //   approot: "https://shn2mgo.ifkvip.com/addons/ewei_shopv2/",
    //   userInfo: null
    // }

     globalData: {
      appid: null,
      api: null,
      approot: null,
      userInfo: null
    }
});
