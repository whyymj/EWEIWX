/**
 *
 * history\index.js
 *
 * @create 2017-01-09
 * @author 晚秋
 *
 * @update  晚秋 2017-01-09
 *
 */

var app = getApp();
var core = app.requirejs('core');
var foxui = app.requirejs('foxui');

Page({
    data: {
        icons: app.requirejs('icons'),
        page: 1,
        loading: false,
        loaded: false,
        isedit: false,
        isCheckAll: false,
        checkObj: {},
        checkNum: 0,
        list: []
    },
    onLoad: function (options) {
        app.url(options);
        this.getList();
    },
    onShow: function(){
      var isIpx = app.getCache('isIpx');
      var $this = this;
      console.error(isIpx)
      if (isIpx) {
        $this.setData({
          isIpx: true,
          iphonexnavbar: 'fui-iphonex-navbar',
          paddingb: 'padding-b'
        })
      } else {
        $this.setData({
          isIpx: false,
          iphonexnavbar: '',
          paddingb: ''
        })
      }
    },
    onReachBottom: function () {
        if (this.data.loaded || this.data.list.length==this.data.total) {
            return;
        }
        this.getList();
    },
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh()
    },
    getList: function () {
        var $this = this;
        $this.setData({loading: true});
        core.get('member/history/get_list', {page: $this.data.page}, function (result) {
            var data = {loading: false, loaded: true, total: result.total, pagesize: result.pagesize,show:true};
            if (result.list.length > 0) {
                data.page = $this.data.page + 1;
                data.list = $this.data.list.concat(result.list);
                if(result.list.length<result.pagesize) {
                    data.loaded = true
                }
            }
            $this.setData(data);
        });
    },
    itemClick: function (event) {
        var $this = this;
        var id = core.pdata(event).id;
        var goodsid = core.pdata(event).goodsid;
        if (!$this.data.isedit) {
            wx.navigateTo({url: '/pages/goods/detail/index?id=' + goodsid});
        } else {
            var checkObj = $this.data.checkObj;
            var checkNum = $this.data.checkNum
            if (checkObj[id]) {
                checkObj[id] = false;
                checkNum--;
            } else {
                checkObj[id] = true;
                checkNum++;
            }
            var isCheckAll = true;
            for (var i in checkObj) {
                if (!checkObj[i]) {
                    isCheckAll = false;
                    break;
                }
            }
            $this.setData({checkObj: checkObj, isCheckAll: isCheckAll, checkNum: checkNum});
        }
    },
    btnClick: function (event) {
        var $this = this;
        var action = event.currentTarget.dataset.action;
        if (action == 'edit') {
            var checkObj = {};
            for (var i in this.data.list) {
                var id = this.data.list[i].id;
                checkObj[id] = false;
            }
            $this.setData({isedit: true, checkObj: checkObj, isCheckAll: false});
        }
        else if (action == 'delete') {
            var checkObj = $this.data.checkObj;
            var ids = [];
            for (var i in checkObj) {
                if (checkObj[i]) {
                    ids.push(i);
                }
            }
            if (ids.length < 1) {
                return;
            }
            core.confirm("删除后不可恢复，确定要删除吗？", function () {
                core.post('member/history/remove', {ids: ids}, function (result) {
                    $this.setData({isedit: false, checkNum: 0, page: 0, list: []});
                    $this.getList();
                });
            });
        }
        else if (action == 'finish') {
            $this.setData({isedit: false, checkNum: 0});
        }
    },
    checkAllClick: function () {
        var isCheckAll = this.data.isCheckAll ? false : true;
        var checkObj = this.data.checkObj;
        var data = {isCheckAll: isCheckAll, checkObj: checkObj};
        for (var i in checkObj) {
            data.checkObj[i] = isCheckAll ? true : false;
        }
        data.checkNum = isCheckAll ? this.data.list.length : 0;
        this.setData(data);
    }
})