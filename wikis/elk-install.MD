# ELK 单机环境搭建  
本文档介绍最简单的ELK在`CentOS 7`环境搭建：`elasticsearch` + `filebeat` + `kibana`  

## 安装环境  
* CentOS-7-x86_64-Minimal-1611.iso  
* jdk-8u92-linux-x64.rpm  
* [Elastic Stack 5](https://www.elastic.co/cn/products)

# JDK安装  

使用rpm安装`jdk-8u92-linux-x64.rpm`  
路径：[.......待补充]()  
拷贝到服务器目录后，安装命令：  
```    
rpm -ivh jdk-8u92-linux-x64.rpm
```  


# 目录结构约定     
在服务器单机部署时，尽量将ELK部署在一个目录内，如下：
使用`mkdir`命令创建：  
* elk  
	- elasticsearch    
	- kibana  
	- filebeat
  
# `elasticsearch`安装配置  
`elasticsearch`包路径：[.......待补充]()     
安装过程可参照[官网安装elasticsearch](https://www.elastic.co/downloads/elasticsearch) 

## 1. 创建一个elsearch用户
>	如果直接使用`root`用户,启动`elasticsearch`时，会报错：      
org.elasticsearch.bootstrap.StartupException:  
java.lang.RuntimeException: can not run elasticsearch as root    

所以创建一个elsearch用户：  
``` shell
groupadd elsearch
useradd elsearch -g elsearch -p elsearch    
```  
## 2. 安装：  
```  shell
tar -zxvf elasticsearch-5.4.1.tar.gz -C elasticsearch
```  
	
文件夹授权给新用户：  
```  
chown -R elsearch:elsearch elasticsearch  
```

	
## 3. 启动：  
```  
su elsearch  
bin/elasticsearch  
```    
启动成功后，访问：  `CURL http://localhost:9200/`  

## 4. 遇到的问题
	
如果需要在局域网中访问 ：  
```  
修改：
vim config/elasticsearch.yml
增加:  
network.host: 0.0.0.0  # 或当前机器IP  
```  

> 启动报错：  
	[1]: max file descriptors [4096] for elasticsearch process is too low, increase to at least [65536]  
	[2]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]


**后面所有的错误参见http://www.cnblogs.com/sloveling/p/elasticsearch.html即可解决**    

  

# kibana安装配置  
  
## 1. 安装  

`kibana`包路径：[.......待补充]()     
安装过程可参照[官网安装kibana](https://www.elastic.co/downloads/kibana) 

如果需要在局域网中访问 ：  
```  
修改：
vi config/kibana.yml
增加:  
server.host: 0.0.0.0    # 或当前机器IP  
```   

这里直接使用`root`用户安装:  

```  shell
tar -zxvf kibana-5.4.1-linux-x86_64.tar.gz -C kibana
```  
## 2. 配置     
打开安装包目录内的`config/kibana.yml`  

设置`elasticsearch.url` 路径指向`elasticsearch`地址(如`http://localhost:9200/`默认)

## 3. 启动  
```  
bin/kibana    
```  
成功后可访问：`http://ip:5601`  

> PS: 有可能启动没有反应。。但是我vm内存只给了1G，后来关闭添加内存到2G，再启动执行就可以了。。。

# filebeat安装配置
## 1. 安装  

`filebeat`包路径：[.......待补充]()     
安装过程可参照[官网安装filebeat](https://www.elastic.co/downloads/beats/filebeat)   
  这里直接使用`root`用户安装:    
```  shell
tar -zxvf filebeat-5.4.1-linux-x86_64.tar.gz -C filebeat
```  
## 2. 配置filebeat.yml    
```  
vi /etc/filebeat/filebeat.yml  
```    
### 定义日志文件抓取路径：    
```  
- input_type: log
  # Paths that should be crawled and fetched. Glob based paths.
  paths:
    - /usr/local/testlogs/*.log
  document_type: test-koa-log 
```    
### output配置
output的目标elasticsearch或logstash可选，这里配置elasticsearch：  
```    
output.elasticsearch:
  hosts: ["localhost:9200"]
```  

## 3. 加载索引模板到`elasticsearch`  
这里保持默认即可，当`filebeat`连接到`elasticsearch`时，会默认导入。  

## 4. 加载`kibana`的索引匹配 
```  
 ./scripts/import_dashboards -only-index   
```
## 5. 启动    
```  
 ./filebeat -e -c filebeat.yml  
```


------按顺序start elasticsearch、filebeat、kibana后即可访问 -----



  
  

  
  