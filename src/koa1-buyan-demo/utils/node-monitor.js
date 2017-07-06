/**
 * Created by deexiao on 2017/7/6.
 */

const schedule = require("node-schedule");
const {exec} = require('child_process');
const os = require('os');

/**
 * 解析ps命令返回的数据，返回cpu使用率
 */
function getCpuUsageByStdout(stdout) {
    try {
        let strArr = stdout.split('\n');
        if (strArr.length > 1) {
            let valueArr = strArr[1].split(/\s+/);
            return parseFloat(valueArr[2]);
        }
        else {
            return 0;
        }
    } catch (e) {
        console.error(e);
        return 0;
    }
}

/**
 * 获取cpu、内存使用情况
 */
function getCpuMemUsage(callback, options) {
    let opt = options || {};
    let scheduleInterval = opt.scheduleInterval || `*/5 * * * * *`;
    schedule.scheduleJob(scheduleInterval, function () {
        let rlt = {
            rss: 0,
            heaptotal: 0,
            heapused: 0,
            external: 0,
            cpuprocess: 0
        };
        let memoryUsage = process.memoryUsage();
        let pid = process.pid;
        rlt.rss = memoryUsage.rss;
        rlt.heaptotal = memoryUsage.heapTotal;
        rlt.heapused = memoryUsage.heapUsed;
        rlt.external = memoryUsage.external;
        try {
            exec('ps -u --pid ' + pid, function (err, stdout, stderrr) {
                if (err) {
                    console.error(err);
                    return;
                }
                rlt.cpuprocess = getCpuUsageByStdout(stdout);
                callback(rlt);
            });
        }
        catch (e) {
            callback(rlt, e);
        }
    });
}

/**
 * 获取event loop延迟数据(ms)
 */
function getLoopDelay(callbak, options) {
    let opt = options || {};
    let TIME_INTERVAL = opt.time_interval || 1000;

    var oldTime = process.hrtime();
    setInterval(function () {
        var newTime = process.hrtime();
        var delay = (newTime[0] - oldTime[0]) * 1e3 + (newTime[1] - oldTime[1]) / 1e6 - TIME_INTERVAL;
        oldTime = newTime;
        callbak(delay);
    }, TIME_INTERVAL);
}

module.exports={
    getCpuMemUsage:getCpuMemUsage,
    getLoopDelay:getLoopDelay
};
