//var log =require('../logconfig').indexlog;

var router = require('koa-router')();

router.get('/', function *(next) {
    this.log.debug({foo: 'bar'}, 'hi');
    this.log.info('the index router invoke');
    this.body = 'this a index resp!';
});


router.get('/change-log-level/:level', function *(next) {
    let level = Number.parseInt(this.params.level);
    if (!Number.isInteger(level)||![10,20,30,40,50,60].includes(level)) {
        yield next;
        this.body = 'has error:  need Integer number level in [10,20,30,40,50,60]';
    }
    else {
        const logger = require('../logconfig');
        logger.streams[0].level = level;
        logger._level = level;
        this.body = 'change log level success!';
    }
});

module.exports = router;
