/**
 *
 * address\post.js
 *
 * @create 2017-01-09
 * @author 晚秋
 *
 * @update  晚秋 2017-01-18
 *
 */

var app = getApp();
var core = app.requirejs('core');
var fui = app.requirejs('foxui');
var $ = app.requirejs('jquery');

Page({
    data: {
        id: null,
        posting:false,
        subtext: "保存地址",
        detail: {
            realname: '',
            mobile: '',
            areas: '',
            street: '',
            address: ''
        },
        showPicker: false,
        pvalOld: [0,0,0],
        pval: [0,0,0],
        areas: [],  // 原始数据
        street: [],
        streetIndex: 0,
        noArea: false
    },
    onLoad: function (options) {
        this.setData({id: Number(options.id)});
        app.url(options);
        this.getDetail();
        if(!options.id){
            wx.setNavigationBarTitle({title: '添加收货地址'})
        }
        this.setData({areas: app.getCache("cacheset").areas,type:options.type});
    },
    getDetail: function () {
        var $this = this;
        var id = $this.data.id;
        core.get('member/address/get_detail',{id :id}, function(result){
            var data = {openstreet: result.openstreet,show:true};
            if(!$.isEmptyObject(result.detail)){
                wx.setNavigationBarTitle({title: '编辑收货地址'});
                var area = result.detail.province+" "+result.detail.city+" "+result.detail.area;
                var index = $this.getIndex(area, $this.data.areas);
                data.pval = index;
                data.pvalOld = index;
                data.detail = result.detail;
            }
            $this.setData(data);
            if(result.openstreet && index){
                $this.getStreet($this.data.areas, index);
            }
        });
    },
    submit: function () {
        var $this = this;
        var detail = $this.data.detail;
        if($this.data.posting){
            return;
        }
        if(detail.realname=='' || !detail.realname){
            fui.toast($this, "请填写收件人");
            return;
        }if(detail.mobile=='' || !detail.mobile){
            fui.toast($this, "请填写联系电话");
            return;
        }
        if(detail.city=='' || !detail.city){
            fui.toast($this, "请选择所在地区");
            return;
        }
        if($this.data.street.length>0 && (detail.street=='' || !detail.street)){
            fui.toast($this, "请选择所在街道");
            return;
        }
        if(detail.address=='' || !detail.address){
            fui.toast($this, "请填写详细地址");
            return;
        }

        if(!detail.datavalue){
            fui.toast($this, "地址数据出错，请重新选择");
            return;
        }
        if (!$.isMobile(detail.mobile)){
          fui.toast($this, "请填写正确联系电话");
          return;
        }
        detail.id = $this.data.id;
        $this.setData({posting: true});
        core.post('member/address/submit', detail, function(result){
            if(result.error!=0){
                $this.setData({posting: false});
                fui.toast($this, result.message);
                return;
            }
            $this.setData({subtext: "保存成功"});
            core.toast("保存成功");
            setTimeout(function () {
              detail.id = result.addressid;              
                
                  if ($this.data.type == 'member'){
                     wx.navigateBack();
                  } if ($this.data.type == 'quickaddress') {
                    app.setCache("orderAddress", detail, 30);
                    wx.navigateBack();
                  }else{
                     wx.redirectTo({
                         url:'/pages/member/address/select'
                  });
                }
            }, 1000);
        });
    },
    onChange: function (event) {
        var $this = this;
        var vname = $this.data.detail;
        var bindtype = event.currentTarget.dataset.type;
        var value = $.trim(event.detail.value);
        if(bindtype=='street'){
            vname.streetdatavalue = $this.data.street[value].code
            value = $this.data.street[value].name;
        }
        vname[bindtype]=value;
        $this.setData({detail: vname});
    },
    getStreet: function (areas, val) {
        if(!areas || !val){
            return;
        }
        var $this = this;
        if(!$this.data.detail.province||!$this.data.detail.city || !this.data.openstreet){
            return;
        }
        var city = areas[val[0]].city[val[1]].code;
        var area = areas[val[0]].city[val[1]].area[val[2]].code;
        core.get('getstreet', {city: city, area: area}, function(result){
            var street = result.street;
            var data = {street: street};
            if(street && $this.data.detail.streetdatavalue){
                for(var i in street){
                    if(street[i].code==$this.data.detail.streetdatavalue){
                        data.streetIndex = i;
                        $this.setData({'detail.street':street[i].name});
                        break;
                    }
                }
            }
            $this.setData(data);
        });
    },
    selectArea: function (e) {
        var area = e.currentTarget.dataset.area;
        var index = this.getIndex(area, this.data.areas);
        this.setData({pval: index, pvalOld: index,showPicker: true})
    },
    bindChange: function(e) {
        var oldValue = this.data.pvalOld;
        var newValue = e.detail.value;
        if(oldValue[0]!=newValue[0]){
            newValue[1] = 0;
        }
        if(oldValue[1]!=newValue[1]){
            newValue[2] = 0;
        }
        this.setData({pval: newValue, pvalOld: newValue});
    },
    onCancel: function (e) {
        this.setData({showPicker: false});
    },
    onConfirm: function (e) {
        var val = this.data.pval;
        var areas = this.data.areas;
        var detail = this.data.detail;
        detail.province = areas[val[0]].name;
        detail.city = areas[val[0]].city[val[1]].name;
        detail.datavalue = areas[val[0]].code+" "+areas[val[0]].city[val[1]].code;
        if(areas[val[0]].city[val[1]].area && areas[val[0]].city[val[1]].area.length>0){
            detail.area = areas[val[0]].city[val[1]].area[val[2]].name;
            detail.datavalue += " "+areas[val[0]].city[val[1]].area[val[2]].code;
            this.getStreet(areas, val);
        }else{
            detail.area = "";
        }
        detail.street = '';
        this.setData({detail: detail, streetIndex: 0, showPicker: false});
    },
    getIndex: function (str, areas) {
        if($.trim(str)=='' || !$.isArray(areas)){
            return [0,0,0];
        }
        var arr = str.split(" ");
        var index = [0,0,0];
        for (var i in areas){
            if(areas[i].name==arr[0]){
                index[0] = Number(i);
                for (var ii in areas[i].city){
                    if(areas[i].city[ii].name==arr[1]){
                        index[1] = Number(ii);
                        for (var iii in areas[i].city[ii].area){
                            if(areas[i].city[ii].area[iii].name==arr[2]){
                                index[2] = Number(iii);
                                break;
                            }
                        }
                        break;
                    }
                }
                break;
            }
        }
        return index;
    }
})