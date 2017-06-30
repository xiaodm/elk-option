# Elasticsearch 5 性能优化建议  
这里主要结合官方文档及第三方的使用经验，总结一些`Elasticsearch 5`的性能优化建议。

## 一、服务器部署及规划    
### 1.1 建议至少采用>=3个elasticsearch组成集群    
参见：[Elasticsearch集群环境部署及说明](elasticsearch-cluster.MD)  

### 1.2 建议1-2台服务器，用于负载均衡节点   
有高访问压力时，可添加负载均衡节点，即仅做路由转发。   

### 1.3 关闭data节点服务器中不需要的功能  
针对Elasticsearch中确定仅做data节点(仅node.data: true，其他均为false)，关闭不需要的功能。    
不开启http服务：http.enabled: false，同时也不要安装head, bigdesk, marvel等监控 插件，这样保证data节点服务器只需处理创建/更新/删除/查询索引数据等操作。  
  
### 1.4 一台服务器(或虚拟机)上最好只部署一个Node    

### 1.5 规划索引、分片 以及集群增长情况  
ES使得创建大量索引和超大量分片非常地容易，但更重要的是理解每个索引和分片都是一笔开销。如果拥有太多的索引或分片，单单是管理负荷就会影响到ES集群的性能，潜在地也会影响到可用性方面。这里我们专注于管理负荷，但运行大量的索引/分片依然会非常显著地影响到索引和检索性能。  
> 假如有一个索引包含50k的mapping数据（我们当时是有700个字段）。如果每小时生成一个索引，那么每天将增加24 x 50k的集群状态数据，或者1.2MB。如果需要在系统中保留一年的数据，那么集群状态数据将高达438MB（以及8670个索引，43800个分片）。如果与每天一个索引（18.25MB，365个索引，1825个分片）作比较，会看到每小时的索引策略将会是一个完全不同的境况。    


## 二、服务器配置    
### 2.1 elasticsearch日志配置  
elasticsearch采用的是Log4j2组件，配置文件为log4j2.properties。目前默认是按天回滚。  
具体配置参见[elasticsearch日志策略配置](....)  

### 2.2 合理设置jvm heap大小  
如果决定为elasticsearch分配32G内存。标准的建议是把50%的内存给elasticsearch，剩下的50%也不会没有用处的，Lucene会很快吞噬剩下的这部分内存用于文件缓存。  
所以，这种情况设置 jvm.options文件内容如下：  
```  
-Xms16g 
-Xmx16g
```
> 记住，不要分配给Elasticsearch超过32G内存

### 2.3 bootstrap.memory_lock: true  
在`config/elasticsearch.yml`内添加。    
仅支持在`Linux/Unix`系统。 据说可通过此种方式解决内存溢出问题。锁住内存，禁止swapping交换。因为当jvm开始swapping时es的效率会降低。  

### 2.4 增加虚拟内存    
Elasticsearch 存储索引在`hybrid mmapfs / niofs`格式的目录内，但操作系统默认给`mmap counts`限制比较低，有可能引发内存溢出的问题。  
在Linux系统中，可使用以下命令增加:  
```  
sysctl -w vm.max_map_count=262144  
```
一劳永逸的做法：直接修改`/etc/sysctl.conf`文件中的`vm.max_map_count`属性后重启，再检查：`sysctl vm.max_map_count`   


### 2.5 进程数   
官方建议最少提供给elasticsearch用户2048进程数的限制。    
	- 临时办法：ulimit -u 2048  
	- 直接修改系统配置`/etc/security/limits.conf`:  
	添加：  
	
	```    
	esuser soft nproc 100000
	esuser hard nproc 100000
	```      
### 2.6 打开文件数量限制  
建议设置为65536：  
	- 临时办法：`ulimit -n 65536`  
	- 直接修改系统配置`/etc/security/limits.conf`:   
	添加：  
	```  
	esuser  -  nofile  65536
	```

## 三、服务使用  

### 3.1 尽量减少不需要的字段  
ElasticSearch中存储的数据是用于搜索服务，因此其他一些不需要用于搜索的字段最好不存到ES中，这样即节省空间，同时在相同的数据量下，也能提高搜索性能。    

### 3.2 不要返回较大的结果集  
ES是设计成一个搜索引擎的，只擅长返回匹配查询较少文档，如果需要返回非常多的文档需要使用Scroll。    

### 3.3 查询速度慢的日志  
默认情况下，Elasticsearch会记录下查询速度慢或者添加索引速度慢的操作记录，为后续性能优化提供依据。  
在`/es-path/logs`里面会有对应`cluster_name_index_search_slowlog-%d{yyyy-MM-dd}.log、cluster_name_index_indexing_slowlog.log`日志。
  
### 3.3 避免将不相关的数据放到相同的索引中  

### 3.4 bulk使用

### 3.5 不要使用_all   

### 3.6 使用更快的硬件    

## 参考  
* [ElasticSearch性能优化策略](http://www.tuicool.com/articles/AzUZJfa)   
* [ElasticSearch 5.0 测评以及使用体验](http://www.tuicool.com/articles/umYrm26) 
* [配置高性能Elasticsearch集群的9个小贴士](http://www.infoq.com/cn/news/2017/01/ElasticSearch-9)  
* [ElasticSearch官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
