/**
 * Created by ELINKINT on 2018/3/9.
 */
module.exports = {
    //时间选择器 前后月份选择
    doDay: function (e,$this) {
        var currentObj = $this.data.currentObj
        var Y = currentObj.getFullYear();
        var m = currentObj.getMonth() + 1;
        var d = currentObj.getDate();
        var str = ''
        if (e.currentTarget.dataset.key == 'left') {
            m -= 1
            if (m <= 0) {
                str = (Y - 1) + '/' + 12 + '/' + d
            } else {
                str = Y + '/' + m + '/' + d
            }
        } else {
            m += 1
            if (m <= 12) {
                str = Y + '/' + m + '/' + d
            } else {
                str = (Y + 1) + '/' + 1 + '/' + d
            }
        }
        currentObj = new Date(str);
        var week = ['周日','周一','周二','周三','周四','周五','周六'];
        $this.setData({
            currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月' + currentObj.getDate()+'日'+week[currentObj.getDay()],
            // currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月' + currentObj.getDate()+'日',
            currentObj: currentObj,
            /*  获取当前的年、月  */
            currentYear: currentObj.getFullYear(),
            currentMonth: (currentObj.getMonth() + 1),
        })
        this.setSchedule($this);
    },
    //返回初始日期
    getCurrentDayString: function ($this,initDate) {
        var objDate = $this.data.currentObj
        if (objDate != '') {
            return objDate
        } else {
            var date=initDate.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3");
            return  new Date(date);
        }
    },
    //重绘日历
    setSchedule: function ($this) {
        var m = $this.data.currentObj.getMonth() + 1
        var Y = $this.data.currentObj.getFullYear()
        var d = $this.data.currentObj.getDate();
        var dayString = Y + '/' + m + '/' + $this.data.currentObj.getDate()
        var currentDayNum = new Date(Y, m, 0).getDate()
        var currentDayWeek = $this.data.currentObj.getUTCDay() + 1
        var result = currentDayWeek - (d % 7 - 1);
        var firstKey = result <= 0 ? 7 + result : result;
        var currentDayList = [];
        var f = 0
        var currentdate = {}
        currentdate.y = Y;
        currentdate.m = m;
        if(m < 10){
            currentdate.m = '0' + m
        }
        var week = ['周一','周二','周三','周四','周五','周六','周日'];

        if ($this.data.isdelay==1) {
            var unit_date = [1, 7, 30];
            var periodic = [];
            periodic = $this.data.cycelbuy_periodic.split(",");
            var interval = periodic[0] * (unit_date[periodic[1]]);
            var period_index = $this.data.period_index;
            if (period_index==0){
              period_index=1;
            }
            
            var period_rest=periodic[2]-period_index+1;
        }
        var maxday=$this.data.maxday;//可选的天数
        var initDate = $this.data.initDate;//初始时间
        var checkedDate=$this.data.checkedDate;//选中的时间
        for (var i = 0; i < 42; i++) {
            var week_index = i % 7;
            let data = []
            if (i < firstKey - 1) {
                currentDayList[i] = { id: '',week:'',no_optional: true, checked: false}
            } else {
                if (f < currentDayNum) {
                    currentdate.d = f +1;
                    if (f < 9) {
                        var f1 = f + 1
                        currentdate.d = '0' + f1
                    }
                    var no_optional = false;//是否不可选
                    var checked = false;//是否选中
                    var date = Date.parse(currentdate.y +'/' +currentdate.m +'/'+currentdate.d);

                    //第一天之前不可选择
                    if (date < initDate){
                        no_optional = true;
                    }
                    
                    //如果是延期
                    if($this.data.isdelay==1){
                        //根据时间间隔，算出选中状态
                        //当前日期减掉被选择的日期跟时间间隔求余等于零 and 当前日期小于被选择的日期的最后一期  and 当前日期大于被选择的日期时则选中
                      if ((date - checkedDate) % (interval*86400000) == 0 &&  
                        date < (checkedDate + (period_rest * interval*86400000)) && date > checkedDate){
                            checked = true;
                        }
                    }

                    //如果当前时间大于可延期的截至日期时则不可选
                    if(date>(initDate+((maxday-1)*86400000))){
                        no_optional = true;
                    }

                    //选中当天
                    if (date == checkedDate) {
                        no_optional = false;
                        checked = true;
                    }
                    currentDayList[i] = { id: f + 1,week:week[week_index], no_optional: no_optional, checked: checked};
                    f = currentDayList[i].id

                } else if (f >= currentDayNum) {
                    currentDayList[i] = { id: '',week:'',no_optional: true, checked: false}
                }

            }
        }

        $this.setData({
            currentDayList: currentDayList
        })
    },

    //选择具体日期方法
    selectDay: function (e,$this) {
        if (!e.target.dataset.day) {
            return;
        }
        
        //如果是订单创建，则将年月日分割文字替换为点
        
        if($this.data.create){
            var currentDate=$this.data.currentYear + '.' + $this.data.currentMonth + '.' + e.target.dataset.day+' '+ e.target.dataset.week;//真实选择数据
        }else{
            var currentDate=$this.data.currentYear + '年' + $this.data.currentMonth + '月' + e.target.dataset.day+'日 '+ e.target.dataset.week;//真实选择数据
        }
        $this.setData({
            currentDay: e.target.dataset.day,//选择的数据，非真实当前日期
            currentDa: e.target.dataset.day, //选择某月具体的一天
            currentDate: currentDate,//真实选择数据
            checkedDate:Date.parse($this.data.currentYear + '/' + $this.data.currentMonth + '/' + e.target.dataset.day),
            receipttime:Date.parse($this.data.currentYear + '/' + $this.data.currentMonth + '/' + e.target.dataset.day) / 1000,
        })
        
        console.log("当前选择日期：" + $this.data.currentDate);
    }
}