/**
 *
 * order/pay/index.js
 *
 * @create 2017-1-12
 * @author Young
 *
 * @update  Young 2017-01-12
 *
 */
var app=getApp(),core=app.requirejs('core'),$=app.requirejs('jquery');
Page({
    data: {
        search: false
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({
            options: options
        });
        app.url(options);
        this.get_list();
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    get_list: function () {
      var $this = this;
      var obj = { 
        ids: $this.data.options.ids, 
        type: $this.data.options.type, 
        merchid: $this.data.options.merchid 
      };
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          obj.lat = res.latitude;
          obj.lng = res.longitude;
         
          core.get('store/selector', obj, function (result) {
            $this.setData({ list: result.list, show: true });
          });
        },
        fail: function (ret) {

        }
      })




        
    },
    bindSearch: function (e) {
        this.setData({
            search: true
        })
    },
    phone:function(e){
        core.phone(e);
    },
    select: function (e) {
        var index = core.pdata(e).index;
        app.setCache("orderShop", this.data.list[index], 30);
        wx.navigateBack();
    },
    search: function (e) {
        var val = e.detail.value,old_list=this.data.old_list,list=this.data.list,new_list=[];
        if ($.isEmptyObject(old_list)){
            old_list = list;
        }
        if (!$.isEmptyObject(old_list)){
            $.each(old_list,function (index,item) {
                if (item.storename.indexOf(val)!=-1){
                    new_list.push(item);
                }
            })
        }
        this.setData({list:new_list,old_list:old_list});
    }
})