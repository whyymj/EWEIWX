//index.js
//获取应用实例
const app = getApp()
var core = app.requirejs('core');
Page({
  data: {
    userInfo: {},
    replace1: '商品',
    replace2:'2',
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    now: true,
    //转盘
    angle: 45, //每个奖项所占用的角度
    halfAngle: 27.5, //半角
    radian: 0, //最终旋转弧度
    rotateAngle: 0, //旋转角度
    offOn: true, // 权限
    index: 0, //中奖下标  顺时针
    circle: 1800,
    huojiangbj: '0',
    time: '4',
    //九宫格
    sudokuIndex: -1,  //当前转动到哪个位置，起点位置
    count: 8,  //总共有多少个位置
    timer: 0,  //setTimeout的ID，用clearTimeout清除
    speed: 20,  //初始转动速度
    times: 0,  //转动次数
    cycle: 50,  //转动基本次数：即至少需要转动多少次再进入 环节
    prizeIndex: -1,  //中奖位置,
    click: false, // click控制一次 过程中不能重复点击 按钮，后面的点击不响应
    sudokuShow: false,
    prize_show: false,
    prize_details: false,
    prize_details2: false,
    award_rule: false,
    winner: [],
    cdkey: false,
    my_prize: [],
    smscodetext: '发送验证码',
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {

    var $this = this;
    console.log(2);
    wx.request({
      url: 'https://u.we7shop.com/api/activity/activity-text?activity_id=1',
      data: {},
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data.status, res.data.result.cjiang);
        if (res.data.status==1){
          $this.setData({
            replace1: res.data.result.cjiang,
            replace2: '奖'
          })
          wx.setNavigationBarTitle({
            title: '人人商城三周年' + res.data.result.cjiang
          });
        }
      }
    });
    
    if (new Date().getMonth() == 5) {
      console.log(new Date().getMonth(), new Date().getDate(), new Date().getHours());
      if (5 <= new Date().getDate() && new Date().getDate() <= 7 && new Date().getHours() >= 10) {
        this.setData({
          now: true,
          activity_id: 2
        })
      } else if ((new Date().getDate() == 11 || new Date().getDate() == 13 || new Date().getDate() == 15) && new Date().getHours() >= 10) {
        this.setData({
          now: false,
          activity_id: 1
        })
      } else if (new Date().getDate() > 7) {
        this.setData({
          now: false,
          nobegun: true,
          activity_id: 1
        })
      } else {
        this.setData({
          now: true,
          nobegun: true,
          activity_id: 2
        })
      }
    }
    var $this = this;
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    this.getLotteryRecord();
    this.getLotteryTickets();
    $this.getMyRecord();
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  //所有中奖记录
  getLotteryRecord: function (e) {
    var $this = this;
    wx.request({
      url: 'https://u.we7shop.com/api/activity/lottery-record',
      data: { activity_id: $this.data.activity_id },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.status == 1) {
          $this.setData({
            winner: res.data.result,
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: res.data.result.message,
            duration: 2000
          })
        }
      }
    })
  },

  //我的中奖记录
  getMyRecord: function (e) {
    var $this = this;
    wx.getStorage({
      key: 'session_id',
      success: function (res) {
        wx.request({
          url: 'https://u.we7shop.com/api/activity/my-lottery-record?activity_id=' + $this.data.activity_id,
          data: { session_id: res.data },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          method: "POST",
          success: function (res) {
            if (res.data.status == 1) {
              $this.setData({
                my_prize: res.data.result
              })
            } else if (res.data.status == -10) {
              $this.setData({
                login: true,
                mask: true
              })
            } else {
              wx.showToast({
                icon: 'none',
                title: res.data.result.message,
                duration: 2000
              })
            }
          }
        })
      },
      fail: function (res) {
        $this.setData({
          login: true,
          mask: true
        })
      }
    })

  },
  //获取个人剩余 次数
  getLotteryTickets: function (e) {
    var $this = this;
    wx.getStorage({
      key: 'session_id',
      success: function (res) {
        wx.request({
          url: 'https://u.we7shop.com/api/activity/get-lottery-tickets?activity_id=' + $this.data.activity_id,
          data: { session_id: res.data },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          method: "POST",
          success: function (res) {
            if (res.data.status == 1) {
              $this.setData({
                tickets: res.data.result.tickets
              })
            } else if (res.data.status == -10) {
              $this.setData({
                login: true,
                mask: true
              })
            } else {
              wx.showToast({
                icon: 'none',
                title: res.data.result.message,
                duration: 2000
              })
            }
          }
        })
      },
      fail: function (res) {
        $this.setData({
          login: true,
          mask: true
        })
      }
    })

  },
  // 
  lottery: function (e) {
    var $this = this;
    wx.getStorage({
      key: 'session_id',
      success: function (res) {
        wx.request({
          url: 'https://u.we7shop.com/api/activity/lottery?activity_id=' + $this.data.activity_id,
          data: { session_id: res.data },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          method: "POST",
          success: function (res) {
            if (res.data.status == 1) {
              $this.setData({
                lottery: res.data.result,
                tickets: $this.data.tickets - 1,
                success: true
              })
              $this.getMyRecord();
              if (e == 'sudoku') {
                var click = $this.data.click;
                if (click) {//click控制一次 过程中不能重复点击 按钮，后面的点击不响应
                  return false;
                } else {
                  $this.setData({
                    speed: 100
                  })
                  $this.roll();  //转圈过程不响应click事件，会将click置为false
                  $this.setData({
                    click: true
                  })
                  return false;
                }
              } else {
                var rotateAngle = 0; //旋转角度
                var offOn = $this.data.offOn; // 权限
                if (offOn) {
                  $this.setData({
                    time: '0',
                    rotateAngle: rotateAngle
                  })
                  offOn = !offOn;
                  $this.ratating();
                } else {
                }
              }
            } else if (res.data.status == -10) {
              $this.setData({
                login: true,
                mask: true,
                success: false
              })

            } else {
              wx.showToast({
                icon: 'none',
                title: res.data.result.message,
                duration: 2000
              })
              $this.setData({
                success: false
              })
            }
          }
        })
      },
      fail: function (res) {
        $this.setData({
          login: true,
          mask: true,
          success: false
        })
      }
    })
  },
  //数据绑定
  logintel: function (e) {
    this.setData({
      logintel: e.detail.value
    })
  },
  loginpass: function (e) {
    this.setData({
      loginpass: e.detail.value
    })
  },
  registertel: function (e) {
    this.setData({
      registertel: e.detail.value
    })
  },
  registerpass: function (e) {
    this.setData({
      registerpass: e.detail.value
    })
  },
  confirmPassword: function (e) {
    this.setData({
      confirmPassword: e.detail.value
    })
  },
  registersmscode: function (e) {
    this.setData({
      registersmscode: e.detail.value
    })
  },
  closelogin: function (e) {
    this.setData({
      register: false,
      login: false,
      mask: false
    })
  },
  goregister: function (e) {
    this.setData({
      register: true,
      login: false
    })
  },
  gologin: function (e) {
    this.setData({
      login: true,
      register: false
    })
  },
  //登录
  login: function (e) {

    var $this = this;
    var obj = {};
    obj.mobile = this.data.logintel;
    obj.password = this.data.loginpass;
    wx.login({
      success: function (ret) {
        obj.code = ret.code;
        wx.request({
          url: 'https://u.we7shop.com/api/user/login',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: obj,
          method: 'POST',
          success: function (res) {
            if (res.data.status == 1) {
              $this.setData({
                isnew: res.data.result.isnew,
                uid: res.data.result.uid,
                session_id: res.data.result.session_id,
                login: false,
                mask: false
              })
              wx.showToast({
                title: '登录成功 ',
                duration: 2000
              })
              wx.setStorage({
                key: 'session_id',
                data: res.data.result.session_id,
              })
              $this.getLotteryTickets();
              $this.getMyRecord();
            } else {
              wx.showToast({
                icon: 'none',
                title: res.data.result.message,
                duration: 2000
              })
            }
          }
        })
      }
    })
  },
  //发送验证码
  sendsmscode: function () {
    var i = 60, $this = this;
    if ($this.data.smscodetext == '发送验证码') {
      var obj = {};
      obj.mobile = this.data.registertel;
      obj.type = 'register';
      wx.request({
        url: 'https://u.we7shop.com/api/user/getsmscode',
        data: obj,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          if (res.data.status == 1) {
            wx.showToast({
              title: '发送成功',
              duration: 2000
            })
            var time = setInterval(function () {
              $this.setData({
                smscodetext: i + 's'
              });
              if (i == 0) {
                clearInterval(time);
                $this.setData({
                  smscodetext: '发送验证码'
                });
                return;
              }
              i--;
            }, 1000)
          } else {
            wx.showToast({
              icon: 'none',
              title: res.data.result.message,
              duration: 2000
            })
          }
        }
      })
    }
  },
  //注册
  register: function (e) {
    var obj = {};
    obj.mobile = this.data.registertel;
    obj.password = this.data.registerpass;
    obj.confirm_password = this.data.confirmPassword;
    obj.smscode = this.data.registersmscode;
    wx.login({
      success: function (ret) {
        obj.code = ret.code;
        wx.request({
          url: 'https://u.we7shop.com/api/user/register',
          data: obj,
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            if (res.data.status == 1) {
              wx.showToast({
                title: '注册成功',
                duration: 2000
              })
              $this.setData({
                login: true
              });
            } else {
              wx.showToast({
                icon: 'none',
                title: res.data.result.message,
                duration: 2000
              })
            }
          }
        })
      }
    })
  },


  dial: function (e) {
    this.lottery('dial');
  },
  ratating: function (e) {
    var $this = this;
    var angle = $this.data.angle; //每个奖项所占用的角度
    var rotateAngle = $this.data.rotateAngle; //旋转角度
    var offOn = $this.data.offOn; // 权限
    var halfAngle = $this.data.halfAngle; //半角
    var radian = $this.data.radian; //最终旋转弧度
    var index = $this.data.index; //中奖下标  顺时针
    var circle = $this.data.circle;
    var timer = null;
    var s = this.pri2();               //0~7
    var prize = '';
    var awards = '';
    var cdkey = '';
    //circle -= 3600; //每次 都多转10圈
    index = s; 		//获奖下标
    clearInterval(timer);
    timer = setInterval(function () {
      rotateAngle = circle - (index * angle); //10圈 + 
      $this.setData({
        time: '4',
        rotateAngle: rotateAngle
      })
      console.log($this.data.rotateAngle);
      clearInterval(timer);
      setTimeout(function () {
        offOn = !offOn;
        // radian = 360 - (rotateAngle - halfAngle) % 360; //除了多转的那些圈  剩下实际旋转角度
        // if (radian <= angle * 1) {
        //   prize = '获得三等奖';
        //   awards = '服务器托管初级版本立减400元优惠券';
        //   cdkey = '12324e57698-=909087'
        // } else if (radian <= angle * 2) {
        //   prize = '获得四等奖';
        //   awards = '服务器数据迁移5折优惠券';
        //   cdkey = '12324e57698-=909087'
        // } else if (radian <= angle * 3) {
        //   prize = '获得二等奖';
        //   awards = '服务器托管中级版本立减600元优惠券';
        //   cdkey = '12324e57698-=909087'
        // } else if (radian <= angle * 4) {
        //   prize = '获得五等奖';
        //   awards = '数据库读写分离5折优惠券';
        //   cdkey = '12324e57698-=909087'
        // } else if (radian <= angle * 5) {
        //   prize = '获得一等奖';
        //   awards = '服务器托管高级版本立减800元优惠券';
        //   cdkey = '12324e57698-=909087'
        // } else if (radian <= angle * 6) {
        //   prize = '获得五等奖';
        //   awards = '数据库读写分离5折优惠券';
        //   cdkey = '12324e57698-=909087'
        // } else if (radian <= angle * 7) {
        //   prize = '获得七等奖';
        //   awards = '价值100元添加小程序域名白名单';
        //   cdkey = '12324e57698-=909087'
        // } else if (radian <= angle * 8) {
        //   prize = '获得六等奖';
        //   awards = '600元组合券';
        //   cdkey = '12324e57698-=909087'
        // }
        $this.setData({
          sudokuShow: true,
        })
      }, 4000);
    }, 30);
  },
  pri2: function () {
    var index = '', e = this.data.lottery.prize_level;
    switch (e) {
      case '三等奖':
        index = 0;
        break;
      case '四等奖':
        index = 1;
        break;
      case '二等奖':
        index = 2;
        break;
      case '五等奖':
        index = 3;
        break;
      case '一等奖':
        index = 4;
        break;
      case '五等奖':
        index = 5;
        break;
      case '七等奖':
        index = 6;
        break;
      case '六等奖':
        index = 7;
        break;
    }
    return index
  },
  closehuojiang: function (e) {
    this.setData({ huojiangbj: '0' })
  },
  sudoku: function (e) {
    this.lottery('sudoku');
  },
  rollInit: function () {
    var sudokuIndex = this.data.sudokuIndex;
    var count = this.data.count;
    sudokuIndex += 1;
    if (sudokuIndex > count - 1) {
      sudokuIndex = 0;
    };
    this.setData({
      sudokuIndex: sudokuIndex
    })
    return false;
  },
  roll: function (e) {
    var $this = this;
    var times = this.data.times + 1;
    var cycle = this.data.cycle;
    var prizeIndex = this.data.prizeIndex;
    var sudokuIndex = this.data.sudokuIndex;
    var timer = this.data.timer;
    var speed = this.data.speed;
    var count = this.data.count;
    $this.setData({
      times: times
    })
    if (times > cycle + 10 && prizeIndex == sudokuIndex) {
      clearTimeout(timer);
      $this.setData({
        prizeIndex: -1,
        times: 0,
        click: false,
      })

      // 结果$this.pri($this.data.sudokuIndex);
      setTimeout(function () {
        $this.setData({
          sudokuShow: true
        })
      }, 1000);
    } else {
      $this.rollInit();//转动过程调用的是lottery的roll方法，这里是第一次调用初始化

      if (times < cycle) {
        $this.setData({
          speed: speed - 10
        })
      } else if (times == cycle) {
        // var index = Math.ceil(Math.random() * 8) - 1;                      //0  200元 ~7 1000元
        // index = index | 0
        // index = 0;                               //停留位置
        var index = $this.pri();
      } else {
        if (times > cycle + 10 && ((prizeIndex == 0 && index == 7) || prizeIndex == index + 1)) {
          $this.setData({
            speed: speed + 110
          })
        } else {
          $this.setData({
            speed: speed + 20
          })
        }
      }
      if (speed < 40) {
        $this.setData({
          speed: 40
        })
      };
      var t = setTimeout($this.roll, $this.data.speed)//循环调用
      $this.setData({
        timer: t
      })
    }
    return false;
  },
  pri: function () {
    var index = '', e = this.data.lottery.prize_level;
    switch (e) {
      case '八等奖':
        index = 0;
        break;
      case '二等奖':
        index = 1;
        break;
      case '五等奖':
        index = 2;
        break;
      case '三等奖':
        index = 3;
        break;
      case '一等奖':
        index = 4;
        break;
      case '四等奖':
        index = 5;
        break;
      case '七等奖':
        index = 6;
        break;
      case '六等奖':
        index = 7;
        break;
    }
    this.setData({
      prizeIndex: index
    })
    return index
  },
  sudokuClose: function () {
    this.setData({
      sudokuShow: false,
      prize_show: false,
      prize_details: false,
      prize_details2: false,
      award_rule: false
    })
  },
  myAward: function () {
    var $this = this;
    wx.getStorage({
      key: 'session_id',
      success: function (res) {
        wx.request({
          url: 'https://u.we7shop.com/api/user/check-login',
          data: { session_id: res.data },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res.data);
            if (res.data==0) {
              $this.setData({
                login: true,
                mask: true
              })
            } else {
              $this.setData({
                prize_show: true
              })
            }
          }
        })
      }
    })
  },
  awardRule: function () {
    this.setData({
      award_rule: true
    })
  },
  awardDetails: function () {
    this.setData({
      prize_details: true
    })
  },
  awardDetails2: function () {
    this.setData({
      prize_details2: true
    })
  },
  copyCdkey: function (e) {
    var $this = this;
    var key = e.target.dataset.key;
    wx.setClipboardData({
      data: key,
      success: function (res) {
        // self.setData({copyTip:true}),  
        wx.showToast({
          title: '复制成功',
          icon: 'succes',
          duration: 1000,
          mask: true
        })
      }
    });
  },
  change: function () {
    this.setData({
      now: !this.data.now
    })
  },
})
