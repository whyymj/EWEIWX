var app=getApp(),$ = app.requirejs('jquery'),core = app.requirejs('core'),foxui = app.requirejs('foxui');
module.exports = {
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
    },
    onConfirm: function ($this, e) {
        var val = $this.data.pval;
        var field = $this.data.bindAreaField;
        var data = $.isEmptyObject($this.data.diyform.f_data)?{}:$this.data.diyform.f_data;
        var areas = $this.data.areas;
        data[field] = data[field] || {};
        data[field].province = areas[val[0]].name;
        data[field].city = areas[val[0]].city[val[1]].name;

        // if ($this.data.areaKey){
        //   var areaObj = {
        //     province: areas[val[0]].name,
        //     city: areas[val[0]].city[val[1]].name
        //   };
        // }

        if ($this.data.areaKey) {
          var areaObj = $this.data.areaDetail[$this.data.areaKey]
          areaObj.province = areas[val[0]].name;
          areaObj.city = areas[val[0]].city[val[1]].name;
        }

        if(!$this.data.noArea){
            data[field].area = areas[val[0]].city[val[1]].area[val[2]].name;
            if ($this.data.areaKey){
              areaObj.area = areas[val[0]].city[val[1]].area[val[2]].name;
            }
        }
        
        $this.setData({"diyform.f_data": data, showPicker: false, bindAreaField: false});

        if ($this.data.areaKey){
          var areaDetail = $this.data.areaDetail || {};
          areaDetail[$this.data.areaKey] = areaObj;
          $this.setData({areaDetail: areaDetail});


        }
    },
    onCancel: function ($this, e) {
        $this.setData({showPicker: false});
    },
    onChange: function ($this, e) {
        var value = e.detail.value;
        var type = core.pdata(e).type;
        var postData = $this.data.postData;
        postData[type] = $.trim(value);
        $this.setData({postData: postData});
    },
    bindChange: function($this, e) {
        var oldValue = $this.data.pvalOld;
        var newValue = e.detail.value;
        if(oldValue[0]!=newValue[0]){
            newValue[1] = 0;
        }
        if(oldValue[1]!=newValue[1]){
            newValue[2] = 0;
        }
        $this.setData({pval: newValue, pvalOld: newValue});
    },
    selectArea: function ($this, e) {
        var area = e.currentTarget.dataset.area;
        var field = e.currentTarget.dataset.field;
        var noArea = e.currentTarget.dataset.hasarea==1?false:true;
        var index = $this.getIndex(area, $this.data.areas);
        // 自定义区域key
        var areaKey = e.currentTarget.dataset.areakey;
        var obj = {pval: index, pvalOld: index, showPicker: true, noArea: noArea, bindAreaField: field};
        if (areaKey){
          obj.areaKey = areaKey;
        }
        $this.setData(obj);
    },
    DiyFormHandler: function($this, e){
        var dataset = e.target.dataset;
        var type = dataset.type;
        var field = dataset.field;
        var data_type = dataset.datatype;
        var data = $this.data.diyform.f_data;

        if($.isArray(data) || typeof(data) !='object'){
            data = {};
        }
        var fields =$this.data.diyform.fields;
        if(type=='input' || type=='textarea' || type=='checkbox' || type=='date' || type=='datestart' || type=='dateend' || type=='time' || type=='timestart' || type=='timeend' || type=='radio'){
            if(type=='datestart' || type=='timestart'){
                if(!$.isArray(data[field])){
                    data[field] = [];
                }
                data[field][0] = e.detail.value;
            }else if(type=='dateend' || type=='timeend'){
                if(!$.isArray(data[field])){
                    data[field] = [];
                }
                data[field][1] = e.detail.value;
            }else if(type=='checkbox'){
                data[field] = {};
                for (var ii in e.detail.value){
                    var  val = e.detail.value[ii];
                    data[field][val] = 1
                }
            }else if(type=='radio'){
                data[field] = e.detail.value;
            }else{
                if(data_type==10){
                    if ($.isEmptyObject(data[field])){
                        data[field] = {};
                    }
                    data[field][dataset.name] = e.detail.value;
                }else{
                    data[field] = e.detail.value;
                }
            }
        }else if(type=='picker'){
            for(var i in data){
                if( i== field){
                    for(var j in  fields){
                        if( fields[j].diy_type==field ){
                            data[field] = [ e.detail.value, fields[j].tp_text[e.detail.value] ]
                            break;
                        }
                    }
                    break;
                }
            }
        }else if(type=='image'){
            core.upload(function(file){
                for(var i in data){
                    if( i == field){
                        if(!data[field]){
                            data[field] = {};
                        }
                        if(!data[field].images){
                            data[field].images = [];
                        }
                        data[field].images.push({'url': file.url ,'filename': file.filename});
                        break;
                    }
                }
                data[field].count = data[field].images.length;
                $this.setData({"diyform.f_data": data});
            });
        }else if(type=='image-remove'){
            for(var i in data){
                if( i == field){
                    var newdata = { images:[] };
                    for(var j in data[field].images){
                        if( data[field].images[j].filename!= dataset.filename ){
                            newdata.images.push( data[field].images[j] );
                        }
                    }
                    newdata.count = newdata.images.length;
                    data[field] =newdata;
                    break;
                }
            }
        }else if(type=='image-preview'){
            for(var i in data){
                if( i == field){
                    var images = [];
                    for(var j in data[field].images){
                        images.push( data[field].images[j].url);
                    }
                    wx.previewImage({
                        current: images[dataset.index],
                        urls: images
                    })
                    break;
                }
            }
        }
        $this.setData({"diyform.f_data": data});
    },
    verify: function ($this, diyform) {
        for (var index in diyform.fields){
            var field = diyform.fields[index];
            var type = field.diy_type;
            if(field.tp_must==1){
                if(field.data_type==5){
                    if(!diyform.f_data[type] || diyform.f_data[type].count<1){
                        foxui.toast($this, "请选择"+field.tp_name);
                        return false;
                    }
                }
                else if(field.data_type==9){
                    if($.isEmptyObject(diyform.f_data[type])||!diyform.f_data[type].province||!diyform.f_data[type].city){
                        foxui.toast($this, "请选择"+field.tp_name);
                        return false;
                    }
                }
                else if(field.data_type==10){
                    if($.isEmptyObject(diyform.f_data[type]) || !diyform.f_data[type].name1){
                        foxui.toast($this, "请填写"+field.tp_name);
                        return false;
                    }
                    if(!diyform.f_data[type].name2 || diyform.f_data[type].name2==''){
                        foxui.toast($this, "请填写"+field.tp_name2)
                        return false;
                    }
                } else if (field.data_type == 11){
                  if (!diyform.f_data[type]) {
                    foxui.toast($this, "请填写" + field.tp_name);
                    return false;
                  }
                }
                else{
                    if(!diyform.f_data[type]){
                        foxui.toast($this, "请填写"+field.tp_name);
                        return false;
                    }
                }
            }
            if(field.data_type==6){
                var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
                if (!reg.test(diyform.f_data[type])) {
                    foxui.toast($this, "请填写正确的"+field.tp_name);
                    return false;
                }
            }
            if(field.data_type==10){
                if($.isEmptyObject(diyform.f_data[type]) || diyform.f_data[type].name1 != diyform.f_data[type].name2){
                    foxui.toast($this, field.tp_name+"与"+field.tp_name2+"不一致")
                    return false;
                }
            }
        }
        return true;
    }
};