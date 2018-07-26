/**
 *
 * detail\index.js
 *
 * @create 2017-11-22
 * @author 牟俊羽
 *
 */
var app = getApp();
var core = app.requirejs('core');
var icons = app.requirejs('icons');
var $ = app.requirejs('jquery');
var foxui = app.requirejs('foxui');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    show: true,
    option_mask:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var $this =this;
    $this.setData({
      pid: options.id
    })
    core.get('package.get_detail', { pid: options.id }, function (result) {
      var packgoods = result.packgoods;
      var good=[];
      wx.setNavigationBarTitle({
        title: result.package.title || '套餐'
      });
      for (var i = 0; i < packgoods.length;i++){
        if (packgoods[i].option==""){
          good[i] = { goodsid: packgoods[i].goodsid, optionid: '' }

        }else{
          good[i] = { goodsid: packgoods[i].goodsid, optionid: null }
        }
      }
      console.log(good)
      $this.setData({
        packgoods:packgoods,
        package: result.package,
        good: good
      })
    });
  },
  option:function(e){
    var $this = this;
    // console.log(e.currentTarget.dataset.goodsid)
    var goodsid = e.currentTarget.dataset.goodsid;
    var index = e.currentTarget.dataset.index;
    core.get('package.get_option', { pid: $this.data.pid, goodsid: goodsid}, function (result) {
      $this.setData({
        option_mask:true,
        option: result.option,
        index: index
      })
    });
  },
  back: function (e) {
    var $this = this;
    wx.setStorage({
      key: "mydata",
      data: {id:e.currentTarget.dataset.id},
      success: function () {
        wx.navigateBack();   //返回上一个页面
      }
    })
  },
  close:function(){
    this.setData({
      option_mask:false
    })
  },
  choose: function (e) {
    var optionid = e.currentTarget.dataset.optionid;
    var option_title = e.currentTarget.dataset.title;
    var index = e.currentTarget.dataset.index;//option下标
    var packgoods = this.data.packgoods;
    var packageprice = this.data.option[index].packageprice;//所选option价格
    packgoods[this.data.index].packageprice = packageprice;//所选option价格替换商品价格
    var sum =0;//套餐价格
    console.log(this.data.option[index].packageprice);
    console.log(packgoods[this.data.index]);
    console.log(packgoods);
    for (var i = 0; i < packgoods.length;i++){
      sum += packgoods[i].packageprice*1
    }
    console.log(sum);
    this.setData({
      option_active: optionid,
      option_title: option_title,
      sum: sum
    })
  },
  confirm: function (){
    var packgoods = this.data.packgoods;
    var index = this.data.index;
    var option_active = this.data.option_active;
    var option_title = this.data.option_title;
    var good = this.data.good;
    packgoods[index].optionname = option_title;
    good[index].optionid = option_active;
    this.setData({
      option_mask: false,
      packgoods: packgoods,
      good: good
    })
  },
  buy:function(){
    var $this = this;
    var good = this.data.good;
    console.log(good)
    var all=true;
    for(var i=0;i<good.length;i++){
      if (good[i].optionid == null){
        all=false
      }
    }
    if(!all){
      foxui.toast(this, '请选择规格！')
    }else{
      good = JSON.stringify(good);
      wx.redirectTo({
        url: '/pages/order/create/index?packageid=' + $this.data.package.id + '&goods=' + good,
      });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})