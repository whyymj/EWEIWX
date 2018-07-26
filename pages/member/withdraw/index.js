/**
 *
 * withdraw\index.js
 *
 * @create 2017-01-09
 * @author 晚秋
 *
 * @update  晚秋 2017-01-10
 *
 */
var app = getApp();
var core = app.requirejs('core');
var foxui = app.requirejs('foxui');
var $ = app.requirejs('jquery');

Page({
    data: {
        loading: true,
        objectArray: [],
        checkedIndex: 1,
        checked: {},
        bankChecked: {},
        money: 0,
        chargeShow: false,
        disabled: true,
        info: {},
        realInfo: {}
    },
    onShow: function (options) {
        app.url(options);
        this.getInfo();
        this.setData({isSubmit: false});
    },
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh()
    },
    getInfo: function () {
        var $this = this;
        core.get('member/withdraw', {}, function (result) {
          // result.type_array.push({ type: 0, title: "提现到微信余额"});
            var data = {info: result, objectArray: [],show:true};
            if(!$.isEmptyObject(result.last_data)){
                data.realInfo = {alipay: result.last_data.alipay, alipay1: result.last_data.alipay, bankcard: result.last_data.bankcard, bankcard1: result.last_data.bankcard, bankname: result.last_data.bankname, realname: result.last_data.realname};
            }
            if(result.type_array){
                $.each(result.type_array, function (index,val) {
                    data.objectArray.push({id: val.type, name: val.title})
                    if(val.checked){
                        if(!data.checked){
                            data.checked = {id: val.type, name: val.title};
                        }
                        data.checkedIndex = index;
                    }
                });
            }
            if(!data.checked){
                data.checked = data.objectArray[0];
                data.checkedIndex = 0;
            }
            data.bankCheckedIndex = result.lastbankindex||0;
            $this.setData(data);
            if(result.withdrawmoney>0 && result.credit>=result.withdrawmoney){
                data.money = result.withdrawmoney;
                $this.moneyChange({detail: {value: result.withdrawmoney}});
            }
            if(data.checked.id==3){
                $this.bankChange({detail: {value: result.lastbankindex||0}});
            }
            wx.setNavigationBarTitle({title: result.moneytext+"提现"})
        });
    },
    bindAll: function (event) {
        if(this.data.info.credit<=0){
            return;
        }
        this.setData({money: this.data.info.credit});
        this.allow();
        this.moneyChange({detail: {value: this.data.info.credit}});
    },
    allow: function () {
        var info = this.data.info;
        var money = parseFloat(this.data.money);
        if(money<=0 || isNaN(money)){
            return false;
        }
        if(info.withdrawmoney>0 && money<info.withdrawmoney){
            return false;
        }
        if(money>info.credit){
            return false;
        }
        if ($.isEmptyObject(this.data.checked)){
            return false;
        }
        if (info.withdrawcharge>0 && money>0) {
            var deductionmoney = money / 100 * info.withdrawcharge;
            deductionmoney = Math.round(deductionmoney*100)/100;
            if (deductionmoney >= info.withdrawbegin && deductionmoney <= info.withdrawend) {
                deductionmoney = 0;
            }
            var realmoney = money - deductionmoney;
            realmoney = Math.round(realmoney*100)/100;
            this.setData({deductionmoney: deductionmoney, realmoney: realmoney, chargeShow: true})
        }
        return true;
    },
    moneyChange: function (event) {
        var money = event.detail.value;
        if(money<0 || isNaN(money)){
            money = 0;
        }
        this.setData({money: money});
        this.setData({disabled: this.allow()?false:true})
    },
    // pickerChange: function (event) {
    //     var data = {};
    //     var index = event.detail.value;
    //     data.checked = this.data.objectArray[index];
    //     if(data.checked.id==3){
    //         data.bankChecked = this.data.info.banklist[0];
    //         data.bankCheckedIndex = 0;
    //     }
    //     this.setData(data);
    // },
    typeChange: function (e) {
      // var val = e.detail.value;//源代码
      // var applytype = this.data.type_array[val].type;
      // this.setData({applytype:applytype, applyIndex: val});

      //mjy 结构改变   applytype赋值
      // var val = e.currentTarget.dataset.name;
      // console.log(val);
      // // var applytype = val;
      // this.setData({ applytype: val });
      var data = {};
      var index = e.currentTarget.dataset.name;
        data.checked = this.data.objectArray[index];
        if(data.checked.id==3){
            data.bankChecked = this.data.info.banklist[0];
            data.bankCheckedIndex = 0;
        }
        this.setData(data);
    },
    inputChange: function (event) {
        var realinfo = this.data.realInfo;
        var bindtype = event.currentTarget.dataset.type;
        var value = $.trim(event.detail.value);
        realinfo[bindtype]=value;
        this.setData({realInfo: realinfo});
    },
    bankChange: function (event) {
        var index=$.trim(event.detail.value), bank=this.data.info.banklist[index];
        this.setData({bankChecked: bank});
    },
    submit: function (event) {
        var $this=this, data=this.data;
        if(data.disabled || data.isSubmit){
            return;
        }
        if(data.money<=0){
            foxui.toast($this, "请填写提现金额");
            return;
        }
        if($.isEmptyObject(data.checked)){
            foxui.toast($this, "请选择提现方式");
            return;
        }
        var html = data.checked.name;
        var postData = {applytype: data.checked.id, money: data.money};
        if(data.checked.id==2){
            if(!data.realInfo.realname){
                foxui.toast($this, "请填写姓名");
                return;
            }
            if(!data.realInfo.alipay){
                foxui.toast($this, "请填写支付宝帐号");
                return;
            }
            if(!data.realInfo.alipay1){
                foxui.toast($this, "请确认支付宝帐号");
                return;
            }
            if(data.realInfo.alipay != data.realInfo.alipay1){
                foxui.toast($this, "两次填写的支付宝不一致");
                return;
            }
            html += "？姓名:" + data.realInfo.realname + " 支付宝帐号:" + data.realInfo.alipay;
            postData.realname = data.realInfo.realname;
            postData.alipay = data.realInfo.alipay;
            postData.alipay1 = data.realInfo.alipay1;
        }
        else if(data.checked.id==3){
            if($.isEmptyObject(data.bankChecked)){
                foxui.toast($this, "请选择提现银行");
                return;
            }
            if(!data.realInfo.realname){
                foxui.toast($this, "请填写姓名");
                return;
            }
            if(!data.realInfo.bankcard){
                foxui.toast($this, "请填写银行卡号");
                return;
            }
            if(!data.realInfo.bankcard1){
                foxui.toast($this, "请确认银行卡号");
                return;
            }
            if(data.realInfo.bankcard != data.realInfo.bankcard1){
                foxui.toast($this, "两次填写的银行卡号不一致");
                return;
            }
            html += "？姓名:" + data.realInfo.realname + " 银行:" + data.bankChecked.bankname + " 卡号:" + data.realInfo.bankcard;
            postData.realname = data.realInfo.realname;
            postData.bankname = data.bankChecked.bankname;
            postData.bankcard = data.realInfo.bankcard;
            postData.bankcard1 = data.realInfo.bankcard1;
        }
        if (data.checked.id < 2) {
            var confirm_msg = '确认要' + html + "？";
        } else {
            var confirm_msg = '确认要' + html;
        }
        if (data.info.withdrawcharge > 0) {
            confirm_msg += ' 扣除手续费 ' + data.deductionmoney + ' 元,实际到账金额 ' + data.realmoney + ' 元';
        }
        core.confirm(confirm_msg, function () {
            $this.setData({isSubmit: true});
            core.post('member/withdraw/submit', postData, function (result) {
                if(result.error){
                    foxui.toast($this, result.message);
                    $this.setData({isSubmit: false});
                    return;
                }
                foxui.toast($this, "提现申请成功，请等待审核");
                setTimeout(function () {
                    wx.navigateTo({url: '/pages/member/log/index?type=1'});
                }, 500);
            });
        });
    }
})