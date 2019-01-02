/**
 *
 * favorite\index.js
 *
 * @create 2017-01-09
 * @author 晚秋
 *
 * @update  晚秋 2017-02-07
 *
 */

var app = getApp();
var core = app.requirejs('core');
var $ = app.requirejs('jquery');
var diyform = app.requirejs('biz/diyform');
var goodspicker = app.requirejs('biz/goodspicker');
var foxui = app.requirejs('foxui');
Page({
    data:{
      specs:[],
      options:[],
      diyform: {},
      specsTitle: '',
      total: 1,
        active: '',
        slider: '',
        tempname: '',
        buyType: '',
        icons: app.requirejs('icons'),
        isFilterShow:false,
        listmode:'block',
        listsort:'',
        page: 1,
        loaded:false,
        loading:true,
        allcategory:[],
        catlevel:-1,
        opencategory:false,
        category:{},
        category_child:[],
        category_third:[],
        filterBtns:{},
        isfilter: 0,
        list: [],
        params:{},
        count: 0,
        defaults: {
            keywords: '',
            isrecommand: '',
            ishot: '',
            isnew: '',
            isdiscount: '',
            issendfree: '',
            istime: '',
            cate: '',
            order: '',
            by: 'desc',
            merchid: 0,
        },
        lastcat:'',
        fromsearch: false,
        searchRecords: [],
        areas: [],
        limits: true,
        modelShow: false
    },
    onLoad:function(options){
      var $this = this;
      $this.setData({ imgUrl: app.globalData.approot });
      setTimeout(function () {
        $this.setData({ areas: app.getCache("cacheset").areas });
      }, 3000)
        if(!$.isEmptyObject(options)){
            var isfilter = options.isrecommand||options.isnew||options.ishot||options.isdiscount||options.issendfree||options.istime?1:0;
            this.setData({params: options, isfilter: isfilter, filterBtns: options, fromsearch: options.fromsearch||false});
        }
        this.initCategory();
        if(!options.fromsearch){
            this.getList();
        }
        this.getRecord();
       
    },
    onShow: function(){
        if(this.data.fromsearch){
            this.setFocus();
        }
        var $this = this;
        wx.getSetting({
    	  success: function(res) {
    	    var limits = res.authSetting['scope.userInfo'];
    	    $this.setData({limits: limits})	
    	  }
        })
    },
    onReachBottom:function(){
        if(this.data.loaded || this.data.list.length==this.data.total){
            return;
        }
        this.getList();
    },
    initCategory:function(){
        var $this = this;
        core.get('goods/get_category', {} ,function(result){
            $this.setData({
                allcategory: result.allcategory,
                category_parent: result.allcategory.parent,
                category_child:[],
                category_third:[],
                catlevel:result.catlevel,
                opencategory: result.opencategory,
                show: true
            });
        });
    },
    getList: function(){
        var $this = this;
        $this.setData({loading:true});
        $this.data.params.page = $this.data.page;
        core.get('goods/get_list', $this.data.params ,function(result){
        	console.log(result)
          var data = { loading: false, count: result.total,show: true};
            if(!result.list){
                result.list = [];
            }
            if(result.list.length>0){
                data.page = $this.data.page + 1;
                data.list = $this.data.list.concat(result.list);
                if(result.list.length<result.pagesize) {
                    data.loaded = true
                }
            }
            $this.setData(data);
        });
    },
    changeMode:function(){
        if(this.data.listmode=='block'){
            this.setData({listmode:''});
        } else{
            this.setData({listmode:'block'})
        }
    },
    bindSort:function(e){
        var order =  e.currentTarget.dataset.order;
        var params = this.data.params;
        if (order == '') {
            if (params.order == order) {
                return
            }
            params.order = '';
            this.setData({listorder:''});
        } else if (order == 'minprice') {
            this.setData({listorder:''});
            if (params.order == order) {
                if (params.by == 'desc') {
                    params.by = 'asc';
                } else {
                    params.by = 'desc';
                }
            } else {
                params.by = 'asc';
            }
            params.order = order;
            this.setData({listorder: params.by});
        } else if (order == 'sales') {
            if (params.order == order) {
                return;
            }
            this.setData({listorder:''});
            //params = this.data.defaults;
            params.order = 'sales';
            params.by = 'desc';
        }
        this.setData({
            params:params,
            page:1,
            list:[],
            loading:true,
            loaded:false,
            sort_selected: order
        });
        this.getList();
    },
    showFilter:function(){
        this.setData({ isFilterShow: this.data.isFilterShow ? false: true });
    },
    btnFilterBtns:function(e){
        var type = e.target.dataset.type;
        if(!type){
            return;
        }
        var filterBtns  = this.data.filterBtns;
        if( !filterBtns.hasOwnProperty(type)){
            filterBtns[type] = '';
        }
        if(filterBtns[type]){
            delete filterBtns[type];
        }else{
            filterBtns[type] = 1;
        }
        var isfilter = $.isEmptyObject(filterBtns)?0:1;
        this.setData({
            filterBtns: filterBtns,
            isfilter: isfilter
        });
    },
    bindFilterCancel:function(){
        this.data.defaults.cate = '';
        var params = this.data.defaults;
        this.setData({
            page:1,
            params:params,
            isFilterShow:false,
            lastcat:'',
            cateogry_parent_selected:'',
            category_child_selected:'',
            category_third_selected:'',
            category_child:[],
            category_third:[],
            filterBtns:{},
            loading:true,
            loaded:false,
            listorder:'',
            list: []
        });
        this.getList();
    },
    bindFilterSubmit:function(){
        var params = this.data.params;
        var filterBtns  = this.data.filterBtns;
        for(var i in filterBtns){
            params[i] = filterBtns[i];
        }
        if($.isEmptyObject(filterBtns)){
            params = this.data.defaults;
        }
        params.cate = this.data.lastcat;
        this.setData({
            page:1,
            params:params,
            isFilterShow:false,
            filterBtns: filterBtns ,
            list:[],
            loading:true,
            loaded:false
        });
        this.getList();
    },
    bindCategoryEvents:function(e){
        var lastcat = e.target.dataset.id;
        this.setData({
           lastcat: lastcat 
        });
        var level =e.target.dataset.level; 
        if(level==1){
            this.setData({
                category_child:[],
                category_third:[]
            });
           this.setData({
            category_parent_selected: lastcat,
            category_child:this.data.allcategory['children'][lastcat]
           });
        }else if(level==2){
             this.setData({
                category_third:[]
            });
            this.setData({
                category_child_selected: lastcat,
                category_third:this.data.allcategory['children'][lastcat]
            });
        } else{       
            this.setData({
                category_third_selected: lastcat,
            });
        }   
    },
    bindSearch:function(e){
        var input = e.target;
        this.setData({list:[],loading:true,loaded:false});
        var value = $.trim(e.detail.value);
        var params = this.data.defaults;
        if( value!= '') {
            params.keywords = value;
            this.setData({
                page:1,
                params:params,
                fromsearch: false
            })
            this.getList();
            this.setRecord(value);
        }else{
            params.keywords = '';
            this.setData({
                page:1,
                params:params,
                listorder:'',
                fromsearch: false
            });
            this.getList();
        }
     },
     bindInput:function(e){
         var value = $.trim(e.detail.value);
         var params = this.data.defaults;
         params.keywords = '';
         params.order = this.data.params.order;
         params.by = this.data.params.by;
         if (value == '') {
             this.setData({
                 page: 1,
                 list: [],
                 loading: true,
                 loaded: false,
                 params: params,
                 listorder: params.by,
                 fromsearch: true
             })
             //this.getList();
             this.getRecord();
         }
    },
    bindFocus: function (e) {
        var value = $.trim(e.detail.value);
        if(value==''){
            this.setData({
                fromsearch: true
            });
        }
    },
    bindback: function () {
        wx.navigateBack();
    },
    bindnav: function (e) {
        var text = $.trim(e.currentTarget.dataset.text);
        var params = this.data.defaults;
        params.keywords = text;
        this.setData({params: params, page: 1, fromsearch: false});
        this.getList();
        this.setRecord(text);
    },
    getRecord: function () {
        var records = app.getCache("searchRecords");
        this.setData({searchRecords: records});
    },
    setRecord: function (value) {
        if (value!=''){
            var records = app.getCache("searchRecords");
            if(!$.isArray(records)){
                records = [];
                records.push(value);
            }else{
                var newArr = [];
                newArr.push(value);
                for (var i in records){
                    if(newArr.length>20){
                        break;
                    }
                    if(records[i]==value || records==null || records=='null'){
                        continue;
                    }else{
                        newArr.push(records[i]);
                    }
                }
                records = newArr;
            }
            app.setCache("searchRecords", records);
        }else{
            app.setCache("searchRecords", []);
        }
        this.getRecord();
    },
    delRecord: function () {
        this.setRecord('');
        this.setData({fromsearch: true});
    },
    setFocus: function(){
        var $this = this;
        setTimeout(function(){
            $this.setData({focusin: true})
        }, 1000);
    },
    // 购买picker
    selectPicker:function(e){
      app.checkAuth();
      var $this = this;
      
      // if(!$this.data.limits){
      // 	$this.setData({modelShow: true})
      // 	return
      // }
      
      var goodslist = 'goodslist';
      goodspicker.selectpicker(e,$this,goodslist)
    },
    // 选规格
    specsTap:function(event){
      var $this = this
      goodspicker.specsTap(event, $this)
    },
  // 选赠品
  chooseGift(e) {
    goodspicker.chooseGift(e, this)
  },
    //关闭pickerpicker
    emptyActive: function () {
      this.setData({
        active: '', slider: 'out', tempname: '',specsTitle:''
      });
    },
    // 立即购买
    buyNow: function (event){
      var $this = this
      goodspicker.buyNow(event, $this)
    },
    //加入购物车
    getCart: function (event){
      var $this = this
      goodspicker.getCart(event, $this)
    },
    select:function(){
      var $this = this
      goodspicker.select($this)
    },
    //数量输入绑定事件
    inputNumber: function (e){
      var $this = this
      goodspicker.inputNumber(e,$this)
    },
    number:function(e){
      var $this = this
      goodspicker.number(e, $this)
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
    
     /*用户授权-取消*/
    cancelclick:  function(){
   	  this.setData({modelShow: false})
    },
    /*用户授权-去设置*/
    confirmclick: function(){
      this.setData({modelShow: false})
      wx.openSetting({
    	success: function(res) {}
      })
    }
})