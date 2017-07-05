/**
 * Created by deexiao on 2017/7/4.
 */
let bunyan = require('bunyan');
const schedule = require("node-schedule");
const {exec} = require('child_process');
const os = require('os');
let log_path = '/usr/local/testlogs/nodemetriclogs';
//let log_path = 'logs/performance';

//app日志文件
const logger = bunyan.createLogger({
    name: 'koa1-users',
    streams: [
        {
            level: 'info',
            path: `${log_path}/node1-performance-info.log`,
            period: '1d',   // daily rotation
            count: 30        // keep 30 back copies
        },
        {
            level: 'info',
            stream: process.stdout            // log INFO and above to stdout
        }
    ]
});

function getCpuUsageBystdout(stdout) {
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
        logger.error(e);
        return 0;
    }
}

module.exports = function LogPerformance() {
    schedule.scheduleJob(`*/5 * * * * *`, function () {
        try {
            let memoryUsage = process.memoryUsage();
            let pid = process.pid;

            exec('ps -u --pid ' + pid, function (err, stdout, stderrr) {
                if (err) {
                    console.error(err);
                    return;
                }
                logger.info(
                    {
                        rss: memoryUsage.rss,
                        heaptotal: memoryUsage.heapTotal,
                        heapused: memoryUsage.heapUsed,
                        external: memoryUsage.external,
                        cpuprocess: getCpuUsageBystdout(stdout)
                    }, 'performance datas')
            });
        }
        catch (e) {
            logger.error(e);
        }
    });
};