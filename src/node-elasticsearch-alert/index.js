/**
 * Created by 98892 on 2017/6/14.
 */

'usr strict';

const config = require('./configs');
const log = require('./configs/logconfig');
const schedule = require("node-schedule");

const validate_es=require('./elastic/validate_es');

const schedule_time = config.alertConfig.schedule_time;
const buffer_time = config.alertConfig.buffer_time || 10;

//第一次启动时，开始查询时间往前5分钟
let v_start_time = new Date();
v_start_time.setMinutes(v_start_time.getMinutes() - 5);

schedule.scheduleJob(`*/${schedule_time} * * * *`, function () {
    //
    v_start_time = getESStartTime(v_start_time);

    try {
        new validate_es().validate(v_start_time, new Date());
    }
    catch (e){
        log.error(e);
    }

});

function getESStartTime(start) {
    let now = new Date();

    let time_span = timeSpanMin(start, now);
    if (time_span > buffer_time) {
        let start_time = new Date();
        start_time.setMinutes(start_time.getMinutes() - 2);
        return start_time;
    } else {
        return start;
    }
}

function timeSpanMin(start, end) {
    let timeSpan = end.getTime() - start.getTime(); //时间差的毫秒数

    let leave1 = timeSpan % (24 * 3600 * 1000);    //计算天数后剩余的毫秒数

    //计算相差分钟数
    let leave2 = leave1 % (3600 * 1000);      //计算小时数后剩余的毫秒数
    return Math.floor(leave2 / (60 * 1000));
}