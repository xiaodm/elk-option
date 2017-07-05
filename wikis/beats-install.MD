# Beats环境搭建  
本文档介绍最简单的Beats在`CentOS 7`环境搭建：`metricbeat` + `packetbeat` + `heartbeat`
示例安装`metricbeat`，`packetbeat`和`heartbeat`整体流程类似

## 1. 下载  

`metricbeat`下载路径：[meticbeat](https://www.elastic.co/downloads/beats)  #注意应该下载和elasticsearch版本号一致的，以免不兼容     
安装过程可参照[官网安装meticbeat](https://www.elastic.co/guide/en/beats/metricbeat/current/metricbeat-installation.html)   
这里直接使用`root`用户安装:    

```  shell
tar -zxvf meticbeat-5.4.1-linux-x86_64.tar.gz -C meticbeat
```  

## 2. 配置meticbeat.yml    

```  
vi /etc/meticbeat/meticbeat.yml  
```    

meticbeat.yml默认配置会收集部署操作系统cup,load,memory,filesystem等信息，如果想添加其他配置，可以先参考meticbeat.full.yml，然后
copy到meticbeat.yml中，修改相应选项即可

### output配置
output的目标elasticsearch或logstash可选，
这里配置elasticsearch：  

```    
output.elasticsearch:
  hosts: ["localhost:9200"]
```  

## 3. 加载索引模板到`elasticsearch`  
这里保持默认即可，当`meticbeat`连接到`elasticsearch`时，会默认导入。  

## 4. 加载`kibana`的索引匹配 

```  
 ./scripts/import_dashboards -only-index     
 
```  

> 如果使用了SSL,拷贝认证证书到scripts目录后，执行：  
```  
./scripts/import_dashboards -only-index  -es https://localhost:9200 -user admin -pass admin  -cacert ./scripts/root-ca.crt  
```

加载索引匹配时，`elasticsearch`应该处于启动状态，否则会报连接错误

## 5. 启动    
```  
 ./meticbeat -e -c meticbeat.yml  
```

-e选项会将所有信息输出到控制台