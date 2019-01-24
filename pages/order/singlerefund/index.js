/**
 *
 * order/detail/index.js
 *
 * @create 2017-1-16
 * @author Young
 *
 * @update  Young 2017-01-16
 *
 */
var app = getApp(),core=app.requirejs('core'),order = app.requirejs('biz/order');;
Page({
    data: {
        code:1,
        tempFilePaths: '',
        delete: '',
        rtypeArr: ['退款(仅退款不退货)','退货退款','换货'],
        rtypeArrText: ['退款','退款','换货'],
        rtypeIndex: 1,
        reasonArr: ['不想要了','卖家缺货','拍错了/订单信息错误','其它'],
        reasonIndex:0,
        images:[]
    },
    onLoad: function (options) {
        this.setData({
            options: options
        });
        app.url(options);
        this.get_list();
    },
    get_list: function () {
        var $this = this;
        core.get('order/single_refund', $this.data.options, function (list) {
          $this.setData({ show: true })
            if (list.error == 0) {
                if (list.order.status<2 && list.order.sendtime<=0){
                    list.rtypeArr=['退款(仅退款不退货)'];
                }
                // list.show = true;
                $this.setData(list);
               
            } else {
                core.toast(list.message, 'none');
                setTimeout(function() {
                  wx.navigateBack()
                },1500)
            }
        });
    },
    submit:function () {
        var $this=this;
        var data = {
            id:this.data.options.id,
            rtype:this.data.rtypeIndex,
            reason:this.data.reasonArr[this.data.reasonIndex],
            content:this.data.content,
            price:this.data.price,
            images:this.data.images
        };
        core.post('order/single_refund/submit', data, function (list) {
         
            if (list.error == 0) {
                // wx.navigateTo({
                //     url: '/pages/order/detail/index?id='+$this.data.order.id,
                // })
                wx.navigateBack();
            } else {
                core.toast(list.message, 'none')
            }
        },true);
    },
    change:function (e) {
        var $this=this,name=core.data(e).name,data={};
        data[name] = e.detail.value;
        this.setData(data);
    },
    upload: function (e) {
        var $this=this,dataset = core.data(e),type = dataset.type,images=$this.data.images,imgs=$this.data.imgs,index=dataset.index;
        if(type=='image'){
            core.upload(function(file){
                images.push(file.filename);
                imgs.push(file.url);
                $this.setData({
                    images:images,
                    imgs:imgs
                })
            });
        }else if(type=='image-remove'){
            images.splice(index,1);
            imgs.splice(index,1);
            $this.setData({
                images:images,
                imgs:imgs
            })
        }else if(type=='image-preview'){
            wx.previewImage({
                current: imgs[index],
                urls: imgs
            })
        }
    },
    toggle: function (e) {
        var data = core.pdata(e),id=data.id;
        (id == 0 || typeof id =='undefined') ? id = 1 : id = 0;
        this.setData({code:id});
    },
    edit:function (e) {
        this.setData({'order.single_refundstate':0});
    },
    refundcancel:function (e) {
        var $this = this;
        core.confirm('您确定要取消申请?',function () {
            core.post('order/single_refund/cancel', {id: $this.data.options.id}, function (data) {
                if (data.error == 0) {
                    // wx.navigateTo({
                    //     url: '/pages/order/detail/index?id='+$this.data.order.id,
                    // })
                    wx.navigateBack();
                }
                core.toast(data.message,'none');
            }, true)
        });
    },
    back:function () {
        wx.navigateBack();
    },
    fefundreceive:function (e) {
        var $this = this;
        core.confirm('确认您已经收到换货物品?',function () {
            core.post('order/single_refund/receive', {id: $this.data.options.id,single_refundid:$this.data.refund.id}, function (data) {
                if (data.error == 0) {
                    // wx.navigateTo({
                    //     url: '/pages/order/detail/index?id='+$this.data.order.id,
                    // })
                    wx.navigateBack();
                }
                core.toast(data.message,'none');
            }, true)
        });
    }

});