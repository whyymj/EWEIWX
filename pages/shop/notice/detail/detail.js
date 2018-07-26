//index.js
//获取应用实例
var app = getApp();
var core = app.requirejs('core');
var parser = app.requirejs('wxParse/wxParse');

Page({
    data: {
        id:'-',
        title:'-',
        createtime:'-'
    },
    onLoad: function (options) {
        var $this = this;
        $this.setData({ id: options.id});
        app.url(options);

        core.get('shop/notice/detail',{'id': this.data.id},function(data){
            var notice = data.notice;
            parser.wxParse('wxParseData','html', notice.detail,$this,'5');
            $this.setData({
                show: true,
                title: notice.title,
                createtime: notice.createtime,
            });

        })

    }
})
