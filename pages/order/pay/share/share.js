var app = getApp();
Page({

  
  data: {
    paperplane: false
  },

  onLoad: function (options) {
    this.setData({ imgUrl: app.globalData.approot })
  },

  transmit: function(){
    this.setData({paperplane: true})
  },

  hidepaperplane: function(){
    this.setData({ paperplane: false })
  }
})