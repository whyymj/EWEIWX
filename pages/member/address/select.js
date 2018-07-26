/**
 *
 * address\select.js
 *
 * @create 2017-01-09
 * @author 晚秋
 *
 * @update  晚秋 2017-01-09
 *
 */

var app = getApp();
var core = app.requirejs('core');

Page({
    data: {
        loaded: false,
        list: []
    },
    onLoad: function (options) {
        app.url(options);
    },
    onShow: function () {
        this.getList();
        var isIpx = app.getCache('isIpx');
        var $this = this;
        if (isIpx) {
          $this.setData({
            isIpx: true,
            iphonexnavbar: 'fui-iphonex-navbar',
            paddingb: 'padding-b'
          })
        } else {
          $this.setData({
            isIpx: false,
            iphonexnavbar: '',
            paddingb: ''
          })
        }
    },
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh()
    },
    getList: function () {
        var $this = this;
        core.get('member/address/get_list', {}, function (result) {
            $this.setData({loaded: true, list: result.list,show:true});
        });
    },
    select: function (event) {
        var index = core.pdata(event).index;
        app.setCache("orderAddress", this.data.list[index], 30);
        wx.navigateBack();
    }
});