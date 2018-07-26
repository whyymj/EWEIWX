/**
 *
 * favorite\index.js
 *
 * @create 2017-02-10
 * @author 咖啡
 *
 * 
 *
 */

var app = getApp();
var core = app.requirejs('core');
var $ = app.requirejs('jquery');
Page({
    data:{
        region:[],        
    },
    onLoad:function(options){
        var $this = this;
        var region = options.region;
        var onlysent = options.onlysent;
        $this.setData({ region: region, onlysent: onlysent});
    }
})