/**
 *
 * order/store/map.js
 *
 * @create 2017-1-16
 * @author 晚秋
 *
 * @update  晚秋 2017-01-16
 *
 */
var app = getApp(),core=app.requirejs('core');
Page({
    data: {
        storeid: 0,
        merchid:0,
        markers: [],
        store: {}
    },
    onLoad: function (options) {
        this.setData({storeid: options.id,merchid:options.merchid});
        this.getInfo();
    },
    getInfo: function () {
        var $this = this;
        console.log(this.data.storeid)
        core.get('store/map', { id: this.data.storeid, merchid: this.data.merchid}, function (result) {
            $this.setData({store: result.store,markers: [{id: 1, latitude: Number(result.store.lat), longitude: Number(result.store.lng)}],show:true});
        });
    },
    phone:function(e){
        core.phone(e);
    }
})