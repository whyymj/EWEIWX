/**
 *
 * member\info\index.js
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
var diyform = app.requirejs('biz/diyform');
var $ = app.requirejs('jquery');

Page({
    data: {
        icons: app.requirejs('icons'),
        member: {},
        diyform: {},
        postData: {},
        openbind: false,
        index: 0,
        submit: false,

        showPicker: false,
        pvalOld: [0,0,0],
        pval: [0,0,0],
        areas: [],
        noArea: true
    },
    onLoad: function (options) {
    	app.url(options);
    	var $this = this;
    	setTimeout(function(){
    		$this.setData({areas: app.getCache("cacheset").areas});
    	},1000)
    },
    onShow: function () {
        this.getInfo();
    },
    getInfo: function () {
        var $this = this;
        core.get('member/info', {}, function(result){
            var member = result.member;
            var data = {member: member,diyform: result.diyform, openbind: result.openbind,show:true};
            if(result.diyform.template_flag==0){
                data.postData = {realname: member.realname, mobile: member.mobile, weixin: member.weixin, birthday: member.birthday, city: member.city};
            }
            $this.setData(data);
        });
    },
    onChange: function (event) {
        var value = event.detail.value;
        var type = core.pdata(event).type;
        var postData = this.data.postData;
        postData[type] = $.trim(value);
        this.setData({postData: postData});
    },
    DiyFormHandler: function(e){
        return diyform.DiyFormHandler(this, e)
    },
    submit: function () {
        if(this.data.submit){
            return;
        }
        var $this = this;
        var data = $this.data;
        var diydata = data.diyform;
        if(diydata.template_flag==0){
            if(!data.postData.realname){
                foxui.toast($this, "请填写姓名");
                return;
            }
            if(!$.isMobile(data.postData.mobile) && !data.openbind){
                foxui.toast($this, "请填写正确手机号码");
                return;
            }
        }else{
            var verify = diyform.verify(this, diydata);
            if(!verify){
                return;
            }
        }
        $this.setData({submit: true});
        var postData = {memberdata: data.postData};
        if(diydata.template_flag){
            postData.memberdata = diydata.f_data;
        }

        core.post('member/info/submit', postData, function(result){
            if(result.error!=0){
                foxui.toast($this, result.message);
                return;
            }
            $this.setData({submit: false});
            foxui.toast($this, "修改成功");
            setTimeout(function () {
                wx.navigateBack();
            }, 500);
        });
    },

    selectArea: function (e) {
        return diyform.selectArea(this, e)
    },
    bindChange: function(e) {
        return diyform.bindChange(this, e)
    },
    onCancel: function (e) {
        return diyform.onCancel(this, e)
    },
    onConfirm: function (e) {
        if(!this.data.diyform.template_flag){
            var val = this.data.pval;
            var areas = this.data.areas;
            var postData = this.data.postData;
            postData.city = areas[val[0]].name+" "+areas[val[0]].city[val[1]].name;
            this.setData({postData: postData, showPicker: false});
        }else{
            return diyform.onConfirm(this, e)
        }
    },
    getIndex: function (str, areas) {
        return diyform.getIndex(str, areas)
    }
})
