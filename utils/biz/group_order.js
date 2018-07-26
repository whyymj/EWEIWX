/**
 *
 * order.js
 *
 * @create 2017-1-15
 * @author Young
 *
 * @update  Young 2017-01-15
 *
 */
var app = getApp(), core = app.requirejs('core');
module.exports = {
    url:function (url) {
        wx.redirectTo({
            url: url
        })
    },
    cancelArray: ['我不想买了', '信息填写错误，重新拍', '同城见面交易', '其他原因'],
    order: [
        '确认要取消该订单吗?',
        '确认要删除该订单吗?',
        '确认要彻底删除该订单吗?',
        '确认要恢复该订单吗?',
        '确认已收到货了吗?',
        '确定您要取消申请?'
    ],
    cancel: function (id, index,url) {
        var $this=this,remark = this.cancelArray[index];
        core.post('groups/order/cancel', { id: id, cancel_reason: remark}, function (data) {
            if (data.error == 0) {
                $this.url(url);
            }
        }, true);
    },
    delete: function (id, userdeleted,url,self) {
        var $this=this;
        core.confirm(userdeleted==0?this.order[3]:this.order[userdeleted],function () {
            core.post('order/op/delete', {id: id, userdeleted: userdeleted}, function (data) {
                if (data.error == 0) {
                    if (typeof self != 'undefined'){
                        self.setData({
                            page:1,
                            list:[]
                        });
                        self.get_list()
                    }else{
                        $this.url(url);
                    }
                    return;
                }
                core.toast(data.message,'loading');
            }, true)
        });
    },
    finish: function (id,url) {
        var $this=this;
        core.confirm(this.order[4],function () {
            core.post('order/op/finish', {id: id}, function (data) {
                if (data.error == 0) {
                    $this.url(url);
                    return;
                }
                core.toast(data.message,'loading');
            }, true)
        });
    },
    refundcancel:function (id,callback) {
        var $this=this;
        core.confirm(this.order[5],function () {
            core.post('order/refund/cancel', {id: id}, function (data) {
                if (data.error == 0) {
                    if (typeof callback == 'function'){
                        callback();
                    }else{
                        $this.url(callback);
                    }
                    return;
                }
                core.toast(data.message,'loading');
            }, true)
        });
    },
    codeshow: function (page,e) {
        var orderid=core.data(e).orderid;
        core.post('verify/qrcode',{id:orderid},function (json) {
            if (json.error==0){
                $this.setData({
                    code: true,
                    qrcode: json.url
                })
            }else{
                core.alert(json.message);
            }
        },true);
    },
    codehidden: function (page) {
        page.setData({
            code: false,
        })
    },
};