/**
 * Created by 98892 on 2017/6/8.
 */
let bunyan = require('bunyan');

let log_path = 'logs/bunyan';

function reqSerializer(req) {
    return {
        method: req.method,
        url: req.url,
        headers: req.headers
    };
}

//app日志文件
module.exports = bunyan.createLogger({
    src: true,
    name: 'koa1-users',
    streams: [
        {
            level: 'info',
            path: `${log_path}/koa1-demo1-info.log`,
            period: '1d',   // daily rotation
            count: 30        // keep 30 back copies
        },
        {
            level: 'info',
            stream: process.stdout            // log INFO and above to stdout
        },
        /*{
            level: 'error',
            path: `${log_path}/koa-demo1-error.log`,
            period: '1d',   // daily rotation
            count: 30        // keep 30 back copies
        }*/
        ],
    serializers: {
        req: reqSerializer
    }
});

