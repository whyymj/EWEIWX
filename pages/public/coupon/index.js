/**
 *
 * plugin/coupon/index.js
 *
 * @create 2017-1-19
 * @author 晚秋
 *
 * @update  晚秋 2017-01-19
 *
 */
var app=getApp(),core=app.requirejs('core'),$ = app.requirejs('jquery');

Page({
    data: {
        type: 0,
        merchs: [],
        goodslist: [],
        goodsid: 0,
        money: 0,
        list: [],
        loading: true
    },
    onLoad: function (options) {
        if(!Number(options.type)){
            var goodsinfo = app.getCache('goodsInfo');
            this.setData({goodslist: goodsinfo.goodslist, merchs: goodsinfo.merchs});
        }else{
            this.setData({money:options.money});
        }
        this.setData({type:options.type});
        this.getList();
    },
    getList: function () {
        var $this=this,data=this.data;
        for (var i=0; i < data.goodslist.length;i++){
          delete data.goodslist[i]['title'];
          delete data.goodslist[i]['optiontitle'];
          delete data.goodslist[i]['thumb'];
        }
        if(data.type<2){    // 充值、购物
            core.get('sale/coupon/query', {type: data.type, money: data.money, goods: data.goodslist, merchs: data.merchs}, function (result) {
                $this.setData({list: result.list, loading: false});
            });
        }else{
            // 商品详情显示
        }
    },
    search: function (e) {
        var val = e.detail.value,old_list=this.data.old_list,list=this.data.list,new_list=[];
        if ($.isEmptyObject(old_list)){
            old_list = list;
        }
        if (!$.isEmptyObject(old_list)){
            $.each(old_list,function (index,item) {
                if (item.couponname.indexOf(val)!=-1){
                    new_list.push(item);
                }
            })
        }
        this.setData({list:new_list,old_list:old_list});
    },
    bindBtn: function (e) {
        var $this=this,data=this.data,dataset=e.currentTarget.dataset;
        if(data.type<2){
            app.setCache("coupon", dataset, 20);
            wx.navigateBack();
        }else{
            // 商品详情 (请求领取)
        }
    }
})