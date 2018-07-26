/**
 *
 * order/express/index.js
 *
 * @create 2017-1-16
 * @author Young
 *
 * @update  Young 2017-01-16
 *
 */
var app = getApp(),core=app.requirejs('core');
Page({
    data: {},
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({
            options: options
        });
        app.url(options);
        this.get_list( options.id );
    },
    get_list:function ( id ) {
        var $this = this;
        core.get('creditshop/log/express', {id:id}, function (list) {
            if (list.error==0){
                list.show = true;
                $this.setData(list);
            }else{
                core.toast(list.message,'loading')
            }
        });
    }
});