# 基于node-bunyan的日志规范      

## 一、日志约定

记录日志的原则是判断应用是否符合预期和出错能快速进行定位问题。

1. 存储位置  
对于部署在服务器的应用程序，推荐约定统一的存储位置（比如`/var/log/${projectName}`），位置在应用程序的配置文件中是可配置的。  
存储约定好了之后，便于后续`filebeat`或者`logstash`日志平台组件去进行拉取。  

2. 记录级别   
应用程序中，推荐至少记录`info`和`error`日志  
推荐分别命名两个文件（比如${projectName}_info_20170620.log和${projectName}_error_20170620.log}.  
`debug`可以在开发或测试环境中使用，生产环境一般不使用。  
`info`是bunyan默认日志级别，一般记录应用调用轨迹或关键信息，以便应用出错时方便跟踪定位问题，  
`error`表示应用出错或者异常信息，要引起特别重视。  

3. 存储策略   
可以根据每个应用自身日志输出大小和重要度进行配置，对于一般应用的`info`日志，推荐至少保留一个月日志，`error`日志保留三个月。  

4. 代码位置记录  
日志应该记录具体输出的文件和行号，以便定位(`bunyan`中设置`src`为`true`，会自动记录该信息)。  

5. 异常堆栈记录  
异常日志应该保留其原始堆栈信息，不要丢掉或者转换(`bunyan`中将`err`对象传入`log.error(err)`中即可)。    

6. 日志记录时间  
日志应该记录具体输出时间，先输出的一定记录在后输出前面，如果涉及多台服务器，多个应用相互调用，时间无法一致，可以采用逻辑一致。  

7. 记录请求标识`req_id`  
统一约定所有由请求产生的日志，必须记录req_id。便于后续进行日志聚合追踪。  
其它业务重要属性可以根据具体应用而定，出错或追踪问题时，重要信息一般是必须要记录的，比如`userId`，`orderId`等等。  

8. 日志应该具有可读性  
目前`bunyan`输出`json`日志，可读性比较差，如果是调试，可以使用`node_modules/.bin/bunyan`美化输出  

9. _动态调整日志级别_  
应用最好能具备动态调整日志级别的能力，便于问题定位。  

10. xxxx

