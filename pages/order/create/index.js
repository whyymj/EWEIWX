/**
 *
 * order/create/index.js
 *
 * @create 2017-1-5
 * @author Young
 *
 * @update  Young 2017-01-10
 *
 */
var app = getApp();
var core = app.requirejs('core');
var foxui = app.requirejs('foxui');
var diyform = app.requirejs('biz/diyform');
var $ = app.requirejs('jquery');
var selectdate = app.requirejs('biz/selectdate');

Page({
  data: {
    icons: app.requirejs('icons'),
    list: {},
    goodslist: {},
    data: {
      dispatchtype: 0,
      remark: ''
    },
    areaDetail: {
      detail: {
        realname: '',
        mobile: '',
        areas: '',
        street: '',
        address: ''
      },
    },
    merchid: 0,
    showPicker: false,
    pvalOld: [0, 0, 0],
    pval: [0, 0, 0],
    areas: [],
    street: [],
    streetIndex: 0,
    noArea: false,
    showaddressview: false,
    city_express_state: false,

    // 以下 周期购
    currentDate: "",
    dayList: '',
    currentDayList: '',
    currentObj: '',
    currentDay: '',
    cycelbuy_showdate: '',
    receipttime: '',
    scope: '',
    bargainid: '',

    //会员卡
    selectcard: ''
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var $this = this, goodslist = [];


    if (options.goods) {
      var goods = JSON.parse(options.goods);
      options.goods = goods;
      this.setData({ ispackage: true })
    }
    $this.setData({ options: options });
    $this.setData({ bargainid: options.bargainid });
    app.url(options);
    
    core.get('order/create', $this.data.options, function (list) {
     
      if (list.error == 0) {
        
        goodslist = $this.getGoodsList(list.goods);
        var comboprice = ($this.data.originalprice - list.goodsprice).toFixed(2);
        $this.setData({
          list: list,
          goods: list,
          show: true,
          address: true,
          card_info: list.card_info || {},
          cardid: list.card_info.cardid || '',
          cardname: list.card_info.cardname || '',
          carddiscountprice: list.card_info.carddiscountprice,
          goodslist: goodslist,
          merchid: list.merchid,
          comboprice: comboprice,
          diyform: {
            f_data: list.f_data,
            fields: list.fields
          },
          city_express_state: list.city_express_state,
          cycelbuy_showdate: list.selectDate,
          receipttime: list.receipttime,
          iscycel: list.iscycel,
          scope: list.scope,
          fromquick: list.fromquick,
          hasinvoice: list.hasinvoice
        });

        app.setCache("goodsInfo", {
          goodslist: goodslist,
          merchs: list.merchs
        }, 1800);

      } else {
        core.toast(list.message, 'loading');
        setTimeout(function () {
          wx.navigateBack();
        }, 1000);
      }

      if (list.fullbackgoods != '') {
        if (list.fullbackgoods == undefined) {
          return
        }
        var fullbackratio = list.fullbackgoods.fullbackratio;
        var maxallfullbackallratio = list.fullbackgoods.maxallfullbackallratio;
        var fullbackratio = Math.round(fullbackratio);
        var maxallfullbackallratio = Math.round(maxallfullbackallratio);
        $this.setData({ fullbackratio: fullbackratio, maxallfullbackallratio: maxallfullbackallratio })
      }
      if (list.iscycel == 1) {
        $this.show_cycelbuydate();
      }

    });

    this.getQuickAddressDetail();
    app.setCache("coupon", '');
    setTimeout(function () {
      $this.setData({ areas: app.getCache("cacheset").areas })
    }, 3000)

  },


  show_cycelbuydate: function () {
    var $this = this;
    /*周期购时间选择器初始化*/
    var currentObj = selectdate.getCurrentDayString(this, $this.data.cycelbuy_showdate);
    var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    $this.setData({
      currentObj: currentObj,
      currentDate: currentObj.getFullYear() + '.' + (currentObj.getMonth() + 1) + '.' + currentObj.getDate() + ' ' + week[currentObj.getDay()],
      currentYear: currentObj.getFullYear(),
      currentMonth: (currentObj.getMonth() + 1),
      currentDay: currentObj.getDate(),
      initDate: Date.parse(currentObj.getFullYear() + '/' + (currentObj.getMonth() + 1) + '/' + currentObj.getDate()),
      checkedDate: Date.parse(currentObj.getFullYear() + '/' + (currentObj.getMonth() + 1) + '/' + currentObj.getDate()),
      maxday: $this.data.scope,//可选的天数
    })
  },

  onShow: function () {
    var $this = this, address = app.getCache("orderAddress"), shop = app.getCache("orderShop");
    var isIpx = app.getCache('isIpx');

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


    if (address) {
      this.setData({
        'list.address': address
      });
      $this.caculate($this.data.list);
    }
    if (shop) {

      this.setData({
        'list.carrierInfo': shop,
        'list.storeInfo': shop
      });
    }

    var coupon = app.getCache("coupon");

    if (typeof coupon == 'object' && coupon.id != 0) {
      this.setData({ 'data.couponid': coupon.id, 'data.couponname': coupon.name });
      core.post('order/create/getcouponprice', {
        couponid: coupon.id,
        goods: this.data.goodslist,
        goodsprice: this.data.list.goodsprice,
        discountprice: this.data.list.discountprice,
        isdiscountprice: this.data.list.isdiscountprice
      }, function (data) {
        if (data.error == 0) {
          delete data.$goodsarr;
          $this.setData({ coupon: data });
          $this.caculate($this.data.list);
        } else {
          core.alert(data.message);
        }
      }, true);
    } else {
      this.setData({ 'data.couponid': 0, 'data.couponname': null, coupon: null });
      if (!$.isEmptyObject($this.data.list)) {
        $this.caculate($this.data.list);
      }
    }
  },

  // 获取商品列表
  getGoodsList: function (list) {
    var goodslist = [];
    $.each(list, function (k, v) {
      $.each(v.goods, function (kk, vv) {
        goodslist.push(vv);
      });
    });
    
    var originalprice = 0;
    for (var i = 0; i < goodslist.length; i++) {
      originalprice += goodslist[i].price;
    }
    
    this.setData({
      originalprice: originalprice
    })
    return goodslist;
  },


  toggle: function (e) {
    var data = core.pdata(e), id = data.id, type = data.type, d = {};
    (id == 0 || typeof id == 'undefined') ? d[type] = 1 : d[type] = 0;
    this.setData(d);
  },
  phone: function (e) {
    core.phone(e);
  },
  dispatchtype: function (e) {
    var type = core.data(e).type;
    this.setData({
      'data.dispatchtype': type
    });
    this.caculate(this.data.list);
  },
  number: function (e) {
    var $this = this,
      dataset = core.pdata(e),
      val = foxui.number(this, e),
      id = dataset.id,
      list = $this.data.list,
      total = 0, goodsprice = 0.0;
    $.each(list.goods, function (k, v) {
      $.each(v.goods, function (kk, vv) {
        if (vv.id == id) {
          list.goods[k].goods[kk].total = val;
        }
        total += parseInt(list.goods[k].goods[kk].total);
        goodsprice += parseFloat(total * list.goods[k].goods[kk].price);
      });
    });
    list.total = total;
    list.goodsprice = $.toFixed(goodsprice, 2);
    $this.setData({
      list: list,
      goodslist: $this.getGoodsList(list.goods)
    });
    this.caculate(list);
  },
  caculate: function (list) {
    var $this = this;
    var couponid = 0;
    if ($this.data.data && $this.data.data.couponid != 0) {
      couponid = $this.data.data.couponid
    }

    core.post('order/create/caculate', {
      goods: this.data.goodslist,
      dflag: this.data.data.dispatchtype,
      addressid: this.data.list.address ? this.data.list.address.id : 0,
      packageid: this.data.list.packageid,
      bargain_id: this.data.bargainid,
      discountprice: this.data.list.discountprice,
      cardid: this.data.cardid,
      couponid: couponid,
    }, function (data) {
      console.error(data)
      list.dispatch_price = data.price;
      list.enoughdeduct = data.deductenough_money;
      list.enoughmoney = data.deductenough_enough;
      list.taskdiscountprice = data.taskdiscountprice;
      list.discountprice = data.discountprice;
      list.isdiscountprice = data.isdiscountprice;
      list.seckill_price = data.seckill_price;
      list.deductcredit2 = data.deductcredit2;
      list.deductmoney = data.deductmoney;
      list.deductcredit = data.deductcredit;
      list.gifts = data.gifts;
      if ($this.data.data.deduct) {
        data.realprice -= data.deductmoney  //减去积分抵扣的金额
      }
      if ($this.data.data.deduct2) {
        data.realprice -= data.deductcredit2
      }
      if ($this.data.coupon && typeof ($this.data.coupon.deductprice) != 'undefined') {
        $this.setData({ "coupon.deductprice": data.coupon_deductprice });
        data.realprice -= data.coupon_deductprice;
      }
      if (data.card_info) {
        list.card_free_dispatch = data.card_free_dispatch;
      }
      if ($this.data.goods.giftid == 0) {
        $this.setData({ "goods.gifts": data.gifts });
      }
      if (list.realprice <= 0) {
        list.realprice = 0.000001;
      }
      list.realprice = $.toFixed(data.realprice, 2);
      $this.setData({
        list: list,
        cardid: data.card_info.cardid,
        cardname: data.card_info.cardname,
        goodsprice: data.card_info.goodsprice,
        carddiscountprice: data.card_info.carddiscountprice,
        city_express_state: data.city_express_state
      });
    }, true);
  },
  submit: function () {
    var data = this.data, $this = this, diydata = this.data.diyform;
    var giftid = data.goods.giftid || data.giftid;
    if (this.data.goods.giftid == 0 && this.data.goods.gifts.length == 1) {
      giftid = this.data.goods.gifts[0].id;
     
    }
    
    if (data.submit) {
      return;
    }

    var verify = diyform.verify(this, diydata);
    if (!verify) {
      return;
    }

    data.list.carrierInfo = data.list.carrierInfo || {};

    var subdata = {
      'id': data.options.id ? data.options.id : 0,
      'goods': data.goodslist,
      'gdid': data.options.gdid,
      'dispatchtype': data.data.dispatchtype,
      'fromcart': data.list.fromcart,
      'carrierid': (data.data.dispatchtype == 1 && data.list.carrierInfo) ? data.list.carrierInfo.id : 0,
      'addressid': data.list.address ? data.list.address.id : 0,
      'carriers': (data.data.dispatchtype == 1 || data.list.isvirtual || data.list.isverify) ? {
        'carrier_realname': data.list.member.realname,
        'carrier_mobile': data.list.member.mobile,
        'realname': data.list.carrierInfo.realname,
        'mobile': data.list.carrierInfo.mobile,
        'storename': data.list.carrierInfo.storename,
        'address': data.list.carrierInfo.address
      } : '',
      'remark': data.data.remark,
      'deduct': data.data.deduct,
      'deduct2': data.data.deduct2,
      'couponid': data.data.couponid,
      'cardid': data.cardid,
      'invoicename': data.list.invoicename,
      'submit': true,
      'packageid': data.list.packageid,
      'giftid': giftid,
      'diydata': data.diyform.f_data,
      'receipttime': data.receipttime,
      'bargain_id': $this.data.options.bargainid,
      'fromquick': data.fromquick
    };

    if (data.list.storeInfo) {
      subdata.carrierid = data.list.storeInfo.id;
    }
    if (data.data.dispatchtype == 1 || data.list.isvirtual || data.list.isverify) {
      if ($.trim(data.list.member.realname) == '' && data.list.set_realname == '0') {
        core.alert('请填写联系人!');
        return;
      }
      if ($.trim(data.list.member.mobile) == '' && data.list.set_mobile == '0') {
        core.alert('请填写联系方式!');
        return;
      }

      if (!/^[1][3-9]\d{9}$|^([6|9])\d{7}$|^[0][9]\d{8}$|^[6]([8|6])\d{5}$/.test($.trim(data.list.member.mobile))) {
        core.alert("请填写正确联系电话!");
        return;
      }

      if (data.list.isforceverifystore) {
        if (!data.list.storeInfo) {
          core.alert('请选择门店!');
          return;
        }
      }
      subdata.addressid = 0;
    } else {
      if (!subdata.addressid && !data.list.isonlyverifygoods) {
        core.alert('地址没有选择!');
        return;
      }
    }
    $this.setData({
      submit: true
    });
    core.post('order/create/submit', subdata, function (ret) {
      $this.setData({
        submit: false
      });
      if (ret.error != 0) {
        core.alert(ret.message);
        return;
      }
      wx.navigateTo({
        url: '/pages/order/pay/index?id=' + ret.orderid
      });
    }, true)
  },
  dataChange: function (e) {
    var data = this.data.data, list = this.data.list, id = e.target.id;
    switch (id) {
      case 'remark': data.remark = e.detail.value; break;
      case 'deduct':
        data.deduct = e.detail.value;
        if (data.deduct2) {
          return;
        }
        var realprice = parseFloat(list.realprice);
        realprice += data.deduct ? - parseFloat(list.deductmoney) : parseFloat(list.deductmoney);
        list.realprice = realprice;
        break;
      case 'deduct2':
        data.deduct2 = e.detail.value;
        if (data.deduct) {
          return;
        }
        var realprice = parseFloat(list.realprice);
        realprice += data.deduct2 ? - parseFloat(list.deductcredit2) : parseFloat(list.deductcredit2);
        list.realprice = realprice;
        break;
    }

    if (list.realprice <= 0) {
      list.realprice = 0.000001;
    }
    list.realprice = $.toFixed(list.realprice, 2);

    this.setData({
      data: data,
      list: list
    })
  },
  listChange: function (e) {
    var list = this.data.list, id = e.target.id;
    switch (id) {
      case 'invoicename': list.invoicename = e.detail.value; break;
      case 'realname': list.member.realname = e.detail.value; break;
      case 'mobile': list.member.mobile = e.detail.value; break;
    }
    this.setData({
      list: list
    })
  },
  url: function (e) {
    var url = core.pdata(e).url;
    wx.redirectTo({
      url: url
    });
  },
  onChange: function (e) {
    return diyform.onChange(this, e)
  },
  DiyFormHandler: function (e) {
    return diyform.DiyFormHandler(this, e)
  },
  selectArea: function (e) {
    return diyform.selectArea(this, e)
  },
  bindChange: function (e) {
    return diyform.bindChange(this, e)
  },
  onCancel: function (e) {
    return diyform.onCancel(this, e)
  },
  onConfirm: function (e) {
    diyform.onConfirm(this, e)

    var val = this.data.pval;
    var areas = this.data.areas;
    var detail = this.data.areaDetail.detail;
    detail.province = areas[val[0]].name;
    detail.city = areas[val[0]].city[val[1]].name;
    detail.datavalue = areas[val[0]].code + " " + areas[val[0]].city[val[1]].code;
    if (areas[val[0]].city[val[1]].area && areas[val[0]].city[val[1]].area.length > 0) {

      detail.area = areas[val[0]].city[val[1]].area[val[2]].name;
      detail.datavalue += " " + areas[val[0]].city[val[1]].area[val[2]].code;
      this.getStreet(areas, val);
    } else {
      detail.area = "";
    }

    detail.street = '';
    this.setData({ 'areaDetail.detail': detail, streetIndex: 0, showPicker: false });

    return
  },
  getIndex: function (str, areas) {
    return diyform.getIndex(str, areas)
  },
  //快速添加收货地址
  showaddressview: function (e) {

    var showaddressview = '';
    if (e.target.dataset.type == 'open') {
      showaddressview = true
    } else {
      showaddressview = false
    }
    this.setData({
      showaddressview: showaddressview
    })
  },
  onChange2: function (event) {
    var $this = this;
    var vname = $this.data.areaDetail.detail;
    var bindtype = event.currentTarget.dataset.type;

    var value = $.trim(event.detail.value);
    if (bindtype == 'street') {
      vname.streetdatavalue = $this.data.street[value].code
      value = $this.data.street[value].name;
    }
    vname[bindtype] = value;
    $this.setData({ 'areaDetail.detail': vname });
  },
  getStreet: function (areas, val) {
    if (!areas || !val) {
      return;
    }
    var $this = this;
    if (!$this.data.areaDetail.detail.province || !$this.data.areaDetail.detail.city || !this.data.openstreet) {
      return;
    }
    var city = areas[val[0]].city[val[1]].code;
    var area = areas[val[0]].city[val[1]].area[val[2]].code;

    core.get('getstreet', { city: city, area: area }, function (result) {
      var street = result.street;
      var data = { street: street };
      if (street && $this.data.areaDetail.detail.streetdatavalue) {
        for (var i in street) {
          if (street[i].code == $this.data.areaDetail.detail.streetdatavalue) {
            data.streetIndex = i;
            $this.setData({ 'areaDetail.detail.street': street[i].name });
            break;
          }
        }
      }
      $this.setData(data);
    });
  }, getQuickAddressDetail: function () {
    var $this = this;
    var id = $this.data.id;
    core.get('member/address/get_detail', { id: id }, function (result) {
      var data = { openstreet: result.openstreet, show: true };
      if (!$.isEmptyObject(result.detail)) {
        var area = result.detail.province + " " + result.detail.city + " " + result.detail.area;
        var index = $this.getIndex(area, $this.data.areas);
        data.pval = index;
        data.pvalOld = index;
        data.areaDetail.detail = result.detail;
      }
      $this.setData(data);
      if (result.openstreet && index) {
        $this.getStreet($this.data.areas, index);
      }
    });
  },
  submitaddress: function () {
    var $this = this;
    var detail = $this.data.areaDetail.detail;
    if ($this.data.posting) {
      return;
    }
    if (detail.realname == '' || !detail.realname) {
      foxui.toast($this, "请填写收件人");
      return;
    } if (detail.mobile == '' || !detail.mobile) {
      foxui.toast($this, "请填写联系电话");
      return;
    }
    if (detail.city == '' || !detail.city) {
      foxui.toast($this, "请选择所在地区");
      return;
    }
    if ($this.data.street.length > 0 && (detail.street == '' || !detail.street)) {
      foxui.toast($this, "请选择所在街道");
      return;
    }
    if (detail.address == '' || !detail.address) {
      foxui.toast($this, "请填写详细地址");
      return;
    }

    if (!detail.datavalue) {
      foxui.toast($this, "地址数据出错，请重新选择");
      return;
    }

    detail.id = 0;
    $this.setData({ posting: true });
    core.post('member/address/submit', detail, function (result) {
      if (result.error != 0) {
        $this.setData({ posting: false });
        foxui.toast($this, result.message);
        return;
      }

      detail.id = result.addressid;

      $this.setData({ showaddressview: false, 'list.address': detail });
      core.toast("保存成功");
    });

  },
  //赠品弹层
  giftPicker: function () {
    this.setData({
      active: 'active',
      gift: true
    })
  },
  //关闭pickerpicker
  emptyActive: function () {
    this.setData({
      active: '', slider: 'out', tempname: '', showcoupon: false, gift: false
    });
  },
  radioChange: function (e) {
    
    this.setData({
      giftid: e.currentTarget.dataset.giftgoodsid,
      gift_title: e.currentTarget.dataset.title,
    })
  },
  /*同城配送*/
  sendclick: function () {
    wx.navigateTo({
      url: '/pages/map/index'
    });
  },
  // 清除表单内容
  clearform: function () {
    var diyform = this.data.diyform;
    var new_fdata = {};
    $.each(diyform, function (k, v) {  //lgt 清除表单时保留图片上传功能
      $.each(v, function (key, value) {
        if (value.data_type == 5) {
          diyform.f_data[value.diy_type].count = 0;
          diyform.f_data[value.diy_type].images = [];
          new_fdata[value.diy_type] = diyform.f_data[value.diy_type];
        }
      });
    });
    diyform.f_data = new_fdata;
    this.setData({
      diyform: diyform
    })
  },

  // 取消时间选择时间
  syclecancle: function () {
    this.setData({
      cycledate: false
    });
  },
  //确定选择时间
  sycleconfirm: function () {
    this.setData({
      cycledate: false
    });
  },
  // 周期购 修改送达时间
  editdate: function (e) {
    selectdate.setSchedule(this);
    this.setData({
      cycledate: true,
      create: true,
    });
  },

  //时间选择器 前后月份选择
  doDay: function (e) {
    selectdate.doDay(e, this);
  },
  //周期购选择时间
  selectDay: function (e) {
    selectdate.selectDay(e, this);
    selectdate.setSchedule(this);
  },

  // 弹出发票picker
  showinvoicepicker: function () {
    var tempdata = this.data.list;
    if (tempdata.invoice_type == 0) { //only纸质
      tempdata.invoice_info.entity = true;
    }
    if (tempdata.invoice_type == 1) { //only电子
      tempdata.invoice_info.entity = false;
    }
    this.setData({
      invoicepicker: true,
      list: tempdata
    })
  },
  noinvoicepicker: function () {
    this.setData({
      invoicepicker: false
    })
  },
  // 清空数据
  clearinvoice: function () {
    var tempdata = this.data.list;
    tempdata.invoicename = '';
    this.setData({
      invoicepicker: false,
      list: tempdata
    })
  },
  // 修改电子纸质类型发票
  chaninvoice: function (e) {
    var tempdata = this.data.list;
    if (e.currentTarget.dataset.type == '0') {
      tempdata.invoice_info.entity = false;
    } else {
      tempdata.invoice_info.entity = true;
    }
    this.setData({
      list: tempdata
    })
  },
  // 修改发票类型
  changeType: function (e) {
    var tempdata = this.data.list;
    if (e.currentTarget.dataset.type == '0') {
      tempdata.invoice_info.company = false;
    } else {
      tempdata.invoice_info.company = true;
    }
    this.setData({
      list: tempdata
    })
  },
  // input发票抬头
  invoicetitle: function (e) {
    var tempdata = this.data.list;
    tempdata.invoice_info.title = e.detail.value.replace(/\s+/g, '')
    this.setData({
      list: tempdata
    })
  },

  // input发票税号
  invoicenumber: function (e) {
    var tempdata = this.data.list;
    tempdata.invoice_info.number = e.detail.value.replace(/\s+/g, '')
    this.setData({
      list: tempdata
    })
  },

  // 发票确定按钮
  confirminvoice: function () {
    var tempdata = this.data.list;
    if (!tempdata.invoice_info.company) {
      this.setData({
        invoicenumber: ''
      })
    }
    var str1 = tempdata.invoice_info.entity ? '[纸质] ' : '[电子] ';
    var str2 = tempdata.invoice_info.title + ' ';
    var str3 = tempdata.invoice_info.company ? '（单位: ' + tempdata.invoice_info.number + '）' : '（个人）';
   
    tempdata.invoicename = str1 + str2 + str3;
    if (!tempdata.invoice_info.title) {
      foxui.toast(this, "请填写发票抬头");
    } else if (tempdata.invoice_info.company && !tempdata.invoice_info.number) {
      foxui.toast(this, "请填写税号");
    } else {
      this.setData({
        list: tempdata,
        invoicepicker: false
      })
    }
  },

  // 选择会员卡
  selectCard: function () {
    var $this = this;
    $this.setData({ selectcard: 'in' })
  },

  // 不使用会员卡
  cancalCard: function () {
    this.setData({ cardid: '' })
  },

  // 切换会员卡
  changecard: function (e) {
    var $this = this, card_info = $this.data.card_info;
    $this.setData({ selectcard: '', cardid: e.currentTarget.dataset.id })
    var id = e.currentTarget.dataset.id;

    var args = {
      cardid: id,
      goodsprice: this.data.list.goodsprice,
      dispatch_price: this.data.list.dispatch_price,
      discountprice: this.data.list.discountprice
    }
    core.post('order/create/getcardprice', args, function (data) {
      if (id != '') {
        if (data.error == 0) {
          var obj = {
            carddiscount_rate: data.carddiscount_rate,
            carddiscountprice: data.carddiscountprice,
            cardid: data.cardid,
            cardname: data.name,
            dispatch_price: data.dispatch_price,
            totalprice: data.totalprice,
            comboprice: 0
          }
          $this.setData(obj);
          $this.caculate($this.data.list);
        } else {
          core.alert(data.message);
        }
      } else {
        var card_obj = {
          cardid: '',
          selectcard: '',
          cardname: '',
          carddiscountprice: 0,
          ispackage: false
        }
        var comboprice = ($this.data.originalprice - $this.data.list.goodsprice).toFixed(2);
        if ($this.data.options.goods) {
          card_obj.ispackage = true;
          card_obj.comboprice = comboprice;
        }
        $this.setData(card_obj);
        if (!$.isEmptyObject($this.data.list)) {
          $this.caculate($this.data.list);
        }
      }
    }, true);

  },

  // 关闭选择会员卡弹窗
  closeCardModal: function () {
    var $this = this;
    $this.setData({ selectcard: '' })
  }
});