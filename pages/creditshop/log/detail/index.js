var app = getApp();
var core = app.requirejs('core');
var icons = app.requirejs('icons');
var foxui = app.requirejs('foxui');
var parser = app.requirejs('wxParse/wxParse');
var $ = app.requirejs('jquery');
// pages/integral/order/detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options:[],
    log:[],
    logid:0,
    store:[],
    stores:[],
    goods:[],
    verifynum:0,
    replyset: [],
    ordercredit: 0,
    ordermoney: 0,
    address: [],
    carrier: [],
    shop: [],
    allmoney: [],
    togglestore:'',
    togglecode:'',
    verify:[],
    iswechat:true,
    paymentmodal:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var $this = this;
    options = options || {};
    wx.getSystemInfo({
      success: function (result) {
        $this.setData({
          windowWidth: result.windowWidth,
          windowHeight: result.windowHeight
        });
      }
    });
    $this.setData({ options: options ,logid:options.id});
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
    var $this = this;
    // var specs = [];
    // var options = [];
    var isIpx = app.getCache('isIpx');

    if (isIpx) {
      $this.setData({
        isIpx: true,
        iphonexnavbar: 'fui-iphonex-navbar'
      })
    } else {
      $this.setData({
        isIpx: false,
        iphonexnavbar: ''
      })
    }
    $this.getDetail();
    /*获取授权*/
    wx.getSetting({
      success: function (res) {
        var limits = res.authSetting['scope.userInfo'];
        $this.setData({ limits: limits })
      }
    })
  },
  getDetail:function(){
    var $this = this;
    var options = $this.data.options;
    core.get('creditshop/log/detail', options, function (result) {
      if (result.error == 0) {
        var allmoney = parseFloat(result.ordermoney) + parseFloat(result.log.dispatch);
        $this.setData({
          log: result.log,
          store: result.store,
          stores: result.stores,
          goods: result.goods,
          verifynum: result.verifynum,
          log: result.log,
          replyset:result.set,
          ordercredit: result.ordercredit,
          ordermoney: result.ordermoney,
          address: result.address,
          carrier: result.carrier,
          shop: result.shop,
          allmoney: allmoney,
          verify: result.verify,
        });
        var allprice = 0;
        if (result.goods.isverify == 0 && result.address.lenght > 0) {
          core.get('creditshop/dispatch', { goodsid: result.goods.id, optionid: options.id }, function (res) {
            allprice = res.dispatch;
            $this.setData({ dispatchprice: allprice });
          });
        }
        allprice = parseFloat(allprice) + parseFloat(result.goods.money);
        $this.setData({ allprice: allprice });
      }

    });
  },
  toggle: function (e) {
    var $this = this;
    var togglestore = $this.data.togglestore;
    if (togglestore == '') {
      $this.setData({ togglestore: 'toggleSend-group' });
    } else {
      $this.setData({ togglestore: '' });
    }
  },
  togglecode: function (e) {
    var $this = this;
    var togglecode = $this.data.togglecode;
    if (togglecode == '') {
      $this.setData({ togglecode: 'toggleSend-group' });
    } else {
      $this.setData({ togglecode: '' });
    }
  },
  finish:function(){
    var $this = this;
    wx.showModal({
      title: '提示',
      content: '确认已收到货了吗？',
      success: function (sm) {
        if (sm.confirm) {
          var logid = $this.data.log.id;
          core.get('creditshop/log/finish', { id: logid}, function (res) {
            if (res.error == 0) {
              foxui.toast($this, "确认收货");
              $this.onShow();
            }else{
              foxui.toast($this, res.message);
              return;
            }
          });
        } 
      }
    })
  },
  paydispatch:function(e){
    var $this = this;
    var dispatchtype = e.currentTarget.dataset.paytype;
    var content = '';
    if (dispatchtype =='dispatch'){
      content = "确认兑换并支付运费吗";
    }else{
      content = "确认兑换吗";
    }
    wx.showModal({
      title: '提示',
      content: content,
      success: function (sm) {
        if (sm.confirm) {
          var logid = $this.data.log.id;
          var dispatchprice = $this.data.goods.dispatch;          
          core.get('creditshop/log/paydispatch', { id: logid,addressid:$this.data.address.id,dispatchprice:dispatchprice}, function (res) {
            if (res.error > 0) {
              fui.toast($this, res.message);
              return;
            }
            if (res.wechat && res.wechat.success) {
              core.pay(res.wechat.payinfo, function (res) {
                if (res.errMsg == "requestPayment:ok") {
                  $this.payResult()
                }
              });
            } 
          });          
        }
      }
    })
  },
  payResult:function(){
    var $this = this;
    core.get('creditshop/log/paydispatchresult', { id: $this.data.log.id}, function (res) {
      if (res.error > 0) {
        fui.toast($this, res.message);
        return;
      }
      $this.onShow();
    });
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