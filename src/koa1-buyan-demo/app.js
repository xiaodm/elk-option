const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const co = require('co');
const convert = require('koa-convert');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');

const logger =require('./logconfig');

var koaBunyanLogger = require('koa-bunyan-logger');

var sqldb = require('./sqldb');

const index = require('./routes/index');
const users = require('./routes/users');

// middlewares
app.use(bodyparser());
app.use(json());
app.use(require('koa-static')(__dirname + '/public'));

// use bunyan 、koa-bunyan-logger
app.use(koaBunyanLogger(logger));
app.use(koaBunyanLogger.requestIdContext());
app.use(koaBunyanLogger.timeContext());
//app.use(koaBunyanLogger.requestLogger());

// logger
app.use(function *(next) {
    let start = new Date;
    yield next;
    let ms = new Date - start;
    this.log.info('%s %s - %s', this.method, this.url, ms);
});

router.use('/', index.routes(), index.allowedMethods());
router.use('/users', users.routes(), users.allowedMethods());

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3233);

logger.info('app started at port 3233');

let perfor=require('./utils/performance');
perfor();

app.on('error', function (err, ctx) {
    logger.error('server error', err, ctx);
});

module.exports = app;