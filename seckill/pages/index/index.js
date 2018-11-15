var app = getApp();
var core = app.requirejs('/core');
var $ = app.requirejs('jquery');

Page({
    data: {
        audios: {},
        audiosObj:{},

        roomid: '0',
        timeindex: '0',
        taskid: '0',
        timeid: '0',
        timer: 0,

        goods: '',

        rooms: '',
        room_num: 0,

        times: '',
        time_num: 0,

        advs: '',
        adv_num: 0,

        list_error: 0,
        goods_error: 0,
        message: '',

        lasttime: 0,
        hour: '-',
        min: '-',
        sec: '-',
        diypages: '',
        seckill_style:'',
        seckill_color:'',
        color:{
            'red':'#ff5555',
            'blue':'#4e87ee',
            'purple':'#a839fa',
            'orange':'#ff8c1e',
            'pink':'#ff7e95'
        },
      swiperheight:''
    },
    onLoad: function () {
        var $this = this;
        wx.getSystemInfo({
          success: function (res) {
            var model = res.model;
            var iponeX = model.indexOf("iPhone X")
            if (iponeX == '0') {
              $this.setData({
                height:'168rpx'
              })
            } else {
            }
            var swiperheight = res.windowWidth / 1.7
            console.log(swiperheight);
            $this.setData({
              swiperheight: swiperheight
            })
          }
        }) 
        core.get('seckill/get_list', {}, function (ret) {
            if (ret.error == 1) {
                $this.setData({
                    list_error: 1,
                    message: ret.message
                })
            } else {
              if (ret.diypages.items!= undefined){
                    $.each(ret.diypages.items, function (id, item) {
                        var data = {};
                        if (item.id == 'seckill_advs') {
                            data.adv_num=item.data.length;
                        }
                        data.diypages = ret.diypages;
                        $this.setData(data);
                    });
                }
              console.log(ret)
                $this.setData({
                    rooms: ret.rooms,
                    room_num: ret.rooms.length,
                    times: ret.times,
                    time_num: ret.times.length,
                    timeindex: ret.timeindex,
                    roomid: ret.roomid,
                    taskid: ret.taskid,
                    timeid: ret.timeid,
                    // advs: ret.advs,
                    // adv_num: ret.advs.length,
                    seckill_style:ret.seckill_style,
                    seckill_color:ret.seckill_color,
                    background_color: ret.diypages.background_color,
                });
                if (ret.seckill_style == 'style2') {
                  wx.setNavigationBarColor({
                    frontColor: ret.diypages.titlebarcolor,
                    backgroundColor: $this.data.color[ret.seckill_color]
                  })
                  wx.setNavigationBarTitle({
                    title: ret.diypages.page_title
                  })
                }else{
                  wx.setNavigationBarColor({
                    frontColor: '#000000',
                    backgroundColor: '#ffffff'
                  })
                }
                $this.getGoods(ret.timeid);
            }
        });

    },
    selected: function (e) {
        var $this = this;
        $this.setData({roomid: e.currentTarget.dataset.id});
        var roomid = e.currentTarget.dataset.id;
        core.get('seckill/get_list', {roomid: roomid}, function (ret) {

            if (ret.error == 1) {
                $this.setData({
                    list_error: 1,
                    message: ret.message
                })
            } else {
                $this.setData({
                    rooms: ret.rooms,
                    times: ret.times,
                    time_num: ret.times.length,
                    timeindex: ret.timeindex
                });
            }
            $this.getGoods(ret.timeid);
        });

    },
    current: function (e) {
        var $this = this;
        $this.getGoods(e.currentTarget.dataset.timeid);
        $this.setData({timeindex: e.currentTarget.dataset.index});
    },


    getGoods: function (timeid) {
        var $this = this;
        core.get('seckill/get_goods', {
            taskid: $this.data.taskid,
            roomid: $this.data.roomid,
            timeid: timeid
        }, function (ret) {

            if (ret.error == 1) {
                $this.setData({
                    goods_error: 1,
                    message: ret.message
                })
            } else {

                $this.setData({
                    goods_error: 0,
                    goods: ret.goods
                });
                $this.initTimer(timeid);
            }


        })
    },


    initTimer: function (timeid) {
        var $this = this;

        var slide = '';
        $.each($this.data.times, function (i, item) {
            if (item.id === timeid) {
                slide = item;
            }
        });

        var status = parseInt(slide.status);
        var starttime = slide.starttime;
        var endtime = slide.endtime;

        clearInterval($this.data.timer);

        if (status != -1) {

            var lasttime = 0;
            var timer = 0;

            var approot=app.globalData.approot;
            wx.request({url:approot+'map.json',
                success: function(x) {
                    var currenttime = new Date(x.header.Date) / 1000;
                    if (status == 0) {
                        lasttime = endtime - currenttime;
                    } else {
                        lasttime = starttime - currenttime;
                    }

                    $this.setData({lasttime: lasttime});

                    $this.setTimer(slide);
                    timer = $this.setTimerInterval(slide);

                    $this.setData({timer: timer});
                }
            })
        }
    },
    /*timer.js文件方法*/
    formatSeconds: function (value) {
        var theTime = parseInt(value);
        var theTime1 = 0;
        var theTime2 = 0;
        if (theTime > 60) {
            theTime1 = parseInt(theTime / 60);
            theTime = parseInt(theTime % 60);
            if (theTime1 > 60) {
                theTime2 = parseInt(theTime1 / 60);
                theTime1 = parseInt(theTime1 % 60)
            }
        }
        return {
            'hour': theTime2 < 10 ? '0' + theTime2 : theTime2,
            'min': theTime1 < 10 ? '0' + theTime1 : theTime1,
            'sec': theTime < 10 ? '0' + theTime : theTime
        }
    },
    setTimer: function (seckillinfo) {
        var $this = this;
        var lasttime=0;
        //每十秒请求一次服务器，获取时间
        if (seckillinfo.status != -1) {
            if(parseInt($this.data.lasttime)%10==0){
                var approot=app.globalData.approot;
                wx.request({url:approot+'map.json',
                    success: function(x) {
                        var currenttime = new Date(x.header.Date) / 1000;
                        if (seckillinfo.status == 0) {
                            lasttime = seckillinfo.endtime - currenttime;
                        } else {
                            lasttime = seckillinfo.starttime - currenttime;
                        }
                        $this.setData({lasttime: lasttime});
                    }
                })
            }
        }

        lasttime = parseInt($this.data.lasttime) - 1;
        var times = $this.formatSeconds(lasttime);
        $this.setData({lasttime: lasttime, hour: times.hour, min: times.min, sec: times.sec});
        if (lasttime <= 0) {
            $this.onLoad();
        }
    },
    setTimerInterval: function (seckillinfo) {
        var $this = this;
        return setInterval(function () {
            $this.setTimer(seckillinfo);
        }, 1000);
    },

    play: function (e) {
        var item_id = e.target.dataset.id;
        var innerAudioContext = this.data.audiosObj[item_id] || false;
        if (!innerAudioContext) {
            innerAudioContext = wx.createInnerAudioContext('audio_' + item_id);
            var audiosObj = this.data.audiosObj;
            audiosObj[item_id] = innerAudioContext;
            this.setData({
                audiosObj: audiosObj
            })
        }
        var $this = this;
        innerAudioContext.onPlay(() => {
            var Time = setInterval(function () {
                var width = innerAudioContext.currentTime / innerAudioContext.duration * 100 + '%';
                var minute = Math.floor(Math.ceil(innerAudioContext.currentTime) / 60);  //分
                var second = (Math.ceil(innerAudioContext.currentTime) % 60 / 100).toFixed(2).slice(-2); //秒
                var seconds = Math.ceil(innerAudioContext.currentTime)
                var audioicon = ''
                if (minute < 10) {
                    minute = "0" + minute;
                }
                var time = minute + ":" + second;
                var audios = $this.data.audios;
                audios[item_id].audiowidth = width;
                audios[item_id].Time = Time;
                audios[item_id].audiotime = time;
                audios[item_id].seconds = seconds;
                $this.setData({ audios: audios })
            }, 1000)
        })

        var src = e.currentTarget.dataset.audio;
        var time = e.currentTarget.dataset.time;
        var pausestop = e.currentTarget.dataset.pausestop;
        var loopplay = e.currentTarget.dataset.loopplay;
        if (loopplay == 0) {
            innerAudioContext.onEnded((res) => {
                audios[item_id].status = false;
            $this.setData({ audios: audios })
        })
        }
        var audios = $this.data.audios;

        if (!audios[item_id]) {
            audios[item_id] = {};
        }
        if (innerAudioContext.paused && time == 0) {
            innerAudioContext.src = src;
            innerAudioContext.play();
            if (loopplay == 1) {
                innerAudioContext.loop = true;
            }
            audios[item_id].status = true;
            $this.pauseOther(item_id)

        } else if (innerAudioContext.paused && time > 0) {
            innerAudioContext.play();
            if (pausestop == 0) {
                innerAudioContext.seek(time);
            } else {
                innerAudioContext.seek(0);
            }
            audios[item_id].status = true;
            $this.pauseOther(item_id)
        }
        else {
            innerAudioContext.pause();
            audios[item_id].status = false;
        }
        $this.setData({ audios: audios })
    },
    pauseOther: function (item_id) {
        var $this = this;
        $.each(this.data.audiosObj, function (id, obj) {
            if (id == item_id) {
                return;
            }
            obj.pause();
            var audios = $this.data.audios;
            if (audios[id]) {
                audios[id].status = false;
                $this.setData({ audios: audios });
            }
        });
    },
    navigate: function (e) {
        var url = e.currentTarget.dataset.url
        var phone = e.currentTarget.dataset.phone
        var appid = e.currentTarget.dataset.appid
        var appurl = e.currentTarget.dataset.appurl
        if (url) {
            wx.navigateTo({
                url: url,
                fail:function(){
                    wx.switchTab({
                        url: url
                    })
                }
            })
        }
        if (phone) {
            wx.makePhoneCall({
                phoneNumber: phone
            })
        }
        if (appid) {
            wx.navigateToMiniProgram({
                appId: appid,
                path: appurl
            })
        }
    },
    // 选项卡切换
    tabwidget: function (e) {
        var $this = this,
            diypages = $this.data.diypages,
            list = diypages.items,
            id = e.currentTarget.dataset.id,
            dataurl = e.currentTarget.dataset.url,
            type = e.currentTarget.dataset.type;

        if (dataurl == '' || dataurl == undefined) {
            return;
        }

        core.get('diypage/getInfo', { dataurl: dataurl }, function (ret) {

            for (var i in diypages.items){
                if(i == id){
                    diypages.items[i].data[type].data = ret.goods.list;
                    diypages.items[i].data[type].type = ret.type;
                    diypages.items[i].type = ret.type;
                    diypages.items[i].status = type;
                    if (ret.goods.list.length <= 8) {
                        diypages.items[i].data[type].showmore = true;
                    }
                    console.log(diypages.items[i])
                    $this.setData({ diypages: diypages})
                }
            }
            // $this.setData({ tabbarData: ret.goods, tabbarDataType:ret.type})
        });
    },
})