## 二、node-bunyan的主要特性   
这里只是简单说明`node-bunyan`日志组件的重要能力，详细说明及API可参照:  
__[node-bunyan官方地址](https://github.com/trentm/node-bunyan)__    
__[koa-bunyan-logger插件地址](https://github.com/koajs/bunyan-logger)__    
__使用前请阅读一遍官方链接（很简单，半小时内估计就读完了）。__  
  
### 2.1  JOSN格式的日志输出  
`node-bunyan`的定位是：简单并且快速的JSON日志类库。输出的日志是结构化的`json`格式。一行日志记录也就是是`JSON.stringify`的输出。 
缺点是不太便于查看（可利用插件或工具美化），优点是便于其他平台对接及检索。  

### 2.2  支持的日志级别   
* "fatal" (60): The service/app is going to stop or become unusable now. An operator should definitely look into this soon.
* "error" (50): Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon(ish).
* "warn" (40): A note on something that should probably be looked at by an operator eventually.
* "info" (30): Detail on regular operation.
* "debug" (20): Anything else, i.e. too verbose to be included in "info" level.
* "trace" (10): Logging from external libraries used by your app or very detailed application logging.   
 
### 2.3  非常简单记录源码位置  
配置中设置`src: true`  

### 2.4  轻量扩展的日志实例`log.child`    
可以创建一个新的实例，并附加特定的字段，便于扩展。  
```   javascript
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'myapp'});

function Wuzzle(options) {
    this.log = options.log.child({widget_type: 'wuzzle'});
    this.log.info('creating a wuzzle')
}
Wuzzle.prototype.woos = function () {
    this.log.warn('This wuzzle is woosey.')
}

log.info('start');
var wuzzle = new Wuzzle({log: log});
wuzzle.woos();
log.info('done');  
```  
### 2.5 自定义输出对象属性的`serializers`  
有了它，你可以对某些特定的对象，对属性进行过滤后输出。  

### 2.6 node-bunyan的插件koa-bunyan-logger  

#### 2.6.1 记录request_id  
当每一个请求到服务端时，获取X-Request-Id请求头，如果不存在，则在服务端生成一个随机并唯一的request_id，日志打印内会自动记入。  
使用方式：  
```  
var koaBunyanLogger = require('koa-bunyan-logger');  
app.use(koaBunyanLogger());
app.use(koaBunyanLogger.requestIdContext());
```

#### 2.6.2 time-duration   
在koa context上添加了`time(label)`和`time(label)`方法， 可用于计时场景使用：  
```    
var koaBunyanLogger = require('koa-bunyan-logger');

app.use(koaBunyanLogger());
app.use(koaBunyanLogger.requestIdContext());
app.use(koaBunyanLogger.timeContext());  

app.use(function * () {
  this.time('get data');         //start time
  var user = yield getUser();
  var friends = yield getFriend(user);
  this.timeEnd('get data');     //end time

  this.time('serialize');
  this.body = serialize(user, friends);
  this.timeEnd('serialize');
}); 
```   
out put:  
```  
{"name":"koa","hostname":"localhost","pid":9228,"level":10,"label":"get data","duration":102,"msg":"","time":"2014-11-07T01:45:53.711Z","v":0}
{"name":"koa","hostname":"localhost","pid":9228,"level":10,"label":"serialize","duration":401,"msg":"","time":"2014-11-07T01:45:54.116Z","v":0}  
```
  
#### 2.6.3 request-detail     
以下方式即可开启详细`request`及`response`内容打印：  
```  
app.use(koaBunyanLogger.requestLogger());  
```

## 三、KOA项目内使用方式  
这里针对`koa1、koa2`项目的使用进行说明。    

### 3.1 依赖包安装    

`node-bunyan`与`koa`框架无关，所以不区分`koa1/2`，安装方式一样：  
```  
npm install bunyan --save  
```  

koa-bunyan-logger扩展插件安装方式：  
* koa1  
```  
npm i koa-bunyan-logger@1.2.0 --save  
```  
* koa2   
```  
npm i koa-bunyan-logger@2.0.0 --save  
``` 

### 3.2 日志配置     
比如这里`bunyanLog.js`文件负责`bunyan`日志对象的初始化，  
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

### 3.3 中间件引入   
```    
const logger =require('./bunyanLog');    //bunyanLog定义引用  
const koaBunyanLogger = require('koa-bunyan-logger'); //koa-bunyan-logger插件引用
...  
...
//中间件配置
app.use(koaBunyanLogger(logger));
app.use(koaBunyanLogger.requestIdContext());   //记录请求req_id中间件
app.use(koaBunyanLogger.timeContext());        //具备访问计时器能力的中间件(选择使用)
//app.use(koaBunyanLogger.requestLogger());    //具备打req、res信息的中间件(选择使用)
```  

### 3.4 记录日志
* koa1:`this.log`      
* koa2:`ctx.log`  
在路由内，直接使用`this.log`/`ctx.log`进行日志记录：  

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

### 3.5 开启request详细日志
有时我们需要看一下`request`和`response`的详细信息,只需应用如下中间件即可：  
    
```  
app.use(koaBunyanLogger.requestLogger());    //具备打req、res信息的中间件(选择使用)  
```

### 3.6 如何美化打印     
`bunyan`日志输出为`json`格式，方便处理但非常不便于阅读，`bunyan`自带的`CLI`可以美化打印，只需在启动时添加` | bunyan`即可：  
```  
node app.js | bunyan  
```
  
### 3.7 如何动态修改日志级别       
这里使用url api的方式动态修改日志级别。  

示例demo如下，可结合实际修改：
```    javascript
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
```

### xxxx  

