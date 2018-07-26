var app = getApp();
var core = app.requirejs('core');
var foxui = app.requirejs('foxui');
Page({
    data: {
        show: false,
        accredit: '',
        errMsg: '',
        Image: ''
    },

    onLoad: function (options) {
        options = options || {};
        if (!options.id) {
            wx.redirectTo({
                url: '/pages/goods/index/index'
            });
            return;
        }

        this.getImage(options.id);
    },

    // 获取图片
    getImage: function (goodsid) {
        var $this = this;
        core.json('goods/poster/getimage', {
            id: goodsid
        }, function (ret) {
            console.log(ret);
            if(ret.error==0){
                $this.setData({
                    Image: ret.url
                });
                return;
            }
            foxui.toast($this, ret.message);
        });
    },

    loadImg: function (e) {
        this.setData({
            show: true
        });
    },

    // 预览图片
    previewImage: function(){
        var $this = this;
        wx.previewImage({
            current: $this.data.Image,
            urls: [$this.data.Image]
        })
    },

    // 保存图片
    savePicture: function () {
        var $this = this;
        wx.getSetting({
            success: function (res) {
                var accredit = res.authSetting['scope.writePhotosAlbum']
                if (accredit) {
                    wx.showLoading({
                        title: '图片下载中...',
                    });
                    setTimeout(function () {
                        wx.hideLoading()
                    }, 1000)
                    wx.downloadFile({
                        url: $this.data.Image,
                        success: function (res) {
                            wx.saveImageToPhotosAlbum({
                                filePath: res.tempFilePath,
                                success: function (ret) {
                                    foxui.toast($this, "保存图片成功");
                                },
                                fail: function (ret) {
                                    $this.setData({errMsg: ret.errMsg})
                                    foxui.toast($this, "保存图片失败");
                                }
                            })
                        }
                    })
                } else {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success:function(){
                          wx.showLoading({
                            title: '图片下载中...',
                          });
                          setTimeout(function () {
                            wx.hideLoading()
                          }, 1000)
                          wx.downloadFile({
                            url: $this.data.Image,
                            success: function (res) {
                              wx.saveImageToPhotosAlbum({
                                filePath: res.tempFilePath,
                                success: function (ret) {
                                  foxui.toast($this, "保存图片成功");
                                },
                                fail: function (ret) {
                                  $this.setData({ errMsg: ret.errMsg })
                                  foxui.toast($this, "保存图片失败");
                                }
                              })
                            }
                          })
                        },
                        fail: function () {
                            /*获取权限时点击了拒绝以后的弹窗*/
                            wx.showModal({
                                title: '警告',
                                content: '您点击了拒绝授权，将无法正常使用保存图片或视频的功能体验，请删除小程序重新进入。'
                            })
                        }
                    })
                }
            }
        })
    }

});