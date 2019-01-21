/**
 *
 * bind\index.js
 *
 * @create 2017-01-11
 * @author 晚秋
 *
 * @update  晚秋 2017-01-12
 *
 */
var app = getApp();
var core = app.requirejs('core');
var foxui = app.requirejs('foxui');
var $ = app.requirejs('jquery');

Page({
    data: {
        member: {},
        binded: false,
        endtime: 0,
        postData: {},
        submit: false,
        subtext: "立即绑定",
        smsimgcode:'',
        verifycode_img:''
    },
    onLoad: function (options) {
        app.url(options);
        core.loading();
        this.getInfo();
    },
    getInfo: function () {
        var $this = this,title;
        core.get('member/bind', {}, function(result){
            if(result.error){
                wx.redirectTo({url: "/pages/member/index/index"});
                return;
            }
            var data = { member: result.member, binded: result.binded, endtime: result.endtime, show: true, smsimgcode: result.smsimgcode, verifycode_img: result.verifycode_img};
            data.postData = {mobile: result.member.mobile, code: '', password: '', password1: ''};
            $this.setData(data);
            if(result.endtime>0){
                $this.endTime();
            }
            if(result.binded){
                title = "更换绑定手机号";
            }else{
                title = "绑定手机号";
            }
            wx.setNavigationBarTitle({title: title});
        }, true, true, true);
    },
    endTime: function () {
        var $this = this;
        var endtime = $this.data.endtime;
        if(endtime>0){
            $this.setData({endtime: endtime-1});
            var end = setTimeout(function () {
                $this.endTime();
            },1000);
        }
        return;
    },
    inputChange: function (event) {
        var postData = this.data.postData;
        var type = core.pdata(event).type;
        var value = event.detail.value;
        postData[type] = $.trim(value);
        this.setData({postData: postData});
    },
    getCode: function (event) {
        var $this = this;
        if($this.data.endtime>0){
            return;
        }
        var mobile = $this.data.postData.mobile;
        if(!$.isMobile(mobile)){
            foxui.toast($this, "请填写正确的手机号");
            return;
        }

        if ($this.data.smsimgcode == 1){
          var verifyImg = $this.data.postData.verifyImg;
          if (verifyImg == undefined){
            foxui.toast($this, "请填写图形验证码");
            return;
          }

        }

        core.get('sms/changemobile', { mobile: mobile, verifyImgCode: verifyImg, smsimgcode: $this.data.smsimgcode}, function(result){
            if(result.error!=0){
                foxui.toast($this, result.message);
                return;
            }
            foxui.toast($this, "短信发送成功");
            $this.setData({endtime: 60});
            $this.endTime();
            return;
        }, true, true, true);
    },
    submit: function (event) {
        if(this.data.submit){
            return;
        }
        var $this = this;
        var postData = this.data.postData;
        if(!$.isMobile(postData.mobile)){
            foxui.toast(this, "请填写正确的手机号");
            return;
        }
        if(postData.code.length!=5){
            foxui.toast(this, "请填写5位短信验证码");
            return;
        }
        if(!postData.password || postData.password==''){
            foxui.toast(this, "请填写登录密码");
            return;
        }
        if(!postData.password1 || postData.password1==''){
            foxui.toast(this, "请确认登录密码");
            return;
        }
        if(postData.password != postData.password1){
            foxui.toast(this, "两次输入的密码不一致");
            return;
        }
        this.setData({submit: true, subtext: "正在绑定..."});

        core.post('member/bind/submit', postData, function(ret){
            if(ret.error==92001||ret.error==92002){
                core.confirm(ret.message, function () {
                    postData.confirm = 1;
                    core.post('member/bind/submit', postData, function(ret2){
                        if(ret2.error>0){
                            foxui.toast($this, ret2.message);
                        }else{
                            wx.navigateBack();
                        }
                        $this.setData({submit: false, subtext: "立即绑定", "postData.confirm": 0});
                    }, true, true, true);
                })
                return;
            }
            else if(ret.error!=0){
                foxui.toast($this, ret.message);
                $this.setData({submit: false, subtext: "立即绑定"});
                return;
            }
            wx.navigateBack();
        }, true, true, true);
    },
    imageChange:function(){
      var $this = this;
      core.get('member/bind/imageChange',{},function(result){
         
        $this.setData({ verifycode_img: result.verifycode_img});
      });
    }
})