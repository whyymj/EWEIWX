Page({

  
  data: {
    paperplane: false
  },

  onLoad: function (options) {
  
  },

  transmit: function(){
    this.setData({paperplane: true})
  },

  hidepaperplane: function(){
    this.setData({ paperplane: false })
  }
})