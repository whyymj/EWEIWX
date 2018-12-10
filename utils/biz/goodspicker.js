var app = getApp(), $ = app.requirejs('jquery'), core = app.requirejs('core'), foxui = app.requirejs('foxui'),diyform = app.requirejs('biz/diyform');
module.exports = {
  number: function (e,$this) {
    var dataset = core.pdata(e), val = foxui.number($this, e), id = dataset.id, optionid = dataset.optionid, min = dataset.min, max = dataset.max;
    if ((val == 1 && dataset.value == 1 && e.target.dataset.action == 'minus') || (val < min && e.target.dataset.action == 'minus')){
      foxui.toast($this, "单次最少购买" + dataset.value + '件');
      return;
    }
    if (dataset.value == dataset.max && e.target.dataset.action == 'plus'){
      return;
    }
    if (parseInt($this.data.stock) < parseInt(val)) {
      foxui.toast($this, "库存不足");
      return;
      }
    $this.setData({ total:val});
  },
  //数量输入绑定事件
  inputNumber: function (e,$this) {
    var maxbuy = $this.data.goods.maxbuy;
    var minbuy = $this.data.goods.minbuy;
    var total = e.detail.value;
    if (total > 0) {
      if (maxbuy > 0 && maxbuy <= parseInt(e.detail.value)) {
        total = maxbuy;
        foxui.toast($this, "单次最多购买" + maxbuy + '件');
      }
      if (minbuy > 0 && minbuy > parseInt(e.detail.value)) {
        total = minbuy;
        foxui.toast($this, "单次最少购买" + minbuy + '件');
      }
      if (parseInt($this.data.stock) < parseInt(total)) {
        foxui.toast($this, "库存不足");
        return;
      }
    } else {
      if (minbuy > 0) {
        total = minbuy;
      } else {
        total = 1;
      }
    }
    $this.setData({ total: total });
  },
  chooseGift(e,$this) {
    // console.log(e)
    $this.setData({ giftid: e.currentTarget.dataset.id })
  },
  //立即购买
  buyNow: function (event,$this,page) {
    if (event.currentTarget.dataset.type) {
      page = event.currentTarget.dataset.type
    }
    var optionid = $this.data.optionid;
    var hasOption = $this.data.goods.hasoption;
    var diydata = $this.data.diyform;
    var giftid = $this.data.giftid;
    
    //判断周期购
    if($this.data.goods.type == 9){
      var selectDate = $this.data.checkedDate / 1000;
    }

    //是否有规格
    if (hasOption > 0 && !optionid) {
      foxui.toast($this, "请选择规格");
      return;
    }
    //是否存在自定义表单
    if (diydata && diydata.fields.length > 0) {
  
      var verify = diyform.verify($this,diydata);
      if (!verify){
        return;
      } else {
        console.log(diydata.f_data)
        core.post('order/create/diyform',{
          id: $this.data.id,
          diyformdata: diydata.f_data
        },function (ret) {
          if ($this.data.goods.isgift == 0 || page!='goods_detail') {
            wx.redirectTo({
              url: '/pages/order/create/index?id=' + $this.data.id + '&total=' + $this.data.total + '&optionid=' + optionid + '&gdid=' + ret.gdid + '&selectDate=' + selectDate,
            });
          } else {
            if (giftid) {
              wx.redirectTo({
                url: '/pages/order/create/index?id=' + $this.data.id + '&total=' + $this.data.total + '&optionid=' + optionid + '&gdid=' + ret.gdid + '&giftid=' + giftid,
              });
            }
             else if (giftid != "") {//如果选择了赠品或者赠品只有一个
              if ($this.data.goods.giftinfo && $this.data.goods.giftinfo.length == 1) {
                giftid = $this.data.goods.giftinfo[0].id
              }
              if ($this.data.goods.gifts && $this.data.goods.gifts.length == 1) {
                  giftid = $this.data.goods.gifts[0].id//如果赠品只有一个  赋值giftid
                }
                wx.redirectTo({
                  url: '/pages/order/create/index?id=' + $this.data.id + '&total=' + $this.data.total + '&optionid=' + optionid + '&gdid=' + ret.gdid + '&giftid=' + giftid,
                });
              }else{
                foxui.toast($this, "请选择赠品");
              }
          }
        });
      }
    } else {
      if (giftid) {
        wx.navigateTo({
          url: '/pages/order/create/index?id=' + $this.data.id + '&total=' + $this.data.total + '&optionid=' + optionid + '&giftid=' + giftid,
        });
      }
      else if ($this.data.goods.isgift == 0 || page != 'goods_detail'){
        wx.navigateTo({
          url: '/pages/order/create/index?id=' + $this.data.id + '&total=' + $this.data.total + '&optionid=' + optionid + '&selectDate=' + selectDate,
        });
      }else{
        if (giftid != "") {
          if ($this.data.goods.giftinfo && $this.data.goods.giftinfo.length == 1) {
            giftid = $this.data.goods.giftinfo[0].id
          }
          if ($this.data.goods.gifts && $this.data.goods.gifts.length == 1) {
            giftid = $this.data.goods.gifts[0].id
          }
          wx.navigateTo({
            url: '/pages/order/create/index?id=' + $this.data.id + '&total=' + $this.data.total + '&optionid=' + optionid + '&giftid=' + giftid,
          });
        } else {
          foxui.toast($this, "请选择赠品");
        }
      }
    }
  },
  // //加入购物车
  getCart: function (event,$this){
    var optionid = $this.data.optionid;
    console.log($this.data.goods.hasoption);
    
    var hasOption = $this.data.goods.hasoption;
    var diydata = $this.data.diyform;


    //是否有规格
    if (hasOption > 0 && !optionid) {
      foxui.toast($this, "请选择规格");
      return;
    }
    if ($this.data.quickbuy) {
      console.log('quickbuy');
      
      
      //是否存在自定义表单
      if (diydata && diydata.fields.length > 0) {
        var verify = diyform.verify($this, diydata);
        if (!verify) {
          return;
        } else {
          // 设置值存储自定义表单
          $this.setData({
            formdataval: {
              diyformdata: diydata.f_data
            }
          })
          console.log($this.data.formdataval)
        }
      }


      $this.addCartquick(optionid, $this.data.total)
      
    } else {
      
      //是否存在自定义表单
      if (diydata && diydata.fields.length > 0) {
        var verify = diyform.verify($this, diydata);
        if (!verify) {
          return;
        } else {
          // 先提交至diyform_temp
          core.post('order/create/diyform', {
            id: $this.data.id,
            diyformdata: diydata.f_data
          }, function (ret) {
            console.log($this.data)
            core.post('member/cart/add', {
              id: $this.data.id,
              total: $this.data.total,
              optionid: optionid,
              diyformdata: diydata.f_data
            }, function (ret) {
              if (ret.error == 0) {
                $this.setData({
                  'goods.carttotal': ret.carttotal,
                  active: '',
                  slider: 'out',
                  isSelected: true,
                  tempname: ''
                });
                foxui.toast($this, "添加成功");
              }else{
                foxui.toast($this, ret.message);
                return;
              }
            });
          });
        }
      } else {
        core.post('member/cart/add', {
          id: $this.data.id,
          total: $this.data.total,
          optionid: optionid
        }, function (ret) {
          if (ret.error == 0) {
            foxui.toast($this, "添加成功");
            var tempdata = $this.data.goods;
            $this.setData({ 'goods.carttotal': ret.carttotal, active: '', slider: 'out', isSelected: true, tempname: '',goods: tempdata });
          }else{
            foxui.toast($this, ret.message);
            return;
          }
        });
      }
    }
    



    
  },
  selectpicker: function (e, $this, page, modeltakeout) {
    if(e.currentTarget.dataset.home==1) {
      $this.setData({ giftid: '', })
    }
    app.checkAuth();
    $this.setData({ optionid: '', specsData:''});
    var active = $this.data.active
    var id = e.currentTarget.dataset.id
    if (active =='') {
      $this.setData({slider:'in', show:true})
    }
   
    core.get('goods/get_picker', {id:id }, function (result) {
      if (!result.goods.presellstartstatus && result.goods.presellstartstatus != undefined && result.goods.ispresell == '1'){
        foxui.toast($this, result.goods.presellstatustitle);
        return;
      }
      if (!result.goods.presellendstatus && result.goods.presellstartstatus != undefined && result.goods.ispresell == '1') {
        foxui.toast($this, result.goods.presellstatustitle);
        return;
      }
      var options = result.options;
      if(page=='goodsdetail'){
        $this.setData({
          pickerOption: result,
          canbuy: $this.data.goods.canbuy,
          buyType: e.currentTarget.dataset.buytype,
          options: options,
          minpicker: page,
          "goods.thistime": result.goods.thistime,
        });
        if (result.goods.minbuy != 0 && $this.data.total < result.goods.minbuy) {
          var total = result.goods.minbuy
        } else {
          var total = $this.data.total
        }    
      }else{
        $this.setData({
          pickerOption: result,
          goods: result.goods,
          options: options,
          minpicker: page,
        });
        // var tempdata = $this.data.goods;
        // tempdata.optionid = false;
        // var goods = $this.data.goods;
       
        $this.setData({
          optionid: false,
          specsData: [],
          specs: []
        })
        console.log($this.data.specsData)
        
        if (result.goods.minbuy != 0 && $this.data.total < result.goods.minbuy) {
          var total = result.goods.minbuy
        } else {
          var total = 1
        }
      }
      if (result.diyform) {
        $this.setData({
          diyform: { fields: result.diyform.fields, f_data: result.diyform.lastdata }
        });
      }
      $this.setData({
        id: id,
        pagepicker: page,
        total: total,
        tempname: 'select-picker',
        active: 'active',
        show: true,
        modeltakeout: modeltakeout
      })
    });
  },
  //此方法处理sort方法判断的时候,根据第一个数字的大小来排序导致错误.例如 1456<945; author by sunc;
  sortNumber:function(a,b){
    return (a - b);
  },
  //选规格
  specsTap:function (event, $this){ 
    var specs = $this.data.specs;
    var idx = event.target.dataset.idx;
    specs[idx] ={id: event.target.dataset.id, title: event.target.dataset.title };
    var title ='';
    var optionTitle = '';
    var optionids = [];
    specs.forEach(function (e){
      title += e.title + ';';
      // optionTitle += e.id + '_';
      optionids.push(e.id);
    });
    // var newOptionids = optionids.sort();
    var newOptionids = optionids.sort(this.sortNumber);
    optionTitle = newOptionids.join('_');
    // optionTitle = optionTitle.substring(0, optionTitle.length - 1);
    var options = $this.data.options;
    if (event.target.dataset.thumb != '') {
      $this.setData({
        'goods.thumb': event.target.dataset.thumb,
      })
    }
  
    options.forEach(function (e){
    
      if (e.specs == optionTitle) {
        $this.setData({
          optionid: e.id,
          'goods.total': e.stock,
          'goods.maxprice': e.marketprice,
          'goods.minprice': e.marketprice,
          'goods.marketprice': e.marketprice,
          'goods.seecommission':e.seecommission,
          'goods.presellprice': $this.data.goods.ispresell > 0 ? e.presellprice : $this.data.goods.presellprice,
          optionCommission:true
        });
      
        if (parseInt(e.stock) < parseInt($this.data.total)) {
          $this.setData({
            canBuy: '库存不足',
            stock: e.stock
          })
          foxui.toast($this, "库存不足");
        } else {
          $this.setData({
            canBuy:'',
            stock: e.stock
          })
        }
      }
    });
    console.log(specs)
    $this.setData({
      specsData:specs,
      specsTitle: title,
    });
  },

}

