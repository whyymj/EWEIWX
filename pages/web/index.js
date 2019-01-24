/*
 * 
 * @create 2017-11-10
 * @author Ma 
 * 
 */
Page({
  data: {
  	url: ''
  },
  onLoad: function (options) {
    if (options.module == 'sign'){
      var url = options.domain + '?' + decodeURIComponent(options.params) + '&uid=' + options.mid;
    }else{
      var url = decodeURIComponent(options.url);
    }
  
   	var $this = this;
    $this.setData({
      url: url
    })
  }
})