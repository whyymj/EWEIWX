var $ = require('jquery');
module.exports = {
    toQueryPair: function (key, value) {
        if (typeof value == 'undefined') {
            return key
        }
        return key + '=' + encodeURIComponent(value === null ? '' : String(value))
    },
    getUrl: function (routes, params, full) {
        routes = routes.replace(/\//ig, ".");
        var config = getApp().getConfig();
        var url = config.api + "&r=" + routes;
        if (params) {
            if (typeof(params) == 'object') {
                url += "&" + $.param(params)
            } else if (typeof(params) == 'string') {
                url += "&" + params
            }
        }
        return url
    },
    json: function (routes, args, callback, hasloading, ispost, session) {
        var app = getApp(), userinfo_openid = app.getCache('userinfo_openid'),usermid=app.getCache('usermid'),authkey = app.getCache('authkey'),$this=this;
        args = args || {};
        args.comefrom = 'wxapp';
        args.openid = 'sns_wa_' + userinfo_openid;
        
        
        if (usermid) {
            args.mid = usermid.mid;
            args.merchid = args.merchid || usermid.merchid;
        }
        var self = this;
        if (hasloading) {
            self.loading();
        }
        if (args){
            args.authkey = authkey || '';
        }
        var url = ispost ? this.getUrl(routes) : this.getUrl(routes, args);
        var op = {
            url: url + "&timestamp=" + (+new Date()),
            method: ispost ? 'POST' : 'GET',
            header: {
                'Content-type': ispost ? 'application/x-www-form-urlencoded' : 'application/json',
                'Cookie': 'PHPSESSID=' + userinfo_openid
            }
        };
        if (!session) {
            delete op.header.Cookie;
        }
        if (ispost) {
            op.data = $.param(args);
        }
        if (callback) {
            op.success = function (res) {
                //session
                if (hasloading) {
                    self.hideLoading();
                }
                if (res.errMsg == 'request:ok')
                    if (typeof(callback) === 'function') {
                        app.setCache('authkey',res.data.authkey || '');
                        if (typeof (res.data.sysset) !== 'undefined') {


                          if (res.data.sysset.isclose == 1) {
                            wx.redirectTo({
                              url: '/pages/message/auth/index?close=1&text=' + res.data.sysset.closetext
                            })
                            return;
                          }
                          app.setCache("sysset", res.data.sysset);

                        }
                        callback(res.data);
                        
                    }
            }
        } 
        op.fail = function (res) {
           if (hasloading) {
              self.hideLoading();
           }
           self.alert(res.errMsg);
        }

        wx.request(op);
    },
    post: function (routes, args, callback, hasloading, session) {
        this.json(routes, args, callback, hasloading, true, session)
    },
    get: function (routes, args, callback, hasloading, session) {
        this.json(routes, args, callback, hasloading, false, session)
    },
    getDistanceByLnglat: function (lng1, lat1, lng2, lat2) {
        function rad(d) {
            return d * Math.PI / 180.0
        }

        var rad1 = rad(lat1), rad2 = rad(lat2);
        var a = rad1 - rad2, b = rad(lng1) - rad(lng2);
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378137.0;
        s = Math.round(s * 10000) / 10000000;
        return s
    },
    alert: function (msg, callback) {
        if (typeof(msg) === 'object') {
            msg = JSON.stringify(msg);
        }
        wx.showModal({
            title: '提示',
            content: msg,
            showCancel: false,
            success: function (res) {
                if (res.confirm) {
                    typeof(confirm) === 'function' && callback();
                }
            }
        })
    },
    confirm: function (msg, confirm_callback, cancel_callback) {
        if (typeof(msg) === 'object') {
            msg = JSON.stringify(msg);
        }
        wx.showModal({
            title: '提示',
            content: msg,
            showCancel: true,
            success: function (res) {
                if (res.confirm) {
                    typeof(confirm_callback) === 'function' && confirm_callback();
                } else {
                    typeof(cancel_callback) === 'function' && cancel_callback();
                }
            }
        })
    },
    loading: function (msg) {

        if (typeof(msg) === 'undefined' || msg == '') {
            msg = '加载中';
        }
        wx.showToast({
            title: msg,
            icon: 'loading',
            duration: 5000000
        });
    },
    hideLoading: function () {
        wx.hideToast();
    },
    toast: function (msg, type) {
        if (!type) {
            type = 'success';
        }
        wx.showToast({
            title: msg,
            icon: type,
            duration: 1000
        });
    },
    success: function (msg) {

        wx.showToast({
            title: msg,
            icon: 'success',
            duration: 1000
        });
    },
    upload: function (uploadCallback) {

        var self = this;
        wx.chooseImage({
            success: function (res) {
                self.loading('正在上传...');

                var url = self.getUrl('util/uploader/upload', {file: 'file'})
                var tempFilePaths = res.tempFilePaths;
                //  if( typeof(chooseCallback)==='function'){
                //      chooseCallback(res.tempFilePaths[0] );
                //  }
                wx.uploadFile({
                    url: url,
                    filePath: tempFilePaths[0],
                    name: 'file',
                    success: function (res) {
                        self.hideLoading();
                        var result = JSON.parse(res.data);
                        if (result.error == 0) {
                            if (typeof(uploadCallback) === 'function') {
                                var file = result.files[0];
                                uploadCallback(file);
                            }
                            return;
                        }
                        self.alert("上传失败");
                    }
                })
            }
        })
    },
    pdata: function (e) {
        return e.currentTarget.dataset;
    },
    data: function (e) {
        return e.target.dataset;
    },
    phone: function (e) {
        var phone = this.pdata(e).phone;
        wx.makePhoneCall({
            phoneNumber: phone
        });
    },
    /**
     *
     * @param obj
     * @param succalback
     * @param fail
     * @returns {boolean}
     */
    pay: function (obj, succalback, fail) {
        var $this = this;
        if (typeof obj != 'object') {
            return false;
        }
        if (typeof succalback != 'function') {
            return false;
        }
        obj.success = succalback;
        if (typeof fail == 'function') {
            obj.fail = fail;
        }
        wx.requestPayment(obj);
    },
    cartcount: function (page) {
        this.get('member/cart/count', {}, function (data) {
            page.setData({
                cartcount: data.cartcount
            });
        });
    },
    onShareAppMessage: function (url, customtitle) {
        var app = getApp(),sysset = app.getCache('sysset'),share=sysset.share||{},userinfo_id = app.getCache('userinfo_id'),mid='';
        var title = sysset.shopname||'';
        var desc = sysset.description||'';
        if (share.title) title = share.title;
        if (customtitle) title = customtitle;
        if (share.desc) desc = share.desc;
        url = url || '/pages/index/index';
        url = url.indexOf('?') != -1 ? url+'&' : url+'?';
        return {
            title: title,
            desc: desc,
            path: url + 'mid=' + userinfo_id
        }
    },

    str2Obj: function (str) {
        if(typeof str !='string'){
            return str;
        }
        if(str.indexOf('&') < 0 && str.indexOf('=') < 0){
            return {};
        }
        var oldArr = str.split('&'), obj = {};
        $.each(oldArr, function (index, item) {
            if(item.indexOf('=') > -1){
                var arr = item.split('=');
                obj[arr[0]] = arr[1];
            }
        });
        return obj;
    },

  // 倒计时
  //timePoint 截止时间点、时间戳
  countDown: function (timePoint, time) {
    // 当前时间
    let now = parseInt(Date.now() / 1000);
    let leftTime = 0;
    if (timePoint) {
      leftTime = timePoint > now ? (timePoint - now) : (now - timePoint); //时间差
      leftTime = parseInt(leftTime);
    }
    if (time) {
      leftTime = parseInt(time);
    }
    if (leftTime == 0) {
      return false;
    } else {
      let day = Math.floor(leftTime / (60 * 60 * 24));
      let hour = Math.floor((leftTime - day * 24 * 60 * 60) / 3600);
      let minute = Math.floor((leftTime - day * 24 * 60 * 60 - hour * 3600) / 60);
      let second = Math.floor(leftTime - day * 24 * 60 * 60 - hour * 3600 - minute * 60);
      let time = [day, hour < 10 ? '0' + hour : hour, minute < 10 ? '0' + minute : minute, second < 10 ? '0' + second : second];
      return time;
    }
  },
};