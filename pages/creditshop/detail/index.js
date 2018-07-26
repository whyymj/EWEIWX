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
    limits: true,
    tabinfo: 'active',
    tabreplay: '',
    tablog: '',
    hasoption: false,
    options: [],
    goodsoptions:[],
    optionid:0,
    specs: [],
    goods: [],
    log: [],
    logmore:false,
    logpage:1,
    replays: [],
    replaysmore:false,
    replaypage:1,
    stores: [],
    goodsrec: [],
    goodspicker:false,
    selectspecs:[],
    optionselect:"请选择规格",
    optionbtn:'确认',
    timer:[],
    day:0,
    hour:0,
    minute:0,
    second:0,
    windowWidth: 0,
    windowHeight: 0,
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000
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
    $this.setData({options:options});
  },
  onTab: function (e) {
    var $this = this;
    var active = e.currentTarget.dataset.tab;
    if (active == "tabreplay") {
      $this.setData({ tabinfo: '', tabreplay: 'active', tablog: '' });
    } else if (active == "tablog") {
      $this.setData({ tabinfo: '', tabreplay: '', tablog: 'active' });
    } else {
      $this.setData({ tabinfo: 'active', tabreplay: '', tablog: '' });
    }
  },
  //参与记录翻页
  getlog:function(){
    var $this = this;
    $this.setData({ logpage:$this.data.logpage+1 });
    core.get('creditshop/detail/getlistlog', { id: $this.options.id , page:$this.data.logpage},function(msg){
        msg.list = $this.data.log.concat(msg.list);
        $this.setData({log:msg.list,logmore:msg.more});
    });
  },
  getreply:function(){
    var $this = this;
    $this.setData({ replaypage: $this.data.replaypage + 1 });
    core.get('creditshop/detail/getlistreply', { id: $this.options.id, page: $this.data.replaypage },
    function (msg){
      msg.list = $this.data.replays.concat(msg.list);
      $this.setData({ replays: msg.list, replaysmore: msg.more });
    });
      
  },
  /*获取商品详情*/
  getDetail: function () {
    var $this = this;
    var options = $this.data.options;
    core.get('creditshop/detail', { id: options.id }, function (result) {
      if(result.error>0){
        foxui.toast($this, result.message);
        setTimeout(function(){
          wx.navigateBack();
        },1000)
        return;
      }
      parser.wxParse('wxParseData', 'html', result.goods.goodsdetail, $this, '0');
      parser.wxParse('wxParseData_subdetail', 'html', result.goods.subdetail, $this, '0');
      parser.wxParse('wxParseData_noticedetail', 'html', result.goods.noticedetail, $this, '0');
      parser.wxParse('wxParseData_usedetail', 'html', result.goods.usedetail, $this, '0');
      
      $this.setData({
        goods: result.goods,
        log: result.log,
        logmore:result.logmore,
        replays: result.replys,
        replaysmore: result.replymore,
        stores: result.stores,
        goodsrec: result.goodsrec,
        hasoption:result.goods.hasoption
      });
      /*倒计时*/
      if (result.goods.istime > 0 && result.goods.timestart > 0 && result.goods.timeend>0){
        clearInterval($this.data.timer);
        var timer = setInterval(function () {
          $this.countDown(result.goods.timestart, result.goods.timeend);
        }, 1000);
        $this.setData({ timer: timer });
      }
    });
  },
  /*倒计时控件*/
  countDown: function (timestart, timeend) {
    var now = parseInt(Date.now() / 1000);
    var endDate = timestart > now ? timestart : timeend;
    var leftTime = endDate - now;
    var leftsecond = parseInt(leftTime);
    var day = Math.floor(leftsecond / (60 * 60 * 24));
    var hour = Math.floor((leftsecond - day * 24 * 60 * 60) / 3600);
    var minute = Math.floor((leftsecond - day * 24 * 60 * 60 - hour * 3600) / 60);
    var second = Math.floor(leftsecond - day * 24 * 60 * 60 - hour * 3600 - minute * 60);
    var time = {day:day,hour:hour,minute:minute,second:second};
    this.setData({ timer:time});
  },
  /*选择规格picker事件*/
  optionclick:function(){
    var $this = this;
    var id = $this.data.goods.id;
    var hasoption = $this.data.goods.hasoption;
    var specs = $this.data.specs;
    var canbuy = $this.data.goods.canbuy;
    if(!canbuy){
      foxui.toast($this, $this.data.goods.buymsg);
      return;
    }

    if (hasoption){
      if (specs.length == 0){
        core.get('creditshop/detail/option', { id: id }, function (result) {
          $this.setData({
            goodspicker: true,
            goodsoptions: result.options,
            optiongoods: result.goods,
            specs: result.specs
          });
        });
      }else{
        $this.setData({goodspicker: true});
      }      
    }else{
      $this.setData({hasoption:false});
      return;
    }
  },
  /*选择规格*/
  specselect: function (event){
    var $this = this;
    var selectspecs = $this.data.selectspecs;
    var idx = event.target.dataset.idx;
    var itemid = event.target.dataset.specid;
    selectspecs[idx] = { id: itemid, title: event.target.dataset.title };
    $this.setData({ selectspecs: selectspecs});
    var specs = $this.data.specs;
    var specsitem = specs[idx].items;
    specsitem.forEach(function (e) {
      if (itemid == e.id) {
        e.class = "btn-danger";
      } else {
        e.class = "";
      }
    });
    specs[idx].items = specsitem;
    $this.setData({ specs: specs});

    var title = '';
    var optionTitle = '';
    selectspecs.forEach(function (event) {
      title = event.title + ';'+title;
      optionTitle = event.id + '_' + optionTitle;
    });
    optionTitle = optionTitle.substring(0, optionTitle.length - 1);
    var options = $this.data.goodsoptions;
    if (event.target.dataset.thumb != '') {
      $this.setData({
        'optiongoods.thumb': event.target.dataset.thumb,
      })
    }
    
    options.forEach(function (event) {
      if (event.specs == optionTitle) {
        $this.setData({
          optionid: event.id,
          'optiongoods.total': event.total,
          'goods.credit': event.credit,
          'goods.money': event.money,
          'optiongoods.credit': event.credit,
          'optiongoods.money': event.money,
          'optionselect': '已选 '+event.title
        });
        if (event.total < $this.data.total) {
          $this.setData({
            'goods.canbuy': false,
            'goods.buymsg': '库存不足',
            optionbtn: '库存不足',
          })
          foxui.toast($this, "库存不足");
        } else {
          $this.setData({
            'goods.canbuy': true,
            'goods.buymsg': '库存不足',
            optionbtn: '确认',
          })
        }
      }
    });
    

  },
  /*关闭picker*/
  closepicker:function(){
    this.setData({ goodspicker: false})
  },
  /*积分兑换绑定事件*/
  openActionSheet: function () {
    var $this = this;
    var canbuy = $this.data.goods.canbuy;
    var hasoption = $this.data.goods.hasoption;
    var optionid = $this.data.optionid;
    if (canbuy) {
      if(hasoption>0){
        if(optionid>0){
          wx.redirectTo({
            url: '/pages/creditshop/create/index?id=' + $this.data.goods.id + '&optionid=' + optionid,
          });
        }else{
          $this.optionclick();
        }
      }else{
        wx.redirectTo({
          url: '/pages/creditshop/create/index?id=' + $this.data.goods.id,
        });
      }

    } else {
      return;
    }
  },
  /*页面加载*/
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
  }

});