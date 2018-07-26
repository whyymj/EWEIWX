var app = getApp();
var core = app.requirejs('core');
module.exports.number = function(page,e){
    var number = e.currentTarget.dataset;
    var value =     number.value;

    var min = number.hasOwnProperty('min') ? parseInt(number.min) : 1,
        max = number.hasOwnProperty('max') ? parseInt(number.max) : 999;
    if(e.target.dataset.action==='minus'){
      if (value > 1 && (value > min || min == 0)) {
        value--;
      } else {
          if(min==0){
              min=1;
          }
        this.toast(page, '最少购买' + min + '件')
      }
    } else if(e.target.dataset.action==='plus'){
        if(value<max||max==0){
            value++;
        }else {
          this.toast(page, '最多购买' + max+'件')
        }
    }
    return value;
};

/**
 * 显示底部 toast 必须将view 放于page底部  固定变量名为为 FoxUIToast { show: 是否显示 text 显示的文字}
 * <view class="fui-toast {{FoxUIToast.show?'in':'out'}}"><view class="text">{{FoxUIToast.text}}</view></view>
 *  Page事件：
 *   core.requirejs('foxui').toast(this,text);
 *  text 为显示的的提示
 *
 */
module.exports.toast = function(page, text,duration){
    if(!duration){
        duration = 1500;
    }
    page.setData({
        FoxUIToast: {show:true,text:text}
    });
    var self = this;
    setTimeout(function(){
        page.setData({
            FoxUIToast: {show:false}
        });
    },duration);
};

/**
 * 显示顶部 notify 必须将view 放于page底部  固定变量名为为 FoxUINotify { show: 是否显示 text 显示的文字 type 样式}
 * <view class="fui-notify fui-notify-{{FoxUINotify.style}} {{FoxUIToast.show?'in':'out'}}"><view class="text">{{FoxUIToast.text}}</view></view>
 *  Page事件：
 *   core.requirejs('foxui').notify(this,text,type);
 *   text 为显示的的提示
 *   style 样式 默认 default 其他 primary success danger warning
 *
 */
module.exports.notify = function(page, text,style, duration){
    if(!duration){
        duration = 1500;
    }
    if(!style){
        style = 'default';
    }
    page.setData({
        FoxUINotify: {show:true,text:text,style:style}
    });
    var self = this;
    setTimeout(function(){
        page.setData({
            FoxUINotify: {show:false}
        });
    },duration);
};