var app = getApp(), core = app.requirejs('core'),$ = app.requirejs('jquery');
var selectdate = app.requirejs('biz/selectdate'), foxui = app.requirejs('foxui');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    status: '0',
    currentDate: "",
    dayList: '',
    currentDayList: '',
    currentObj: '',
    currentDay: '',
    cycelData:{},
    nowDate:'',
    maxday:'',
    cycelbuy_periodic:'',
    period_index:1,
    cycelid:'',
    orderid:'',
    refundstate:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var $this=this;
    var isIpx = app.getCache('isIpx');
    if (isIpx) {
      this.setData({
        isIpx: true,
        iphonexnavbar: 'fui-iphonex-navbar'
      })
    } else {
      this.setData({
        isIpx: false,
        iphonexnavbar: ''
      })
    }
  
    this.get_list();
  },

  show_cycelbuydate: function () {
    var $this = this;
    /*周期购时间选择器初始化*/
    var currentObj = selectdate.getCurrentDayString(this, $this.data.nowDate);
    var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    $this.setData({
      currentObj: currentObj,
      currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月' + currentObj.getDate() + '日 ' + week[currentObj.getDay()],
      currentYear: currentObj.getFullYear(),
      currentMonth: (currentObj.getMonth() + 1),
      currentDay: currentObj.getDate(),
      initDate: Date.parse(currentObj.getFullYear() + '/' + (currentObj.getMonth() + 1) + '/' + currentObj.getDate()),
      checkedDate: Date.parse(currentObj.getFullYear() + '/' + (currentObj.getMonth() + 1) + '/' + currentObj.getDate()),
      maxday: $this.data.maxday,//可选的天数
      cycelbuy_periodic: $this.data.cycelbuy_periodic,//周期购数据   时间间隔，单位，期数
      period_index: $this.data.period_index,//当前第几期
    })
  },

  cycle:function(e){
    var index = e.currentTarget.dataset.status;
    var period_index = index + 1;
    this.setData({ status: e.currentTarget.dataset.status, cycelid: e.currentTarget.dataset.id, period_index: period_index})
  },

    // 取消时间选择时间
    syclecancle: function () {
        this.setData({
            cycledate: false
        });
    },
    //确定选择时间
    sycleconfirm: function () {
      var $this = this;
      var cycelid = $this.data.cycelid;
      var newDate = $this.data.checkedDate / 1000; 
      var orderid = $this.data.orderid;
      var isall = $this.data.isdelay;
      core.get('order/do_deferred', { cycelid: cycelid, time: newDate, orderid: orderid,is_all:isall},function(res){
        console.log(res);
        if(res.error == 0){
          foxui.toast($this,'修改成功');
        }
      });
      this.setData({
          cycledate: false
      });
    },
    // 周期购 修改送达时间
    editdate: function (e) {
        var $this = this;
        var isdelay=e.currentTarget.dataset.isdelay;
        var cycelid = e.currentTarget.dataset.id;
        core.get('order/getCycelbuyDate', { cycelid: cycelid}, function (res) {
          $this.setData({ nowDate: res.receipttime});
          $this.show_cycelbuydate();
          selectdate.setSchedule($this);
        })
        
        this.setData({
            isdelay: isdelay
        });
        
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

  //获取周期购数据
  get_list:function(){
    var $this = this;
    core.get('order/cycelbuy_list', $this.options,function(res){
      console.log(res)
      if(res.error > 0){
        if (list.error != 50000) {
          core.toast(list.message, 'loading');
        }
      }
 
      if (res.notStart == false){
        $.each(res.list,function(index,data){
          if(data.status == 1){
            $this.setData({
              status:index
            })
          }else{
            $this.setData({
              status: res.period_index,
            })
          }
        })
      }
      $this.setData({cycelid:res.list[0]['id'],orderid:res.orderid});
      $this.setData(res);

    })
  },
  confirm_receipt:function(e){
    var $this = this;
    var id = e.currentTarget.dataset.id;
    var orderid = $this.data.orderid;
    core.get('order/confirm_receipt', { id:id,orderid:orderid }, function (res) {

      if (res.error == 0) {
        foxui.toast($this, '修改成功');
        $this.onLoad();
      }
    });
  }
  
})