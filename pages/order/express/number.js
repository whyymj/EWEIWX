/**
 *
 * order/express/number.js
 *
 * @create 2018-5-7
 * @author Liugt
 *
 *
 */
var app = getApp(), core = app.requirejs('core');
var foxui = app.requirejs('foxui');
var $ = app.requirejs('jquery');
Page({
  data: {
    express:'',
    expresscom:'',
    express_number:'',
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      options: options
    });
    app.url(options);
    this.get_list();
  },
  get_list: function () {
    var $this = this;
    core.get('order/express_number', $this.data.options, function (list) {
      console.log(list)
      if (list.error == 0) {
        list.show = true;
        $this.setData(list);
      } else {
        core.toast(list.message, 'loading')
      }
    });
  },
  inputPrickChange: function(e){
    var $this = this;
    var express_list = $this.data.express_list;
    var index = e.detail.value;
    var expresscom = express_list[index].name;
    var express = express_list[index].express;
    $this.setData({ expresscom: expresscom,express:express,index:index });
  },
  inputChange:function(e){
    var express_number = e.detail.value;
    this.setData({express_number:express_number});
  },
  back:function(){
    wx.navigateBack();
  },
  submit:function(e){
    var $this = this;
    var refundid = e.currentTarget.dataset.refund;
    var express_number = $this.data.express_number;
    var refundid = $this.data.options.refundid;
    var orderid = $this.data.options.id;
    if(express_number==""){
      foxui.toast($this, "请填写快递单号");
      return;
    }

    var express = $this.data.express;
    var expresscom = $this.data.expresscom;

    core.get('order/express_number', { submit:1,refundid: refundid, orderid: orderid, express_number: express_number, express: express, expresscom: expresscom},function(result){
      if(result.error == 0){
        wx.navigateTo({
          url: '/pages/order/detail/index?id='+orderid,
        })
      }
      console.log(result)
    });

  }
});