# 日志分析系统 - 技术选型  
      
> 	no-taf项目使用，满足日志收集，监控，检索，预警等。   
  
## 初步需求    
*  [ ] 要具备显示调用方文件名和行号的能力  
*  [ ] 要具有按请求聚合的能力， 否则上下文全是乱的没法看。仅仅一行报错log难以定位，必须是请求的完整log才有价值。
*  [ ] 要有按用户聚合的能力，便于查流水 
*  [ ] 要有染色能力，指定用户能log全开，实时定位问题
*  [ ] 能还原成fiddler抓包，重现现场（对于偶发性问题比较重要）  
*  [ ] _要具备单机调试的功能，可以不停机编写条件开启指定log，无视日志级别_
*  [ ] 日志收集能力
*  [ ] 日志监控能力（日志内容、服务器指标）
*  [ ] 可视化日志分析界面
*  [ ] 日志预警机制（短信、邮件、微信）
  
## 一、node-log组件选型      
* [bunyan,log4js,winston在npm的对比](https://npmcompare.com/compare/bunyan,log4js,winston)    
* [bunyan,winston对比](https://strongloop.com/strongblog/compare-node-js-logging-winston-bunyan/)

1. winston   
> A multi-transport async logging library for Node.js  
  
  
2. log4js-node    
> Port of Log4js to work with node

3. node-bunyan    
> a JSON logging library for node.js services    
这个相对winston使用要简单些，主要的特点是json格式输出，便于后续分析解析。如果不是特别的需求，觉得这个还是很不错。


## 二、日志分析系统选型  

### 1. ELK    

* 1.1  Elasticsearch + Kibana + Logstash    
> 满足基本的日志file的收集处理和UI显示检索。  

* 1.2 Elasticsearch + Kibana + FileBeat    
> 满足基本的日志file的收集处理和UI显示检索，使用filebeat替代Logstash进行数据收集,FileBeat提供了简单的filter机制。  

![img1](imgs/ELK1)  


* 1.3 Elasticsearch + Kibana + Logstash + Beats    
> 满足基本的日志file的收集处理和UI显示检索，使用Beats进行数据采集， Logstash对采集后的数据进行过滤。    

* 1.4 Elasticsearch + Logstash + Kibana + Beats  + redis/kafka    
> 满足基本的日志file的收集处理和UI显示检索，使用Beats进行数据采集，采用缓存服务器作为日志源文件的中转，减轻应用服务端日志提取过滤分析的压力。    
[链接：Logstash性能及替代方案](http://www.cnblogs.com/richaaaard/p/6109595.html)  
由传统的：   
Logstash -> Kafka/redis -> Logstash -> Elasticsearch -> Kibana    
演变为：  
filebeat -> Kafka/redis -> Logstash -> Elasticsearch -> Kibana    
即：在应用服务器端，使用filebeat替代Logstash进行日志提取，以提升性能。    

#### Elasticsearch Beats    
>  Lightweight Data Shippers, Beats is the platform for single-purpose data shippers. They install as lightweight agents and send data from hundreds or thousands of machines to Logstash or Elasticsearch.  

Beats Family:    
* Filebeat    
> Filebeat helps you keep the simple things simple by offering a lightweight way to forward and centralize logs and files  

* Metricbeat   
> Collect metrics from your systems and services. From CPU to memory, Redis to NGINX, and much more, Metricbeat is a lightweight way to send system and service statistics.  

* Packetbeat  
> Packetbeat is a lightweight network packet analyzer that sends data to Logstash or Elasticsearch  
  
* Heartbeat  
> Monitor services for their availability with active probing. Given a list of URLs, Heartbeat asks the simple question: Are you alive? Heartbeat ships this information and response time to the rest of the Elastic Stack for further analysis.

#### Elasticsearch的扩展组件  
*  Elasticsearch官方扩展     
    -  [ ]X-Pack   
    > X-Pack is a single extension that integrates handy features — security, alerting, monitoring, reporting, graph exploration, and machine learning — you can trust across the Elastic Stack
* 预警相关的组件
    -  [ ]Watcher(X-Pack成员)    
    -  [ ]ElastAlert 
* ......  

### 2.EFK     
> Flume是java开发，高可用，高可靠的分布式日志采集系统，业内也大量使用，并且它系统框架好，模块分明，易于订制开发. Logstash是ruby语言开发的，跟团队使用语言java不符合，不容易排查问题及二次开发 .使用Flume的缺点是非官方Elasticsearch集成，要考虑版本兼容及后续升级。 

* 2.1 Flume + ElasticSearch + Kibana    

* 2.2 Flume + Kafka/redis + Elasticsearch + Storm  
> [参见链接](http://www.cnblogs.com/zhangmingcheng/p/6397586.html)    

### 3. Exceptionless  
[参见github链接](https://github.com/exceptionless/Exceptionless/) 
> The definition of the word exceptionless is: to be without exception. Exceptionless provides real-time error reporting for your JavaScript, Node, .NET Core, ASP.NET, Web API, WebForms, WPF, Console, and MVC apps. It organizes the gathered information into simple actionable data that will help your app become exceptionless!  

这个是.net的开源项目，直接调用Exceptionless client的log api将log写到了服务端。。
  

### 4.  Scribe/Chukwa/kafka/flume
[其他日志收集比较参见链接](http://dongxicheng.org/search-engine/log-systems/)
#### ELK安装部署  
。。。。