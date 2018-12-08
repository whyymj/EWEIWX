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
var diypage = app.requirejs('biz/diypage');
var diyform = app.requirejs('biz/diyform');
var goodspicker = app.requirejs('biz/goodspicker');
var $ = app.requirejs('jquery');
var parser = app.requirejs('wxParse/wxParse');
var hasOption = 0;
var selectdate=app.requirejs('biz/selectdate');
Page({
  data: {
    diypages: {},
    usediypage:false,
    specs: [],
    options: [],
    icons: app.requirejs('icons'),
    goods: {},
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 500,
    circular: true,
    play: "/static/images/video_play.png",
    mute: "/static/images/icon/mute.png",
    voice: "/static/images/icon/voice.png",
    //pick
    active: '',
    slider: '',
    tempname: '',
    info: 'active',
    preselltimeend: '',
    presellsendstatrttime: '',
    advWidth: 0,
    dispatchpriceObj: 0,
    now: parseInt(Date.now() / 1000),
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    timer: 0,
    discountTitle: '',
    istime: 1,
    istimeTitle: '',
    isSelected: false,
    params: {},
    total: 1,
    optionid: 0,
    audios: {},
    audiosObj: {},
    defaults: {
      id: 0,
      merchid: 0
    },
    buyType: '',
    pickerOption: {},
    specsData: [],
    specsTitle: '',
    canBuy: '',
    diyform: {},
    showPicker: false,
    showcoupon: false,
    pvalOld: [0, 0, 0],
    pval: [0, 0, 0],
    areas: [],
    noArea: true,
    commentObj: {},
    commentObjTab: 1,
    loading: false,
    commentEmpty: false,
    commentPage: 1,
      commentTotal: 1,
    commentLevel: 'all',
    commentList: [],
    closeBtn: false,
    soundpic: true,
    animationData: {},
    uid: '',
    stararr: ['all', 'good', 'normal', 'bad', 'pic'],
    nav_mask: false,
    nav_mask2: false,
    nav: 0,
    giftid: '',
    limits: true,
    modelShow: false,
    showgoods: true,

      //秒杀
      timer:0,
      lasttime: 0,
      hour: '-',
      min: '-',
      sec: '-',

    // 以下 周期购
    currentDate: "",
    dayList: '',
    currentDayList: '',
    currentObj: '',
    currentDay: '',
    checkedDate:'',
    showDate:'',
    scope: '',
    goods_hint_show:false,
    presellisstart:0,
    advHeight: 1
  },

  //商品详情轮播图按照第一张图片显示
  imageLoad: function (e) {
    let h = e.detail.height,
      w = e.detail.width,
      height = Math.floor((750 * h) / w);
    if (h == w) {
      this.setData({ advHeight: 750 })
    } else {
      this.setData({ advHeight: height })
    }
  },

  favorite: function (event) {
    var $this = this;
    var limits = $this.data.limits;
    if (limits) {
      var isfavorite = event.currentTarget.dataset.isfavorite ? 0 : 1;
      core.get('member/favorite/toggle', { 'id': $this.data.options.id, 'isfavorite': isfavorite }, function (ret) {
        if (ret.isfavorite) {
          $this.setData({ 'goods.isfavorite': 1 });
        } else {
          $this.setData({ 'goods.isfavorite': 0 });
        }
      })

    } else {
      // this.setData({ modelShow: true })
    }
  },
  /*购物车*/
  // menucart: function () {
  //   var $this = this;
  //   var limits = $this.data.limits;
  //   if (limits) {
  //     wx.switchTab({
  //       url: '/pages/member/cart/index'
  //     })
  //   } else {
  //     this.setData({ modelShow: true })
  //   }
  // },
  /*tab切换 */
  goodsTab: function (event) {
    var $this = this, tap = event.currentTarget.dataset.tap;
    if (tap == 'info') {
      this.setData({ info: 'active', para: '', comment: '' });
    } else if (tap == 'para') {
      this.setData({ info: '', para: 'active', comment: '' });
    } else if (tap == 'comment') {
      $this.setData({ info: '', para: '', comment: 'active' });
      if ($this.data.commentList.length > 0) {
        $this.setData({ loading: false });
        return;
      } else {
        $this.setData({ loading: true });
      }
      core.get('goods/get_comment_list', {
        'id': $this.data.options.id,
        'level': $this.data.commentLevel,
        'page': $this.data.commentPage
      }, function (retlist) {
        if (retlist.list.length > 0) {
         // $this.setData({ loading: false, commentList: retlist.list, commentPage: retlist.page });
            $this.setData({ loading: false, commentList: retlist.list, commentTotal: retlist.total,commentPage: retlist.page  });
        } else {
          $this.setData({ loading: false, commentEmpty: true });
        }
      })
    }
  },

  //上拉加载下一页评论
  onReachBottom: function () {
    var $this = this;
    if($this.data.commentTotal<=10)
    {
        return  false;
    }
    var commentType = $this.data.commentObjTab;
    var objType = '';
    if (commentType == 1) {
      objType = 'all';
    } else if (commentType == 2) {
      objType = 'good';
    } else if (commentType == 3) {
      objType = 'normal';
    } else if (commentType == 4) {
      objType = 'bad';
    } else if (commentType == 5) {
      objType = 'pic';
    }
    $this.setData({ loading: true });
    // var commentPage = $this.data.commentPage;
    // if (commentPage == 1) {
    //   commentPage = 2;
    // }
    core.get('goods/get_comment_list', {
      'id': $this.data.options.id,
      'level': objType,
      'page': $this.data.commentPage
    }, function (list) {
      if (list.error == 0) {
        $this.setData({ loading: false });
        if (list.list.length > 0) {
          $this.setData({
            commentPage: $this.data.commentPage + 1,
              commentTotal: list.total,
            commentList: $this.data.commentList.concat(list.list)
          });
        }
      }
    });
  },
  //评价列表事件
  comentTap: function (e) {
    var $this = this;
    var commentType = e.currentTarget.dataset.type;
    var objType = '';
    if (commentType == 1) {
      objType = 'all';
        $this.data.commentPage=1;
    } else if (commentType == 2) {
        $this.data.commentPage=1;
      objType = 'good';
    } else if (commentType == 3) {
        $this.data.commentPage=1;
      objType = 'normal';
    } else if (commentType == 4) {
        $this.data.commentPage=1;
      objType = 'bad';
    } else if (commentType == 5) {
        $this.data.commentPage=1;
      objType = 'pic';
    }
    if (commentType != $this.data.commentObjTab) {
      //评价列表
      core.get('goods/get_comment_list', {
        'id': $this.data.options.id,
        'level': objType,
        'page': $this.data.commentPage
      }, function (retlist) {
        if (retlist.list.length > 0) {
          $this.setData({
            loading: false,
            commentList: retlist.list,
              commentTotal: retlist.total,
            commentPage: retlist.page,
            commentObjTab: commentType,
            commentEmpty: false
          });
        }
        // else {
        //   $this.setData({
        //     loading: false,
        //     commentList: retlist.list,
        //     commentPage: 1,
        //     commentObjTab: commentType,
        //     commentEmpty: true
        //   });
        // }
      })
    } else {
      return;
    }
  },
  // 评价图片点击预览
  preview: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: e.currentTarget.dataset.urls // 需要预览的图片http链接列表
    })
  },
  /* 获取商品详情 */
  getDetail: function (options) {
    var $this = this;

    var nowTime = parseInt(Date.now() / 1000);
    
    $this.setData({ loading: true });
    core.get('goods/get_detail', { id: options.id }, function (result) {
      console.log(result);
      if (result.error > 0) {
        $this.setData({ show: true, showgoods: false });
        foxui.toast($this, result.message);
        setTimeout(function () {
          wx.navigateBack();
        }, 800);
      }
      var coupon = result.goods.coupons;
      var MaxHeight = result.goods.thumbMaxHeight;
      var MaxWidth = result.goods.thumbMaxWidth;
      var ratio = MaxWidth / MaxHeight;

      //轮播适配高度
      // wx.getSystemInfo({
      //   success: function (result) {
      //     var advHeight = result.windowWidth / ratio;
      //     $this.setData({
      //       advWidth: result.windowWidth,
      //       advHeight: advHeight
      //     });
      //   }
      // });

      $this.setData({
        coupon: coupon,
        coupon_l: coupon.length,
        packagegoods: result.goods.packagegoods,
        packagegoodsid: result.goods.packagegoods.goodsid,
        credittext: result.goods.credittext,
        activity: result.goods.activity,
        bottomFixedImageUrls: result.goods.bottomFixedImageUrls, //底部固定信息
        phonenumber: result.goods.phonenumber,
        showDate: result.goods.showDate,
        scope: result.goods.scope,
      })
      if (result.goods.packagegoods) {
        $this.package();
      }
      parser.wxParse('wxParseData', 'html', result.goods.content, $this, '0');
      parser.wxParse('wxParseData_buycontent', 'html', result.goods.buycontent, $this, '0');
      $this.setData({
        show: true, goods: result.goods, minprice: result.goods.minprice, maxprice: result.goods.maxprice, preselltimeend: result.goods.preselltimeend, style: result.goods.labelstyle.style, navbar: result.goods.navbar, labels: result.goods.labels
      });
      console.log(result.goods)
      wx.setNavigationBarTitle({
        title: result.goods.title || '商品详情'
      });
      hasOption = result.goods.hasoption;
      if ($.isEmptyObject(result.goods.dispatchprice) || typeof (result.goods.dispatchprice) == 'string') {
        $this.setData({ dispatchpriceObj: 0 });
      } else {
        $this.setData({ dispatchpriceObj: 1 });
      }
      /*促销start*/
      if (result.goods.isdiscount > 0 && result.goods.isdiscount_time >= nowTime) {
        clearInterval($this.data.timer);
        var timer = setInterval(function () {
          $this.countDown(0, result.goods.isdiscount_time);
        }, 1000);
        $this.setData({ timer: timer });
      } else {
        $this.setData({ discountTitle: '活动已结束' });
      }
      /*促销end*/
      /*限时购 start*/
      if (result.goods.istime > 0) {
        clearInterval($this.data.timer);
        var timer = setInterval(function () {
          $this.countDown(result.goods.timestart, result.goods.timeend, 'istime');
        }, 1000);
        $this.setData({ timer: timer });
      }
      /*限时购 end*/
      /*预售 start*/
      if (result.goods.ispresell > 0) {
        var timer = setInterval(function () {
          if (result.goods.canbuy == 0){
            $this.countDown(nowTime, result.goods.preselltimestart, 'istime');
          } else if (result.goods.canbuy == 1){
            $this.countDown(nowTime, result.goods.preselltimeend, 'istime');
          }
        }, 1000);
        $this.setData({ timer: timer, presellisstart: result.goods.presellisstart });
        $this.setData({
          preselltimeend: result.goods.preselltimeend || result.goods.preselltimeend.getMonth() + '月' + result.goods.preselltimeend || result.goods.preselltimeend.getDate() + '日 ' + result.goods.preselltimeend || result.goods.preselltimeend.getHours() + ':' + result.goods.preselltimeend || result.goods.preselltimeend.getMinutes() + ':' + result.goods.preselltimeend || result.goods.preselltimeend.getSeconds(),
          presellsendstatrttime: result.goods.presellsendstatrttime || result.goods.presellsendstatrttime.getMonth() + '月' + result.goods.presellsendstatrttime || result.goods.presellsendstatrttime.getDate() + '日',
        });
      }
      /*预售 end*/
      /*评价start*/
      if (result.goods.getComments > 0) {
        core.get('goods/get_comments', { 'id': $this.data.options.id }, function (ret) {
          $this.setData({
            commentObj: ret,
          });
        })
      }
      /*评价end*/
      /*全返*/
      if (result.goods.fullbackgoods) {
        $this.setData({ fullbackgoods: result.goods.fullbackgoods })
      }

      var fullbackgoods = $this.data.fullbackgoods;
      if (fullbackgoods != undefined) {
        console.log(fullbackgoods)
        var maxfullbackratio = fullbackgoods.maxfullbackratio;
        var maxallfullbackallratio = fullbackgoods.maxallfullbackallratio;
        var maxfullbackratio = Math.round(maxfullbackratio);
        var maxallfullbackallratio = Math.round(maxallfullbackallratio);
        $this.setData({ maxfullbackratio: maxfullbackratio, maxallfullbackallratio: maxallfullbackallratio });
      }

      if(result.goods.type == 9){
        $this.setData({ checkedDate: result.goods.nowDate});
        $this.show_cycelbuydate();
      }

      if(result.goods.seckillinfo){
          $this.initSeckill(result.goods);
      }
     
    });
  },

    //秒杀时间初始化
    initSeckill:function (goods){
        var $this = this;
        var status = parseInt(goods.seckillinfo.status);
        var starttime = goods.seckillinfo.starttime;
        var endtime = goods.seckillinfo.endtime;
        if (status != -1) {
            var lasttime = 0;
            var timer = 0;
            var approot=app.globalData.approot;
            wx.request({url:approot+'map.json',
                success: function(x) {
                    var currenttime = new Date(x.header.Date) / 1000;
                    if (status == 0) {
                        lasttime = endtime - currenttime;
                    } else {
                        lasttime = starttime - currenttime;
                    }
                    $this.setData({lasttime: lasttime});
                    clearInterval($this.data.timer);
                    $this.setTimer(goods.seckillinfo);
                    timer = $this.setTimerInterval(goods.seckillinfo);

                    $this.setData({timer: timer});
                }
            })
        }

    },
    setTimer: function (seckillinfo) {
        var $this = this;
        var lasttime=0;

        //每十秒请求一次服务器，获取时间
        if (seckillinfo.status != -1) {
            if (parseInt($this.data.lasttime) % 10 == 0) {
                var status = parseInt(seckillinfo.status);
                var starttime = seckillinfo.starttime;
                var endtime = seckillinfo.endtime;
                if (status != -1) {
                    var approot = app.globalData.approot;
                    wx.request({
                        url: approot + 'map.json',
                        success: function (x) {
                            var currenttime = new Date(x.header.Date) / 1000;
                            if (status == 0) {
                                lasttime = endtime - currenttime;
                            } else {
                                lasttime = starttime - currenttime;
                            }
                            $this.setData({lasttime: lasttime});
                        }
                    })
                }
            }
        }

        lasttime = parseInt($this.data.lasttime) - 1;
        var times = $this.formatSeconds(lasttime);
        $this.setData({lasttime: lasttime, hour: times.hour, min: times.min, sec: times.sec});
        if (lasttime <= 0) {
            $this.onLoad();
        }
    },
    setTimerInterval: function (seckillinfo) {
        var $this = this;
        return setInterval(function () {
            $this.setTimer(seckillinfo);
        }, 1000);
    },
    formatSeconds: function (value) {
        var theTime = parseInt(value);
        var theTime1 = 0;
        var theTime2 = 0;
        if (theTime > 60) {
            theTime1 = parseInt(theTime / 60);
            theTime = parseInt(theTime % 60);
            if (theTime1 > 60) {
                theTime2 = parseInt(theTime1 / 60);
                theTime1 = parseInt(theTime1 % 60)
            }
        }
        return {
            'hour': theTime2 < 10 ? '0' + theTime2 : theTime2,
            'min': theTime1 < 10 ? '0' + theTime1 : theTime1,
            'sec': theTime < 10 ? '0' + theTime : theTime
        }
    },

  /*倒计时js start
   timestart----开始时间
   timeend----结束时间
   type-------类型
   */
  countDown: function (timestart, timeend, type) {
    var now = parseInt(Date.now() / 1000);
    var endDate = timestart > now ? timestart : timeend;
    var leftTime = endDate - now;
    var leftsecond = parseInt(leftTime);
    var day = Math.floor(leftsecond / (60 * 60 * 24));
    var hour = Math.floor((leftsecond - day * 24 * 60 * 60) / 3600);
    var minute = Math.floor((leftsecond - day * 24 * 60 * 60 - hour * 3600) / 60);
    var second = Math.floor(leftsecond - day * 24 * 60 * 60 - hour * 3600 - minute * 60);
    var time = [day, hour, minute, second]
    this.setData({
      time: time
    });
    if (type = 'istime') {
      var istimeTitle = '';
      if (timestart > now) {
        istimeTitle = '距离限时购开始';
      } else if (timestart <= now && timeend > now) {
        istimeTitle = '距离限时购结束';
      } else {
        istimeTitle = '活动已经结束，下次早点来~';
        this.setData({ istime: 0 });
      }
      this.setData({ istimeTitle: istimeTitle });
    }
  },
  //不配送区域picker
  cityPicker: function (event) {
    var $this = this;
    var active = event.currentTarget.dataset.tap;
    wx.navigateTo({
      url: '/pages/goods/region/index?id=' + $this.data.goods.id + '&region=' + $this.data.goods.citys.citys + '&onlysent=' + $this.data.goods.citys.onlysent,
    });
  },
  //赠品弹层
  giftPicker: function () {
    this.setData({
      active: 'active',
      gift: true
    })
  },
  //优惠券picker
  couponPicker: function () {
    this.setData({
      active: 'active',
      showcoupon: true
    })
  },
  couponrecived: function (e) {
    var id = e.currentTarget.dataset.id
    var $this = this
    core.post('goods.pay_coupon', { id: id }, function (result) {
      console.log(result)
      if (result.error == 0) {
        $this.setData({
          showcoupon: false,
          active: ''
        })
        foxui.toast($this, "已领取");
      } else {
        foxui.toast($this, result.message);
      }
    });
  },
  // 购买picker
  selectPicker: function (e) {
    app.checkAuth();
    var $this = this;
    var timeType = e.currentTarget.dataset.time;
    var timeOut = e.currentTarget.dataset.timeout;
    var limits = $this.data.limits;
    if (!limits) {
      // $this.setData({ modelShow: true })
      return
    }
    console.log(timeOut);
    if (timeType == 'timeout' || timeType == 'access_time'){
      if (timeOut == 'false'){
        $this.setData({ goods_hint_show: true });
        return;
      } else if (timeOut == 'true'){
        if (timeType == 'access_time') {
          $this.setData({ goods_hint_show: false });
          var goodslist = 'goodsdetail';
          goodspicker.selectpicker(e, $this, goodslist)
          return;
        }
        if (timeType == 'timeout') {
          $this.setData({ goods_hint_show: false });
          return;
        }
      }
    }
   
    var goodslist = 'goodsdetail';
    goodspicker.selectpicker(e, $this, goodslist)
  },
  // 选规格
  specsTap: function (event) {
    var $this = this
    goodspicker.specsTap(event, $this)
  },
  //关闭pickerpicker
  emptyActive: function () {
    this.setData({
      active: '', slider: 'out', tempname: '', showcoupon: false, gift: false, cycledate: false
    });
  },
  // 立即购买
  buyNow: function (event) {
    var $this = this
    goodspicker.buyNow(event, $this, "goods_detail")
  },
  //加入购物车
  getCart: function (event) {
    var $this = this
    goodspicker.getCart(event, $this)
  },
  select: function () {
    var $this = this;
    var optionid = $this.data.optionid;
    var diydata = $this.data.diyform;
    //是否有规格
    if (hasOption > 0 && optionid == 0) {
      foxui.toast($this, "请选择规格");
      return;
    }
    this.setData({ active: '', slider: 'out', isSelected: true, tempname: '' });
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
  onLoad: function (options) {
    app.checkAuth();
    var $this = this;
    $this.setData({
      imgUrl: app.globalData.approot
    });
    core.get('black', {}, function (res) {
      if (res.isblack) {
        wx.showModal({
          title: '无法访问',
          content: '您在商城的黑名单中，无权访问！',
          success: function (res) {
            if (res.confirm) {
              this.close()
            }
            if (res.cancel) {
              this.close()
            }
          }
        })
      }
    });

    diypage.get(this, 'goodsdetail', function (res) {
      var diypage = res.diypage.items;
      for (var i in diypage){
        if (diypage[i].id == 'copyright' ){
          $this.setData({ copyright: diypage[i]})
        }
      }

    });
    options = options || {};
    // 处理扫码scene
    var scene = decodeURIComponent(options.scene);
    if (!options.id && scene) {
      var sceneObj = core.str2Obj(scene);
      options.id = sceneObj.id;
      if (sceneObj.mid) {
        options.mid = sceneObj.mid;
      }
    }
    this.setData({ id: options.id });
    app.url(options);
    wx.getSystemInfo({
      success: function (result) {
        $this.setData({
          windowWidth: result.windowWidth,
          windowHeight: result.windowHeight
        });
      }
    });
    $this.getDetail(options);
    $this.setData({
      uid: options.id,
      options: options,
      success: true,
      cover: true,
      showvideo: true
    });
    wx.getSystemInfo({
      success: function (result) {
        $this.setData({
          advWidth: result.windowWidth
        });
        console.log(result.windowHeight);
      }
    });
    setTimeout(function () {
      $this.setData({ areas: app.getCache("cacheset").areas });
    }, 3000)
  },

  show_cycelbuydate: function () {
    var $this = this;
    /*周期购时间选择器初始化*/
    var currentObj = selectdate.getCurrentDayString(this, $this.data.showDate);
    var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    $this.setData({
      currentObj: currentObj,
      currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月' + currentObj.getDate() + '日 ' + week[currentObj.getDay()],
      currentYear: currentObj.getFullYear(),
      currentMonth: (currentObj.getMonth() + 1),
      currentDay: currentObj.getDate(),
      initDate: Date.parse(currentObj.getFullYear() + '/' + (currentObj.getMonth() + 1) + '/' + currentObj.getDate()),
      checkedDate: Date.parse(currentObj.getFullYear() + '/' + (currentObj.getMonth() + 1) + '/' + currentObj.getDate()),
      maxday: $this.data.scope,//可选的天数
    })
  },
  
  package: function () {
    var $this = this;
    core.get('package.get_list', { goodsid: this.data.packagegoodsid }, function (result) {
      console.log(result.list[0])
      $this.setData({
        packageList: result.list[0]
      })
    });
  },
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
    wx.getStorage({
      key: 'mydata',
      success: function (res) {
        wx.removeStorage({
          key: 'mydata',
          success: function (res) {
          }
        })
        $this.getDetail(res.data);
        wx.pageScrollTo({
          scrollTop: 0
        })
      }
    })
    /*获取授权*/
    wx.getSetting({
      success: function (res) {
        var limits = res.authSetting['scope.userInfo'];
        $this.setData({ limits: limits })
      }
    })
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
  onShareAppMessage: function () {
    this.setData({ closeBtn: false });
    return core.onShareAppMessage('/pages/goods/detail/index?id=' + this.data.options.id, this.data.goods.title);
  },
  showpic: function () {
    this.setData({
      showpic: true,
      cover: false,
      showvideo: false
    });
    this.videoContext = wx.createVideoContext('myVideo');
    this.videoContext.pause()
  },
  showvideo: function () {
    this.setData({
      showpic: false,
      showvideo: true
    });
    this.videoContext = wx.createVideoContext('myVideo');
    this.videoContext.play()
  },
  startplay: function () {
    this.setData({
      cover: false
    });
    this.videoContext = wx.createVideoContext('myVideo');
    this.videoContext.play()
  },
  bindfullscreenchange: function (e) {
    if (e.detail.fullScreen == true) {
      this.setData({
        success: false,
      });
    } else {
      this.setData({
        success: true,
      });
    }
  },
  phone: function () {
    var phoneNumber = this.data.phonenumber + ''
    wx.makePhoneCall({
      phoneNumber: phoneNumber
    })
  },
  /*分享生成海报*/
  sharePoster: function () {
    wx.navigateTo({
      url: '/pages/goods/poster/poster?id=' + this.data.uid
    })
  },
  /*分享弹层上的关闭*/
  closeBtn: function () {
    this.setData({ closeBtn: false })
  },
  onHide: function () {
    this.setData({ closeBtn: false })
  },
  /*点击分享*/
  showshade: function () {
    app.checkAuth();
    this.setData({ closeBtn: true })
  },
  nav: function () {
    this.setData({ nav_mask: !this.data.nav_mask })
  },
  nav2: function () {
    this.setData({ nav_mask2: !this.data.nav_mask2 })
  },
  changevoice: function () {
    if (this.data.sound) {
      this.setData({
        sound: false,
        soundpic: true
      })
    } else {
      this.setData({
        sound: true,
        soundpic: false
      })
    }
  },
  radioChange: function (e) {
    this.setData({
      giftid: e.currentTarget.dataset.giftgoodsid,
      gift_title: e.currentTarget.dataset.title,
    })
  },

  /*活动弹层*/
  activityPicker: function () {
    var $this = this;
    $this.setData({ fadein: 'in' })
  },
  actOutPicker: function () {
    var $this = this;
    $this.setData({ fadein: '' })
  },
  /*顶部提示授权*/
  hintclick: function () {
    wx.openSetting({
      success: function (res) { }
    })
  },

  /*用户授权-取消*/
  cancelclick: function () {
    this.setData({ modelShow: false })
  },
  /*用户授权-去设置*/
  confirmclick: function () {
    this.setData({ modelShow: false })
    wx.openSetting({
      success: function (res) { }
    })
  },
  /*同城配送*/
  sendclick: function () {
    wx.navigateTo({
      url: '/pages/map/index'
    });
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
      cycledate: true
    });
  },

    //时间选择器 前后月份选择
    doDay: function (e) {
    selectdate.doDay(e,this);
    },
    //周期购选择时间
    selectDay: function (e) {
        selectdate.selectDay(e,this);
        selectdate.setSchedule(this);
    },


  play: function (e) {
    var item_id = e.target.dataset.id;
    var innerAudioContext = this.data.audiosObj[item_id] || false;
    if (!innerAudioContext) {
      innerAudioContext = wx.createInnerAudioContext('audio_' + item_id);
      var audiosObj = this.data.audiosObj;
      audiosObj[item_id] = innerAudioContext;
      this.setData({
        audiosObj: audiosObj
      })
    }
    var $this = this;
    innerAudioContext.onPlay(() => {
      var Time = setInterval(function () {
        var width = innerAudioContext.currentTime / innerAudioContext.duration * 100 + '%';
        var minute = Math.floor(Math.ceil(innerAudioContext.currentTime) / 60);  //分
        var second = (Math.ceil(innerAudioContext.currentTime) % 60 / 100).toFixed(2).slice(-2); //秒
        var seconds = Math.ceil(innerAudioContext.currentTime)
        var audioicon = ''
        if (minute < 10) {
          minute = "0" + minute;
        }
        var time = minute + ":" + second;
        var audios = $this.data.audios;
        audios[item_id].audiowidth = width;
        audios[item_id].Time = Time;
        audios[item_id].audiotime = time;
        audios[item_id].seconds = seconds;
        $this.setData({ audios: audios })
      }, 1000)
    })

    var src = e.currentTarget.dataset.audio;
    var time = e.currentTarget.dataset.time;
    var pausestop = e.currentTarget.dataset.pausestop;
    var loopplay = e.currentTarget.dataset.loopplay;
    if (loopplay == 0) {
      innerAudioContext.onEnded((res) => {
        audios[item_id].status = false;
        $this.setData({ audios: audios })
      })
    }
    var audios = $this.data.audios;

    if (!audios[item_id]) {
      audios[item_id] = {};
    }
    if (innerAudioContext.paused && time == 0) {
      innerAudioContext.src = src;
      innerAudioContext.play();
      if (loopplay == 1) {
        innerAudioContext.loop = true;
      }
      audios[item_id].status = true;
      $this.pauseOther(item_id)

    } else if (innerAudioContext.paused && time > 0) {
      innerAudioContext.play();
      if (pausestop == 0) {
        innerAudioContext.seek(time);
      } else {
        innerAudioContext.seek(0);
      }
      audios[item_id].status = true;
      $this.pauseOther(item_id)
    }
    else {
      innerAudioContext.pause();
      audios[item_id].status = false;
    }
    $this.setData({ audios: audios })
  },
  pauseOther: function (item_id) {
    var $this = this;
    $.each(this.data.audiosObj, function (id, obj) {
      if (id == item_id) {
        return;
      }
      obj.pause();
      var audios = $this.data.audios;
      if (audios[id]) {
        audios[id].status = false;
        $this.setData({ audios: audios });
      }
    });
  },
  /**
 * 生命周期函数--监听页面隐藏
 */
  onHide: function () {
    this.pauseOther();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.pauseOther();
  },
  navigate: function (e) {
    var url = e.currentTarget.dataset.url
    var phone = e.currentTarget.dataset.phone
    var appid = e.currentTarget.dataset.appid
    var appurl = e.currentTarget.dataset.appurl
    if (url) {
      wx.navigateTo({
        url: url,
        fail: function () {
          wx.switchTab({
            url: url,
          })
        }
      })
    }
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone
      })
    }
    if (appid) {
      wx.navigateToMiniProgram({
        appId: appid,
        path: appurl
      })
    }
  },
  close: function () {
    app.globalData.flag = true;
    wx.reLaunch({
      url: '../index/index',
    })
  },
});