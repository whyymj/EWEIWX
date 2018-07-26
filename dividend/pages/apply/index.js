var app = getApp();
var core = app.requirejs('/core');
var foxui = app.requirejs('/foxui');
var $ = app.requirejs('jquery');
Page({
  data: {
    radios: {
      balance: {
        checked: 0,
        name: '余额'
      },
      weixin: {
        checked: 0,
        name: '微信'
      },
      alipay: {
        checked: 0,
        name: '支付宝'
      },
      card: {
        checked: 0,
        name: '银行卡'
      }
    },
    args: {}
  },
  onLoad: function (options) {
    var $this = this;
    core.get('dividend/apply', '', function (res) {
      $this.setData({ msg: res })
      if (!res.member) {

      }
    })
  },

  selected: function (e) {
    var $this = this;
    var radios = $this.data.radios;
    var status = e.currentTarget.dataset.status;
    for(var i in radios){
      if (status == i){
        radios[i].checked = e.currentTarget.dataset.checked == true ? false : true;
        $this.setData({ radios: radios, 'args.type': e.currentTarget.dataset.type })
      }else{
        radios[i].checked = false;
        $this.setData({ radios: radios })
      }
    }
  },

  changeinput: function (e) {
    var $this = this,
      val = e.detail.value,
      key = e.target.dataset.input,
      msg = $this.data.args;
    msg[key] = val;
    $this.setData({ args: msg });
  },

  bindpullldown: function (e) {
    console.error(e.detail.value)
    var $this = this,
      index = e.detail.value,
      banklist = $this.data.msg.banklist,
      msg = $this.data.args;
    for (var i in banklist){
      if(i == index){
        $this.setData({ 'args.bankname': banklist[index].bankname, index: index})
      }
    }
  },

  submit: function(){
    var $this = this,
        text = '',
        args = $this.data.args;

        if(args.type == 0){
          text = '余额'
        } else if (args.type == 1){
          text = '微信钱包';
        } else if (args.type == 2) {
          text = '支付宝';
          if (!args.realname) {
            foxui.toast($this, '请输入姓名');
            return
          }
          if (!args.alipay) {
            foxui.toast($this, '请输入支付宝账号');
            return
          }
          if (!args.alipay1) {
            foxui.toast($this, '请输入支付宝确认账号');
            return
          }
          if (args.alipay != args.alipay1) {
            foxui.toast($this, '支付宝账号不一致');
            return
          }
          
        } else if (args.type == 3) {
          text = '银行卡';
          if (!args.realname1) {
            foxui.toast($this, '请输入姓名');
            return
          }
          if (!args.bankname) {
            foxui.toast($this, '请选择银行');
            return
          }
          if (!args.bankcard) {
            foxui.toast($this, '请输入银行卡账号');
            return
          }
          if (!args.bankcard1) {
            foxui.toast($this, '请输入银行卡确认账号');
            return
          }
          if (args.bankcard != args.bankcard1) {
            foxui.toast($this, '银行卡账号不一致');
            return
          }
          args.realname = args.realname1;
        }
    wx.showModal({
      title: '提示',
      content: '确认提现到'+ text +'吗？',
      success: function (res) {
        if (res.confirm) {
          core.post('dividend/apply', args, function (res) {
           wx.navigateBack({
             detail: 1
           })
          })
        }
      }
    })
  }
})