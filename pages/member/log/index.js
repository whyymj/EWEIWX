/**
 *
 * favorite\index.js
 *
 * @create 2017-01-09
 * @author 晚秋
 *
 * @update  晚秋 2017-01-09
 *
 */

var app = getApp();
var core = app.requirejs('core');

Page({
    data: {
        icons: app.requirejs('icons'),
        type: 0,
        isopen: false,
        page: 1,
        loaded: false,
        loading: true,
        list: []
    },
    onLoad: function (options) {
        if(options.type>0){
            this.setData({type: 1});
        }
        app.url(options);
        this.getList();
    },
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh()
    },
    onReachBottom:function(){
        if(this.data.loaded || this.data.list.length==this.data.total){
            return;
        }
        this.getList();
    },
    getList: function () {
        var $this = this;
        $this.setData({loading:true});
        core.get('member/log/get_list', {type: $this.data.type, page: $this.data.page}, function(result){
            var data = {loading: false, total: result.total,show:true};
            if($this.data.page==1){
                data.isopen = result.isopen;
                var title = "充值记录";
                if (result.isopen==1){
                    title = result.moneytext +"明细"
                }
                wx.setNavigationBarTitle({title: title})
            }
            if(!result.list){
                result.list = [];
            }
            if(result.list.length>0){
                data.page = $this.data.page+1;
                data.list = $this.data.list.concat(result.list);
                if(result.list.length<result.pagesize) {
                    data.loaded = true
                }
            }
            $this.setData(data);
        });
    },
    myTab: function (event) {
        var $this = this;
        var type = core.pdata(event).type;
        $this.setData({type: type, page: 1, list: [], loading: true});
        $this.getList();
    }
})