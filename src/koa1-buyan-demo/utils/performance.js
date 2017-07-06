/**
 * Created by deexiao on 2017/7/4.
 */
let bunyan = require('bunyan');
let log_path = '/usr/local/testlogs/nodemetriclogs';
//let log_path = 'logs/performance';
const node_monitor = require('./node-monitor');
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

// 开始性能日志收集：memory、cpu、loop delay
module.exports = function LogPerformance() {
    node_monitor.getCpuMemUsage(function (rlt, err) {
        logger.info(
            {
                rss: rlt.rss,
                heaptotal: rlt.heaptotal,
                heapused: rlt.heapused,
                external: rlt.external,
                cpuprocess: rlt.cpuprocess,
                monitortype: 1
            }, 'performance datas');
        if (err) {
            logger.error(err);
        }
    }, {scheduleInterval: `*/5 * * * * *`});

    node_monitor.getLoopDelay(function (delay) {
        logger.info(
            {
                loopdelay: Math.round(parseFloat(delay)*100)/100,
                monitortype: 2
            }, 'performance datas')
    }, {time_interval: 2000})
};