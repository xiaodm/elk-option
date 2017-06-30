# koa1-buyan-demo

## 1 依赖包安装
```
npm install
```
> 注：koa1依赖： koa-bunyan-logger@1.2.0 ；koa2依赖： koa-bunyan-logger@2.0.0

### 2 日志配置说明
比如这里`logconfig/index.js`文件负责`bunyan`日志对象的初始化，
定义日志级别为`info`,并输出到`logs/bunyan/koa1-demo1-info.log`相对目录：

```
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
        ],
    serializers: {
        req: reqSerializer
    }
});
```

### 3 中间件引入说明
```
const logger =require('./logconfig');    //bunyanLog定义引用
const koaBunyanLogger = require('koa-bunyan-logger'); //koa-bunyan-logger插件引用
...
...
//中间件配置
app.use(koaBunyanLogger(logger));
app.use(koaBunyanLogger.requestIdContext());   //记录请求req_id中间件
app.use(koaBunyanLogger.timeContext());        //具备访问计时器能力的中间件(选择使用)
//app.use(koaBunyanLogger.requestLogger());    //具备打req、res信息的中间件(选择使用)
```

### 4 记录日志
* `this.log`
在路由内，直接使用`this.log`进行日志记录：

```  javascript
router.get('/', function *(next) {
    this.log.info('the index router invoke');  // trace/debug/info/warn/error/fatal
    this.body = 'this a index resp!';
});
```
* 要附加其他重要字段
如果要附加其他业务字段，并提升属性级别(如果不提升的话，默认全记录在msg属性内)：

```  javascript
router.get('/', function *(next) {
    this.log.info({userid: '123123'}, 'test user login');
    this.body = 'this a index resp!';
});
```

* 全局异常记录
* 其他使用场景

### 5 开启request详细日志
有时我们需要看一下`request`和`response`的详细信息,只需应用如下中间件即可：

```
app.use(koaBunyanLogger.requestLogger());    //具备打req、res信息的中间件(选择使用)
```

### 6 如何美化打印
`bunyan`日志输出为`json`格式，方便处理但非常不便于阅读，`bunyan`自带的`CLI`可以美化打印，只需在启动时添加` | bunyan`即可：
```
node app.js | bunyan
```

### 7 如何动态修改日志级别
这里使用url api的方式动态修改日志级别。

示例demo如下，可结合实际修改：
```    javascript
router.get('/change-log-level/:level', function *(next) {
    let level = this.params.level;
    if (!Number.isInteger(level)) {
        yield next;
        this.body = 'has error:  need number level';
    }
    else {
        const logger = require('../bunyanLog');
        logger.streams[0].level = Number.parseInt(level);
        logger._level = Number.parseInt(level);
        this.body = 'change log level success!';
    }
});
```


