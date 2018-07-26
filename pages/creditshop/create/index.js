/**
 *
 * index.js
 *
 * @create 2017-01-04
 * @author 咖啡
 *
 *
 */
var app = getApp();
var core = app.requirejs('core');
var icons = app.requirejs('icons');
var foxui = app.requirejs('foxui');
var parser = app.requirejs('wxParse/wxParse');
var $ = app.requirejs('jquery');
Page({
  data: {
    paymentmodal:false,
    showmodal:false,
    successmodal: false,
    member:[],
    goods: [],
    options:[],
    carrierInfo:[],
    stores:[],
    is_openmerch:false,
    isverify:false,
    iswechat:true,
    iscredit:true,
    paytype:'',
    togglestore:'',
    addressid:0,
    dispatchprice:0,
    allprice:0,
    logid:0,
    successmessage:'',
    successstatus:false,
  },
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
    $this.setData({ options: options });
  },
  /*页面加载*/
  onShow: function () {
    var $this = this;
    // var specs = [];
    // var options = [];
    var isIpx = app.getCache('isIpx');
    var address = app.getCache("orderAddress"), shop = app.getCache("orderShop");
    if (shop) {
      $this.setData({
        carrierInfo: shop
      });
    }
    var addressid = $this.data.addressid;
    if(addressid!=address.id && address.id>0 ){
      $this.setData({addressid:address.id});
      $this.dispatch();
    }

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
    var member = $this.data.member;
    if(member==''){
      $this.getDetail();
    }
    
    /*获取授权*/
    wx.getSetting({
      success: function (res) {
        var limits = res.authSetting['scope.userInfo'];
        $this.setData({ limits: limits })
      }
    })
  },
  /*核销人员信息*/
  listChange: function (e) {
    var member = this.data.member, id = e.target.id;
    switch (id) {
      case 'realname': member.realname = e.detail.value; break;
      case 'mobile': member.mobile = e.detail.value; break;
    }
    this.setData({
      member: member
    })
  },
  /*订单详情*/
  getDetail:function(){
    var $this = this;
    var options = $this.data.options;
    core.get('creditshop/create', options, function (result) {
      if(result.error==0){
        result.goods.num = 1;
        $this.setData({
          goods: result.goods,
          address: result.address,
          shop: result.shop,
          stores: result.stores,
          isverify: result.goods.isverify,
          member: result.member,
          addressid:result.address.id
        });
        var allprice = 0;
        if (result.goods.isverify == 0 && result.goods.type==0 && result.address.id>0) {
          $this.dispatch();
        }else{
          $this.setData({ allprice: result.goods.money });
        }
        
      }
      
    });
  },
  dispatch:function(){
    core.get('creditshop/create/dispatch', { goodsid: result.goods.id, optionid: options.id }, function (res) {
      allprice = res.dispatch;
      allprice = parseFloat(allprice) + parseFloat(result.goods.money);
      $this.setData({ dispatchprice: res.dispatch, allprice: allprice });
    });    
  },
  number: function (e) {
    var $this = this,
      goods = $this.data.goods,
      options = $this.data.options;
    var action = e.target.dataset.action;
    if (action=='minus'){
      goods.num = parseInt(goods.num) - 1;
    } else if (action == 'plus') {
      goods.num = parseInt(goods.num) + 1;
    }
    if (goods.num<1){
      goods.num = 1;
    }
    var num = goods.num;
    core.get('creditshop/create/number', { goodsid: goods.id, optionid: options.id, num: num}, function (res) {
      if (res.goods.canbuy == false) {
        if (goods.num>1){
          goods.num = parseInt(goods.num)-1;
        }
        $this.setData({goods:goods});
        foxui.toast($this, res.goods.buymsg);
        return;
      } else {
        goods = res.goods;
        goods.num = num;
        var allprice = parseFloat(goods.money * num) + parseFloat(goods.dispatch);
        $this.setData({ goods: goods, allprice: allprice});
      }
    });  
  },
  /*
  inputNumber:function(e){
    var $this = this;
    var goods = $this.data.goods;
    var options = $this.data.options;
    goods.num = parseInt(e.detail.value);
    var num = goods.num;
    core.get('creditshop/create/number', { goodsid: goods.id, optionid: options.id, num: num }, function (res) {
      if (res.goods.canbuy == false) {
        if (goods.num > 1) {
          goods.num = parseInt(goods.num) - 1;
        }
        $this.setData({ goods: goods });
        foxui.toast($this, res.goods.buymsg);
        return;
      } else {
        goods = res.goods;
        var allprice = parseFloat(goods.money * num) + parseFloat(goods.dispatch);
        $this.setData({ goods: goods, allprice: allprice });
      }
    });  
  },*/
  // 立即支付
  pay: function(){
    var $this = this;
    var goods = $this.data.goods;
    if (!goods.canbuy) {
      foxui.toast($this, $this.data.goods.buymsg);
      return;
    }
    /*核销商品提交订单*/
    if (goods.isverify>0){
      var member = $this.data.member;
      if(member.realname==''){
        foxui.toast($this, "请填写真实姓名");
        return;
      }
      if(member.mobile==''){
        foxui.toast($this, "请填写联系电话");
        return;
      }
      var carrierInfo = $this.data.carrierInfo;
      if (carrierInfo.length==0){
        foxui.toast($this, "请选择兑换门店");
        return;
      }
    }
    /*选择地址*/
    if (goods.isverify == 0 && goods.goodstype == 0 && goods.type==0){
      var addressid = $this.data.addressid;
      if(addressid==0){
        foxui.toast($this, "请选择收货地址");
        return;
      }
    }
    if (goods.type == 1){
      $this.setData({ addressid: 0 });
    }

    $this.setData({ paymentmodal:true});
  },
  // 取消
  cancel: function() {
    var $this = this;
    $this.setData({ paymentmodal: false, showmodal: false});
  },
  /*支付*/
  payClick:function(e){
    var $this = this;
    var paytype = e.target.dataset.type;
    $this.setData({ paymentmodal: false, showmodal: true, paytype: paytype});
  },
  // 确定
  confirm: function() {
    var $this = this;
    var paytype = $this.data.paytype;
    core.get('creditshop/detail/pay', { id: $this.data.goods.id, optionid: $this.data.optionid, num: $this.data.goods.num, paytype: $this.data.paytype, addressid: $this.data.addressid, storeid: $this.data.carrierInfo.id}, function (res) {
      if(res.error>0){
        foxui.toast($this, res.message);
        return;
      }
      $this.setData({ logid: res.logid});
      if (res.wechat && res.wechat.success) {
        core.pay(res.wechat.payinfo, function (res) {
          if (res.errMsg == "requestPayment:ok") {
            $this.lottery()
          }
        });
      } 
      if (paytype =='credit' && res.logid>0){
        $this.lottery();
      }
      
    });   
  },
  /*确认兑换成功*/
  success:function(){
    var $this = this;
    var logid = $this.data.logid;
    //$this.setData({ successmodal:false});
    wx.redirectTo({
      url: '/pages/creditshop/log/detail/index?id='+logid ,
    });
  },
  lottery:function(){
    var $this = this;
    var gtype = $this.data.goods.type;
    var successmessage = '';
    if(gtype==0){
      core.get('creditshop/detail/lottery', { id: $this.data.goods.id, logid:$this.data.logid}, function (res) {
        if (res.error > 0) {
          foxui.toast($this, res.message);
          return;
        }
        if (res.status==2){
          successmessage = "恭喜您，商品兑换成功";
        }
        if(res.status==3){
          if (res.goodstype==1){
            successmessage = "恭喜您，优惠券兑换成功";
          } else if (res.goodstype == 2){
            successmessage = "恭喜您，余额兑换成功";
          } else if (res.goodstype == 3){
            successmessage = "恭喜您，红包兑换成功";
          }
        }
        $this.setData({ successmessage: successmessage,successstatus:true})
      });   
    }else{
      successmessage = "努力抽奖中，请稍后....";
      $this.setData({ successmessage: successmessage, successstatus: true })
      setTimeout(function(){
        core.get('creditshop/detail/lottery', { id: $this.data.goods.id, logid:$this.data.logid}, function (res) {
          if (res.error > 0) {
            foxui.toast($this, res.message);
            return;
          }
          if (res.status==2){
            successmessage = "恭喜您，您中奖啦";
          }else if(res.status==3){
            if (res.goodstype==1){
              successmessage = "恭喜您，优惠券已经发到您账户啦";
            } else if (res.goodstype == 2){
              successmessage = "恭喜您，余额已经发到您账户啦";
            } else if (res.goodstype == 3){
              successmessage = "恭喜您，红包兑换成功";
            }
          }else{
            successmessage = "很遗憾，您没有中奖";
          }
          $this.setData({ successmessage: successmessage,successstatus:true})
        });   
      },1000);

    }
    $this.setData({ successmodal: true });
  },
  toggle: function (e) {
    var $this = this;
    var togglestore = $this.data.togglestore;
    if (togglestore==''){
      $this.setData({ togglestore:'toggleSend-group'});
    }else{
      $this.setData({ togglestore: '' });
    }
    
  },

})