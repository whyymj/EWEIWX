// pages/mall_index/mall_index.js
var app = getApp()
var core = app.requirejs('core');
var goodspicker = app.requirejs('biz/goodspicker'), foxui = app.requirejs('foxui'), diyform = app.requirejs('biz/diyform');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    arrLabel: [],
    num: [],  // 购物车商品数量
    clickCar: false, // 点击出现购物车列表
    num: 0,
    change: false,
    div: false,
    numtotal: [],
    clearcart: true,
    canBuy: '',
    // 购物车
    specs: [],
    options: [],
    diyform: {},
    specsTitle: '',
    total: 1,
    active: '',
    slider: '',
    tempname: '',
    buyType: '',
    areas: [],
    closeBtn: false,
    soundpic: true,
    closespecs: false,
    buyType: 'cart',
    quickbuy: true,
    formdataval: {},
    showPicker: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    var pageid = options.id;

    if (pageid==undefined){
        var pages = getCurrentPages(); //获取页面栈
        var url_arr = pages[pages.length - 1].route.split("/");//当前页面路径/分割后的数组
        pageid = url_arr[url_arr.length - 1];
    }



    var that = this;
    let systemInfo = wx.getStorageSync('systemInfo');

    this.busPos = {};
    this.busPos['x'] = 45;//购物车的位置
    this.busPos['y'] = app.globalData.hh - 80;

    this.setData({
      goodsH: systemInfo.windowHeight - 245 - 48,
      pageid: pageid
    });
    // 左边选项卡切换控制数组
    var arrLab = [1];
    for (var i = 1; i < that.data.arrLabel.length; i++) {
      arrLab.push(0);
    }
    that.setData({
      arrLab: arrLab,
    })


    core.get('quick/index/main', { id: this.data.pageid }, function (ret) {
      console.log(ret);


      var arr = []; // 商品在购物车中的数量

      var style = ''; // 样式
      style = ret.style.shopstyle == 1 ? 'changeCss2' : (ret.style.shopstyle == 2 ? 'changeCss3' : '')

      style += ' ' + ret.style.logostyle

      that.setData({
        main: ret,
        group: ret.group,
        goodsArr: ret.goodsArr,
        arrCart: arr,
        style: style
      })






      var id = that.data.main.cartdata == 1 ? that.data.pageid : '';
      var numtotal = [];







      // 计算高度
      if (that.data.main.advs) {
        if (that.data.main.advs.length > 0) {
          var arr = [198];
          var goodslength = 198;
        }
      } else {
        var arr = [18];
        var goodslength = 18;
      }
      // console.log(111)
      for (var i = 0; i < that.data.main.group.length; i++) {
        if (that.data.main.goodsArr[that.data.main.group[i].type]) {
          var templength = that.data.main.goodsArr[that.data.main.group[i].type].length ? that.data.main.goodsArr[that.data.main.group[i].type].length : 0.6;
          goodslength = goodslength + templength * 106 + 66;
          arr.push(goodslength)
          that.setData({
            arrscroll: arr
          })

        }

        // console.log(that.data.arrscroll)
      }



      var id = that.data.main.cartdata == 1 ? that.data.pageid : '';
      core.get('quick/index/getCart', { quickid: id }, function (ret) {
        // console.log("购物车",ret);
        var numtotal = [];
        for (var i in ret.simple_list) {
          // console.log(i + "=" + ret.simple_list[i])
          numtotal[i] = ret.simple_list[i];
        }
        that.setData({
          numtotal: numtotal
        })
      })

      wx.hideLoading();
      wx.setNavigationBarTitle({
        title: ret.pagetitle
      })
    })
  },

  // 导航菜单跳转
  menunavigage: function (e) {
      wx.navigateTo({
          url:  e.currentTarget.dataset.url,
          fail: function () {
              wx.switchTab({
                  url: url,
              })
          }
      })
  },

  // 幻灯片跳转
  gobigimg: function (e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.link,
    })
  },

  // 左边选项卡切换方法
  clickLab: function (e) {
    var id = e.currentTarget.dataset.id; //左侧点击跳转id
    // console.log(id)
    var arr = this.data.arrLab;
    for (var i = 0; i < arr.length; i++) {
      arr[i] = 0;
    }
    arr[id] = 1;
    // console.log(arr);
    this.setData({
      arrLab: arr,
      id: e.currentTarget.dataset.id
    })
  },
  // 查看购物车列表
  shopCarList: function () {
    var that = this;
    this.setData({
      clickCar: true,
      cartcartArr: [],
      showPicker: true
    })
    var id = this.data.main.cartdata == 1 ? this.data.pageid : '';
    // console.log(id)
    core.get('quick/index/getCart', { quickid: id }, function (ret) {
      console.log(ret);
      var main = that.data.main;
      main.cartList = ret
      that.setData({
        main: main
      })

      var tempcartid = [];
      for (var i = 0; i < ret.list.length; i++) {
        tempcartid[i] = ret.list[i].goodsid;
      }
      that.setData({
        tempcartid: tempcartid
      })
      console.log(that.data.tempcartid)
    })
  },
  shopCarHid: function () {
    this.setData({
      clickCar: false,
      showPicker: false
    })
  },




  // 购买picker
  selectPicker: function (e) {
    var $this = this;
    wx.getSetting({
      success: function (res) {
        var limits = res.authSetting['scope.userInfo'];
        if (limits) {
          var goodslist = 'goodslist';
          goodspicker.selectpicker(e, $this, goodslist)
          $this.setData({
            cover: '',
            showvideo: false
          });
        } else {
          $this.setData({ modelShow: true })
          return
        }
      }
    })
  },
  // 选规格
  specsTap: function (event) {
    var $this = this
    goodspicker.specsTap(event, $this)
  },
  //关闭pickerpicker
  emptyActive: function () {
    this.setData({
      active: '', slider: 'out', tempname: '', specsTitle: '', showPicker: false
    });
  },
  // 立即购买
  buyNow: function (event) {
    var $this = this
    goodspicker.buyNow(event, $this)
  },
  //加入购物车
  getCart: function (event) {
    var $this = this
    goodspicker.getCart(event, $this)
  },
  select: function () {
    var $this = this
    goodspicker.select($this)
  },
  //数量输入绑定事件
  inputNumber: function (e) {
    var $this = this
    goodspicker.inputNumber(e, $this)
  },
  number: function (e) {
    var $this = this
    goodspicker.number(e, $this)
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
    return diyform.onConfirm(this, e)
  },
  getIndex: function (str, areas) {
    return diyform.getIndex(str, areas)
  },

  closespecs: function () {
    this.setData({
      closespecs: false
    })
  },


  /**
   * 生命周期函数--监听页面滚动
   */
  onPageScroll: function (e) {
    // console.log(e);
    // if (e.scrollTop>=230) { // 切换样式
    //   console.log('到了')
    //   this.setData({
    //     top230: true
    //   })
    // }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  // 弹窗picker点击确定按钮或单规格商品加入购物车
  addCartquick: function (a, b) {
    console.log(a + ";" + b);
    var that = this;

    var numbers = that.data.numtotal;
    var id = this.data.main.cartdata == 1 ? this.data.pageid : '';


    // 加入购物车
    core.get('quick/index/update', {
      quickid: id,
      goodsid: that.data.goodsid,
      optionid: a ? a : '',
      update: '',
      total: '',
      type: that.data.addtype,
      typevalue: b ? b : '',
      diyformdata: that.data.formdataval ? that.data.formdataval : ''
    }, function (ret) {
      console.log(ret);


      // 如果达到最大购买数量或者超出库存，提示错误信息
      if (ret.error != 0) {
        that.setData({
          cantclick: true
        })
        foxui.toast(that, ret.message);
        that.setData({
          active: '', slider: 'out', isSelected: true, tempname: '', showPicker: false
        })
      } else {
        // 修改底部购物车的数据
        var main = that.data.main;
        main.cartList.total = ret.total;
        main.cartList.totalprice = ret.totalprice;
        main.cartList.list = [1];

        numbers[that.data.goodsid] = ret.goodstotal;
        // console.log(numbers[e.currentTarget.dataset.id])
        // console.log(Boolean(numbers[e.currentTarget.dataset.id]))
        that.setData({
          numtotal: numbers,
          main: main,
          clearcart: true,
          active: '', slider: 'out', isSelected: true, tempname: '', showPicker: false,
          formdataval: {}
        })
        if (that.data.addtype == 'value') {
          // that.animate(that.data.mouse)
        }
      }


      // $this.setData({  });


    })
  },

  //添加商品到购物车
  addGoodToCartFn: function (e) {
    var that = this;
    var modeltakeout = this.data.main.cartdata == 1 ? 'takeoutmodel' : 'shopmodel';
    if (!e.currentTarget.dataset.canadd) {
      modeltakeout = 'cantaddcart'
    }
    console.log(that.data.formdataval)
    // console.log(e)
    that.setData({
      morechose: e.currentTarget.dataset.more
    })
    // if(e.currentTarget.dataset.color!='#ccc') {
    that.setData({
      addtype: e.currentTarget.dataset.add,
      goodsid: e.currentTarget.dataset.id,
      mouse: e
    })
    if (that.data.addtype == 'reduce' && e.currentTarget.dataset.min == e.currentTarget.dataset.num) {
      that.setData({
        addtype: 'delete'
      })
    }
    // 如果有多规格减号
    if (e.currentTarget.dataset.more == '1' && that.data.addtype == 'reduce') {
      //如果点击减号且为多规格，提示在购物车中修改数量
      foxui.toast(that, "请在购物车中修改多规格商品");
    }
    else if (that.data.addtype == 'reduce' && e.currentTarget.dataset.min == e.currentTarget.dataset.num) {
      foxui.toast(that, "不能少于" + e.currentTarget.dataset.min + "件商品");
    }
    // 如果是多规格或有自定义表单 加号
    else if (e.currentTarget.dataset.more == '1' || e.currentTarget.dataset.diyformtype != '0' || !e.currentTarget.dataset.canadd) {
      if (that.data.addtype != 'reduce' && that.data.addtype != 'delete') {
        var goodslist = 'quickbuy';
        that.setData({
          showPicker: true,
          cycledate: false
        })
        goodspicker.selectpicker(e, that, goodslist, modeltakeout);
        console.log(123)

        // var tempname = 'select-picker';
        console.log(123)

      } else {
        that.setData({
          storenum: e.currentTarget.dataset.store,
          maxnum: e.currentTarget.dataset.maxnum
        })
        that.addCartquick('', 1);
      }
    }

    // 如果是单规格
    if (e.currentTarget.dataset.more != '1' && e.currentTarget.dataset.diyformtype == '0' && e.currentTarget.dataset.canadd) {
      that.setData({
        storenum: e.currentTarget.dataset.store,
        maxnum: e.currentTarget.dataset.maxnum
      })
      // 减号且不能再少
      if (that.data.addtype == 'reduce' && e.currentTarget.dataset.min == e.currentTarget.dataset.num) {
        foxui.toast(that, "不能少于" + e.currentTarget.dataset.min + "件商品");
      } else {
        that.addCartquick('', 1);
      }

    }
    // }
  },

  // 加购物车动画
  animate: function (e) {
    var that = this;

    that.finger = {}; var topPoint = {};
    that.finger['x'] = e.touches["0"].clientX;//点击的位置
    that.finger['y'] = e.touches["0"].clientY;

    if (that.finger['y'] < that.busPos['y']) {
      topPoint['y'] = that.finger['y'] - 150;
    } else {
      topPoint['y'] = that.busPos['y'] - 150;
    }
    topPoint['x'] = Math.abs(that.finger['x'] - that.busPos['x']) / 2;

    if (that.finger['x'] > that.busPos['x']) {
      topPoint['x'] = (that.finger['x'] - that.busPos['x']) / 2 + that.busPos['x'];
    } else {//
      topPoint['x'] = (that.busPos['x'] - that.finger['x']) / 2 + that.finger['x'];
    }

    //topPoint['x'] = that.busPos['x'] + 80
    //that.linePos = app.bezier([that.finger, topPoint, that.busPos], 30);
    that.linePos = that.bezier([that.busPos, topPoint, that.finger], 30);
    that.startAnimation(e);
  },
  bezier: function (pots, amount) {
    var pot;
    var lines;
    var ret = [];
    var points;
    for (var i = 0; i <= amount; i++) {
      points = pots.slice(0);
      lines = [];
      while (pot = points.shift()) {
        if (points.length) {
          lines.push(pointLine([pot, points[0]], i / amount));
        } else if (lines.length > 1) {
          points = lines;
          lines = [];
        } else {
          break;
        }
      }
      ret.push(lines[0]);
    }
    function pointLine(points, rate) {
      var pointA, pointB, pointDistance, xDistance, yDistance, tan, radian, tmpPointDistance;
      var ret = [];
      pointA = points[0];//点击
      pointB = points[1];//中间
      xDistance = pointB.x - pointA.x;
      yDistance = pointB.y - pointA.y;
      pointDistance = Math.pow(Math.pow(xDistance, 2) + Math.pow(yDistance, 2), 1 / 2);
      tan = yDistance / xDistance;
      radian = Math.atan(tan);
      tmpPointDistance = pointDistance * rate;
      ret = {
        x: pointA.x + tmpPointDistance * Math.cos(radian),
        y: pointA.y + tmpPointDistance * Math.sin(radian)
      };
      return ret;
    }
    return {
      'bezier_points': ret
    };
  },
  startAnimation: function (e) {
    var index = 0, that = this,
      bezier_points = that.linePos['bezier_points'];

    this.setData({
      hide_good_box: false,
      bus_x: that.finger['x'],
      bus_y: that.finger['y']
    })
    var len = bezier_points.length;
    index = len
    this.timer = setInterval(function () {
      index--;
      that.setData({
        bus_x: bezier_points[index]['x'],
        bus_y: bezier_points[index]['y']
      })
      if (index < 1) {
        clearInterval(that.timer);
        // that.addGoodToCartFn(e);
        that.setData({
          hide_good_box: true
        })
      }
    }, 13);
  },

  //清空购物车
  clearShopCartFn: function (e) {
    var that = this;
    var id = this.data.main.cartdata == 1 ? this.data.pageid : '';
    core.get('quick/index/clearCart', { quickid: id }, function (ret) {
      console.log(ret);
      var main = that.data.main;
      main.cartList = {
        list: [],
        total: 0,
        totalprice: 0
      };
      var tempcartid = that.data.tempcartid
      var arr = [];
      // 这里有bug，清空购物车的时候遍历id数组，比当前有的id大的商品不在数组里所以要找到最大的id值将数组置为0
      for (var i = 0; i < tempcartid.length; i++) {
        console.log(tempcartid[i])
        arr[Number(tempcartid[i])] = -1
        console.log(arr)
      }
      that.setData({
        main: main,
        clickCar: false,
        numtotal: arr,
        clearcart: false,
        showPicker: false
      })
      console.log(that.data.numtotal)
    })
  },

  // 关闭多规格弹窗
  closemulti: function () {
    this.setData({
      showPicker: false,
      clickCar: false,
      cycledate: true
    })
  },

  // 结算
  gopay: function () {
    console.log(this.data.main.cartList)
    var fromquick = this.data.main.cartdata == 1 ? this.data.pageid : '';
    if (!this.data.main.cartList.list.length) {
      // 如果购物车中没有商品
      foxui.toast(this, "请先添加商品到购物车");
    } else {
      wx.navigateTo({
        url: '/pages/order/create/index?fromquick=' + fromquick
      })
    }
  },
  // 跳转到购物车
  gotocart: function () {
    wx.navigateTo({
        url:'/pages/member/cart/index',
        fail: function () {
            wx.switchTab({
                url: url,
            })
        }
    })
  },

  // 购物车弹层加减商品
  cartaddcart: function (e) {
    var that = this;
    var id = this.data.main.cartdata == 1 ? this.data.pageid : '';
    var opid = e.currentTarget.dataset.id == '0' ? e.currentTarget.dataset.goodsid : e.currentTarget.dataset.id;

    var carttype = e.currentTarget.dataset.add;
    var value = 1;
    if (e.currentTarget.dataset.min == e.currentTarget.dataset.num && carttype == 'reduce') {
      carttype = 'delete'
    }

    // 加入购物车
    core.get('quick/index/update', {
      quickid: id,
      goodsid: e.currentTarget.dataset.goodsid,
      optionid: e.currentTarget.dataset.id == '0' ? '' : e.currentTarget.dataset.id,
      update: '',
      total: '',
      type: carttype,
      typevalue: value,
      // diyformdata: ''
    }, function (ret) {
      console.log(ret);
      if (ret.error == 0) {
        var arr = that.data.cartcartArr;
        arr[opid] = ret.goodsOptionTotal || ret.goodsOptionTotal == 0 ? ret.goodsOptionTotal : ret.goodstotal;

        var main = that.data.main;
        main.cartList.total = ret.total;
        main.cartList.totalprice = ret.totalprice;

        var numbers = that.data.numtotal;
        numbers[e.currentTarget.dataset.goodsid] = ret.goodstotal;

        that.setData({
          cartcartArr: arr,
          main: main,
          numtotal: numbers
        })
      } else {
        foxui.toast(that, ret.message);
      }
    })
  },

  // 右侧主体滚动事件
  scrollfn: function (e) {
    // console.log(e.detail.scrollTop)
    var that = this;
    var arrtemp = this.data.arrLab;
    for (var i = 0; i < that.data.arrscroll.length; i++) {
      arrtemp[i] = 0;
      if (Math.abs(e.detail.scrollTop - that.data.arrscroll[i]) < 26) {

        arrtemp[i] = 1;
        this.setData({
          arrLab: arrtemp
        })
        break;
      }

      // console.log('goodslength：' + goodslength)
    }
  },
  onShareAppMessage: function (res) {

  }
})