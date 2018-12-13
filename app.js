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
          var iponeX = model.indexOf("iPhone X");
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
    },
    /**
     * 小程序检查是否授权方法，写入当前页面路径和参数缓存
     * @date 2018-10-22
     * @author Vencenty
     */
    checkAuth: function () {
    
      const url = '/pages/message/auth/index'
      const currentPages = getCurrentPages()
      const currentPage = currentPages[currentPages.length - 1]
      const routeData = {
        'params': currentPage.options || null,
        'url': currentPage.route
      }
      this.setCache('routeData', routeData)

      console.log(routeData);

      const userinfo = this.getCache('userinfo')
      wx.getSetting({
        success: function (settings) {
          if (!settings.authSetting['scope.userInfo']) {
            wx.redirectTo({url: url})
          } else {
            if (!userinfo) {
              wx.redirectTo({ url: url })
            } else {
              core.get('member', {}, function (ret) {
                if (ret.error) {
                  wx.redirectTo({ url: url })
                }
              })
            }
          }
        }
      })
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
    close: function () {
      this.globalDataClose.flag = true;
      wx.reLaunch({
        url: '/pages/index/index',
      })
    },
    getSet: function () {
        var $this = this;
        var cacheset = $this.getCache("cacheset");
        // if (cacheset == '') {
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
        // }
    },

    url: function (options) {
        options = options || {};
        var arg = {}, mid = '', merchid = '', user = this.getCache('usermid');
        mid = options.mid || '';
        merchid = options.merchid || '';
        if (user != '') {
            // console.log('---')
            if (user.mid == '' || typeof user.mid == 'undefined') {
                arg.mid = mid;
                arg.merchid = user.merchid;
            }
            if (user.merchid == '' || typeof user.merchid == 'undefined') {
                arg.merchid = merchid;
                arg.mid = user.mid;
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
    //   appid:'wx3d3b2fd41970f6db',
    //   api: "https://api.clubmall.cn/app/ewei_shopv2_api.php?i=16",
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
    globalData: {
      appid:'wx3d3b2fd41970f6db',
      api: "https://yctcs.100cms.com/app/ewei_shopv2_api.php?i=2",
      approot: "https://yctcs.100cms.com/addons/ewei_shopv2/",
        userInfo: null
    }

    // 售后
    //  globalData: {
    //   appid: "wx3502a0f358ee367f",
    //   api: "https://shn2mgo.ifkvip.com/app/ewei_shopv2_api.php?i=2",
    //   approot: "https://shn2mgo.ifkvip.com/addons/ewei_shopv2/",
    //    userInfo: null
    //  }

    //  globalData: {
    //    appid: null,
    //    api: null,
    //    approot: null,
    //    userInfo: null
    //  }

})
  