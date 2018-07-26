/**
 *
 * address\index.js
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
        var $this = this;
        var isIpx = app.getCache('isIpx');
        console.error(isIpx)
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
    onPullDownRefresh: function(){
        wx.stopPullDownRefresh()
    },
    getList: function () {
        var $this = this;
        core.get('member/address/get_list',{}, function(result){
            $this.setData({loaded: true, list: result.list,show:true});
        });
    },
    setDefault: function (event) {
        var $this = this;
        var id = core.pdata(event).id;
        $this.setData({loaded: false});
        core.get('member/address/set_default',{id: id}, function(result){
            core.toast("设置成功");
            $this.getList();
        });
    },
    deleteItem: function (event) {
        var $this = this;
        var id = core.pdata(event).id;
        core.confirm("删除后无法恢复, 确认要删除吗 ?", function () {
            $this.setData({loaded: false});
            core.get('member/address/delete',{id : id}, function(result){
                core.toast("删除成功");
                $this.getList();
            });
        });
    }
})