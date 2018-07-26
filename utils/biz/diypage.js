var app = getApp(), $ = app.requirejs('jquery'), core = app.requirejs('core'), foxui = app.requirejs('foxui');
module.exports = {  
  get:function($this, type, callback){
    var self = this;
    core.get('diypage', {type: type}, function (result) {
     
      result.diypage = result.diypage || {};
      for (var i in result.diypage.items){
        if (result.diypage.items[i].id == 'topmenu'){
          $this.setData({ topmenu: result.diypage.items[i]})
        } 
      }
      $this.setData({
        customer: result.customer,
        phone: result.phone,
        phonecolor: result.phonecolor,
        phonenumber: result.phonenumber,
        customercolor: result.customercolor
      })
      // var data = {loading: false,diypages: result.diypage, pages: result.diypage.page, usediypage: true,startadv: result.startadv};
      var data = { loading: false, pages: result.diypage.page, usediypage: true, startadv: result.startadv }
  
      if (result.diypage.page){
        $this.setData({
          diytitle: result.diypage.page.title,
        });
      }
      if (result.error!=0){
        $this.setData({
          diypages:false,
          loading: false
        });
        return;
      }

      if (result.diypage.items != undefined) {
        var arr = [];
        $.each(result.diypage.items, function (id, item) {
          arr.push(item.id);
          if (item.id == 'topmenu') {
            if (item.style.showtype == 2){
              var l = Math.ceil(item.data.length / 4);
              var topmenuheight = 78 * l;
              $this.setData({ topmenuheight: topmenuheight });
            }else{
              var topmenuheight = 78 ;
              $this.setData({ topmenuheight: topmenuheight });
            }
            $this.setData({ topmenu: item, istopmenu: true});
            if (item.data[0] == undefined){
              var linkurl = '';
            }else{
              var linkurl = item.data[0].linkurl;
              core.get('diypage/getInfo', { dataurl: linkurl }, function (ret) {
                item.data[0].data = ret.goods.list;
                data.diypages = result.diypage;
                data.topmenuDataType = ret.type;
                $this.setData(data);
              });
            }
            
          
          } else if (item.id == 'tabbar') {
            if (item.data[0] == undefined) {
              var linkurl = '';
            } else {
              var linkurl = item.data[0].linkurl;
              core.get('diypage/getInfo', { dataurl: linkurl }, function (ret) {
                item.data[0].data = ret.goods.list
                item.type = ret.type;
                // var diypages = item;
                data.diypages = result.diypage;
                data.tabbarDataType = ret.type;
                data.tabbarData = ret.goods;
                $this.setData(data);

              });
            }
         
          }
        });
   
        wx.setNavigationBarTitle({
          title: data.pages.title
        });
        wx.setNavigationBarColor({
          frontColor: data.pages.titlebarcolor,
          backgroundColor: data.pages.titlebarbg
        });
  
        if (callback) {
          callback(result);
        }
        if(arr.indexOf('topmenu') != -1 || arr.indexOf('tabbar') != -1){
          return
        }
        data.diypages = result.diypage;
        $this.setData(data);
      }
      wx.setNavigationBarTitle({
        title:data.pages.title
      });
      wx.setNavigationBarColor({
        frontColor: data.pages.titlebarcolor,
        backgroundColor: data.pages.titlebarbg
      });
      if (callback){
        callback(result);
      }
    });
  }
 
}