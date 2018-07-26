/*
 * 
 * *
 * @create 2017-1-12
 * @author AHa
 * 
 * 
 */
var app = getApp(),core=app.requirejs('core')
Page({
  data: {
      lng: 0,
      lat: 0,
      scale:13,
      name:'未填写',
      address:'地址：未填写',
      tel1:'',
      tel2: '',
      logo:'/static/images/noface.png',
    markers: [{
      iconPath: "/static/images/location.png",
      id: 0,
      longitude: 0,
      latitude: 0,
      width: 30,
      height: 30,
      label: {
        content:'未填写',
      	color: '#666666',
      	fontSize: 12,
      	borderRadius: 10,
      	bgColor: '#ffffff',
      	padding: 5,
        display: 'ALWAYS',
        textAlign:'center',
        x:-20,
        y:-60,
      	
      }
    }],
    circles: [{
        longitude: 0,
        latitude: 0,
    	  color: '#4e73f1DD',
        fillColor: '#4e73f1AA',
        radius: 15,
        strokeWidth: 1
    }]
  },
  get_list: function () {
        
    },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
  },
	onLoad: function(options){
		var $this = this;

        core.get('shop.cityexpress.map',{},function (res) {
          console.log(res.cityexpress.lng);
            $this.setData({
              lng:res.cityexpress.lng,
              lat:res.cityexpress.lat,
              scale: res.cityexpress.zoom,
              name: res.cityexpress.name,
              address:res.cityexpress.address,
              tel1: res.cityexpress.tel1,
              tel2: res.cityexpress.tel2,
              logo:res.cityexpress.logo,
              'markers[0].longitude':res.cityexpress.lng,
              'markers[0].latitude':res.cityexpress.lat,
              'markers[0].label.content':res.cityexpress.name,
              'circles[0].longitude': res.cityexpress.lng,
              'circles[0].latitude': res.cityexpress.lat,
              'circles[0].radius': parseInt(res.cityexpress.range),
            })
        });

	},
	
		//打开电话列表
		call: function() {
			var $this = this;
      if ($this.data.tel1=='' || $this.data.tel2==''){
        if ($this.data.tel1!=''){
          wx.makePhoneCall({
            phoneNumber: $this.data.tel1
          })
        }
        if ($this.data.tel2!='') {
          wx.makePhoneCall({
            phoneNumber: $this.data.tel2
          })
        }
      }else{
        $this.setData({
          listout: 'out',
          listin: 'in'
        })
      }
		},

		//关闭电话列表
		calldown: function() {
			var $this = this;
			$this.setData({
				listout: '',
				listin: ''
			})
		},

		//拨打电话
		callup: function(e) {
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.tel
    })
  }
})