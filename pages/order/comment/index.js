/**
 *
 * order/common/index.js
 *
 * @create 2017-1-16
 * @author Young
 *
 * @update  Young 2017-01-16
 *
 */
var app = getApp(),
core=app.requirejs('core');
Page({
    data: {
      stars_class: ['text-default', 'text-primary', 'text-success', 'text-warning', 'text-danger'],
        stars_text: ['差评', '一般', '挺好', '满意', '非常满意'],
        normalSrc: 'icox icox-star',
        selectedSrc: 'icox icox-xing selected',
        key: -1,
        content: '',
        images:[],
        imgs:[]
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({
            options: options
        });
        app.url(options);
        this.get_list();
    },
    get_list: function () {
        var $this = this;
        core.get('order/comment', $this.data.options, function (list) {
            if (list.error == 0) {
                list.show = true;
                $this.setData(list);
            } else {
                core.toast(list.message, 'loading');
                wx.navigateBack();
            }
        }, true);
    },
    select: function (e) {
        var key = e.currentTarget.dataset.key;
        this.setData({
            key: key
        });
    },
    change:function (e) {
        var name=core.data(e).name,data={};
        data[name] = e.detail.value;
        this.setData(data);
    },
    submit:function () {
        var $this = this,data = {
            orderid:this.data.options.id,
            comments:[]
        };
        if (this.data.content == '' || this.data.key==-1){
            core.alert('有未填写项目!')
            return false;
        }
        for(var i=0,len=this.data.goods.length;i<len;i++){
            var g = {
                goodsid:this.data.goods[i].goodsid,
                level:this.data.key+1,
                content:this.data.content,
                images:this.data.images
            };
            data.comments.push(g);
        }
        core.post('order/comment/submit', data, function (list) {
            if (list.error != 0) {
                core.toast(list.message, 'loading')
            }
            wx.navigateBack()
        },true);
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
    }
});
