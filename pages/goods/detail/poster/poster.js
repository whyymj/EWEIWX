var app = getApp();
var core = app.requirejs('core');
var foxui = app.requirejs('foxui');
Page({
  data: {
  	accredit: '',
  	errMsg: '',
  	Image: 'https://api.clubmall.cn/attachment/images/7/2017/11/r13oT11buG60bn2ntVp1q4pe3B6EGQ.jpeg'
  },
  
  onLoad: function (options) {
  	console.log(options)
  },
	/*图片预览*/
	previewImage: function(){
		wx.previewImage({
		  current: 'https://api.clubmall.cn/attachment/images/7/2017/11/r13oT11buG60bn2ntVp1q4pe3B6EGQ.jpeg', // 当前显示图片的http链接
		  urls: ['https://api.clubmall.cn/attachment/images/7/2017/11/r13oT11buG60bn2ntVp1q4pe3B6EGQ.jpeg'] // 需要预览的图片http链接列表
		})
	},
	/*点击保存图片*/
  savePicture: function(){
  	var $this = this;
  	wx.getSetting({
		  success: function(res){
		  	var accredit = res.authSetting['scope.writePhotosAlbum']
		  	if(accredit){
		  		wx.showLoading({
					  title: '图片下载中...',
					})
		  		setTimeout(function(){
					  wx.hideLoading()
					},1000)
		  		wx.downloadFile({
		  			url: 'https://api.clubmall.cn/attachment/images/7/2017/11/r13oT11buG60bn2ntVp1q4pe3B6EGQ.jpeg',
		  			success: function(res) {
  						wx.saveImageToPhotosAlbum({
				  			filePath: res.tempFilePath,
					    	success(result) {
					    		foxui.toast($this, "保存图片成功");
							  },
					    	fail:function(ret){
					    		$this.setData({errMsg: ret.errMsg})
					    		foxui.toast($this, "保存图片失败");
					    	}
							})
		  			}
		  		})
		  	}else{
		  		wx.authorize({
	          scope: 'scope.writePhotosAlbum',
			  		fail: function(){
              app.getmsg('writePhotosAlbum', '使用保存图片功能');
		  			}
		  		})
		  	}
			}
		})	
  }

})