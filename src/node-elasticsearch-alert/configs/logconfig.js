/**
 * Created by 98892 on 2017/6/14.
 */

'use strict';
const bunyan = require('bunyan');
const log = bunyan.createLogger({
    src: true,
    name: 'trace-es',
    streams: [{
        path: 'logs/trace.log',
        // `type: 'file'` is implied
    }]
});

module.exports =log;