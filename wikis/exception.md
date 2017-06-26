## 什么错误该处理和怎么处理

- 操作错误：不是程序 bug 导致的运行时错误。比如：连接数据库服务器失败、请求接口超时、系统内存用光等等。
- 程序错误：程序 bug 导致的错误，只要修改代码就可以避免。比如：尝试读取未定义对象的属性、语法错误等等。

我们真正需要处理的是操作错误，程序错误应该马上进行修复。

那怎么处理操作错误呢？总结起来大概有下面这些方法：

- 直接处理。举个例子：尝试向一个文件中写东西，但是这个文件不存在，那这个时候会报错吧？处理这个错误的方法就是先创建好要写入的文件。如果我们知道怎么处理错误，那直接处理就是。
- 重试。有时候某些错误可能是偶发的（比如：连接的服务不稳定等），我们可以尝试对当前操作进行重试。但是一定要设置重试的超时时间、次数，避免长时间的等待卡死应用。
- 直接将错误抛给调用方。如果我们不知道具体怎么处理错误，那最简单的就是将错误往上抛。比如：检查到用户没有权限访问某个资源，那我们直接 throw 一个 Error（并带上 status 是 403）比较好，上层代码可以 catch 这个错误，然后要么展示一个统一的无权限页面给用户，要么返回一个统一的错误 json 给调用方。
- 写日志然后将错误抛出。这种情况一般是发生了比较致命的错误，没法处理，也不能重试，那我们需要记下错误日志（方便以后定位问题），然后将错误往上抛（交给上层代码去进行统一错误展示）。


## 异常规范

- 不丢弃异常
- 指定更明确异常
- 不要将异常用于控制流,仅为异常情况使用异常
- 记录异常产生详细信息（位置，堆栈，时间）
- 减小try块的体积

## 异常处理

try/catch

----------

try/catch用来处理同步的异常，try代码块中出现异常时，会在catch中捕获，catch中可以选择记录异常日志，处理异常或者抛出新异常。

    let bunyan = require('bunyan');
    let log = bunyan.createLogger({
        name: 'up'
    });
    
    function divideSync(x,y) {
        try {
            if (y === 0) {
                throw new Error("Can't divide by zero");
            }
            else {
                return x / y;
            }
        } catch (err) {
            log.error(err);
        }
    }
    
    divideSync(1, 0);

callback

----------

callback在node模块中很常见，回调的第一个参数默认为err，如果err为null，表示回调之前程序处理正确，如果不为null，表示回调之前程序处理发生异常。

    let bunyan = require('bunyan');
    let log = bunyan.createLogger({
        name: 'up'
    });
    
    function divideAsync(x,y,next) {
        if ( y === 0 ) {
            next(new Error("Can't divide by zero"));
        }
        else {
            next(null, x / y);
        }
    }
    
    divideAsync(1, 0, function(err, result){

        if ( err ) {
            log.error('1 / 0 = err', err);
        }
        else {
            log.info('1 / 0 = ' + result);
        }
    })

event listen

----------

event listen用于监听指定异常，也是异步处理。

    let bunyan = require('bunyan');
    let log = bunyan.createLogger({
        name: 'up'
    });
    let events = require('events');
    let Divider = function(){
        events.EventEmitter.call(this);
    }
    require('util').inherits(Divider, events.EventEmitter);
    
    Divider.prototype.divide = function(x,y){
        if ( y === 0 ) {
            let err = new Error("Can't divide by zero");
            this.emit('error', err)
        }
        else {
            this.emit('divided', x, y, x/y);
        }
    
        return this;
    }
    
    let divider = new Divider();
    divider.on('error', function(err){
        log.error(err);
    })
    divider.on('divided', function(x, y, result){
        log.info(x + '/' + y + '=' + result);
    })
    
    divider.divide(1, 2).divide(1, 0);

domain

----------

不建议使用，准备废弃，不能捕获所有的异步异常

    var domain = require('domain');
    
    //引入一个domain的中间件，将每一个请求都包裹在一个独立的domain中
    //domain来处理异常
    app.use(function (req,res, next) {
      var d = domain.create();
      //监听domain的错误事件
      d.on('error', function (err) {
        logger.error(err);
        res.statusCode = 500;
        res.json({sucess:false, messag: '服务器异常'});
        d.dispose();
      });
      
      d.add(req);
      d.add(res);
      d.run(next);
    });
    
    app.get('/index', function (req, res) {
      //处理业务
    });


uncaughtException 

----------

uncaughtException 错误会导致当前的所有的用户连接都被中断，甚至不能返回一个正常的 HTTP 错误码，用户只能等到浏览器超时才能看到一个 no data received 错误。

这是一种非常野蛮粗暴的异常处理机制，任何线上服务都不应该因为 uncaughtException 导致服务器崩溃。一个友好的错误处理机制应该满足三个条件:

1. 对于引发异常的用户，返回 500 页面
2. 其他用户不受影响，可以正常访问
3. 不影响整个进程的正常运行

很遗憾的是，保证 uncaughtException 不影响整个进程的健康运转是不可能的。当 Node 抛出 uncaughtException 异常时就会丢失当前环境的堆栈，导致 Node 不能正常进行内存回收。也就是说，每一次 uncaughtException 都有可能导致内存泄露。

uncaughtException 事件的缺点在于无法为抛出异常的用户请求返回一个 500 错误，这是由于 uncaughtException 丢失了当前环境的上下文，比如下面的例子就是它做不到的:

    app.get('/', function (req, res) {
        setTimeout(function () {
            throw new Error('async error'); 
    // uncaughtException, 导致 req 的引用丢失
            res.send(200);
        }, 1000);
    });
    
    process.on('uncaughtException', function (err) {
        res.send(500); // 做不到，拿不到当前请求的 res 对象
    });

最终出错的用户只能等待浏览器超时。

当 uncaughtException 事件有一个以上的 listener 时，会阻止 Node 结束进程。因此就有一个广泛流传的做法是监听 process 的 uncaughtException 事件来阻止进程退出，这种做法有内存泄露的风险，所以千万不要这么做。

## koa中处理错误

`koa`内部做了处理，我们可以直接使用 catch 来捕获异步代码中的错误。比如下面的例子：

    const fs = require('fs');
    const Promise = require('bluebird');
    
    let filename = '/nonexists';
    let statAsync = Promise.promisify(fs.stat);
    try {
      yield statAsync(filename);
    } catch(e) {
      // error here
    }

在`koa`中，推荐统一使用 try/catch 的方式来进行错误的触发和捕获，这会让代码更加易读，防止被绕晕。


## 参考链接
1. [Node Error](https://nodejs.org/docs/latest/api/errors.html)
2. [Error Handling in Node.js](https://www.joyent.com/node-js/production/design/errors)
3. [如何优雅的在 koa 中处理错误](http://taobaofed.org/blog/2016/03/18/error-handling-in-koa/)
4. [Node 出现 uncaughtException 之后的优雅退出方案](http://www.infoq.com/cn/articles/quit-scheme-of-node-uncaughtexception-emergence)
5. [Node.js 异步异常的处理与domain模块解析](https://cnodejs.org/topic/516b64596d38277306407936)