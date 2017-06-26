## 日志存储策略

bunyan的stream支持`rotating-file`，`rotating-file`只能选择按照时间去滚动日志，比如每天生成一个日志文件，总共10个，对生成日志文件大小无法限定，当某段时间出现大量异常日志时，可能把磁盘占满，所有需要一种日志文件大小分割策略，推荐使用linux自带的`Logrotate`。

#### Logrotate

`Logrotate`是基于`CRON`运行的，使用很简单，只要对需要操作的日志文件在`/etc/logrotate.d/`目录下做一个相应配置，就会自动运行。
以下为一个简单的配置:

    /var/log/log-file {
	    monthly
	    rotate 5
	    compress
	    delaycompress
	    missingok
	    notifempty
	    create 644 root root
	    postrotate
	    	/usr/bin/killall -HUP rsyslogd
	    endscript
    }

- monthly: 日志文件将按月轮循。其它可用值为‘daily’，‘weekly’或者‘yearly’。
- rotate 5: 一次将存储5个归档日志。对于第六个归档，时间最久的归档将被删除。
- compress: 在轮循任务完成后，已轮循的归档将使用gzip进行压缩。
- delaycompress: 总是与compress选项一起用，delaycompress选项指示logrotate不要将最近的归档压缩，压缩将在下一次轮循周期进行。这在你或任何软件仍然需要读取最新归档时很有用。
- missingok: 在日志轮循期间，任何错误将被忽略，例如“文件无法找到”之类的错误。
- notifempty: 如果日志文件为空，轮循不会进行。
- create 644 root root: 以指定的权限创建全新的日志文件，同时logrotate也会重命名原始日志文件。
- postrotate/endscript: 在所有其它指令完成后，postrotate和endscript里面指定的命令将被执行。在这种情况下，rsyslogd 进程将立即再次读取其配置并继续运行。


#### 参考链接
1. [logrotate](http://www.linuxcommand.org/man_pages/logrotate8.html)
2. [Linux日志文件总管——logrotate](https://linux.cn/article-4126-1.html)
3. [logrotate机制和原理](http://www.lightxue.com/how-logrotate-works)
