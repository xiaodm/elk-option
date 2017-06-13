# Elastalert企业微信预警配置  
## 参考  
1. [ElastAlert Github](https://github.com/Yelp/elastalert) 
2. [ElastAlert Doc](http://elastalert.readthedocs.org/) 
3. [ElastAlert wechat plugin](https://github.com/anjia0532/elastalert-wechat-plugin)    
4. [ElastAlert微信报警](http://www.jianshu.com/p/d318e0e843fd)

## 一 插件安装    
1. 下载插件源码：    
``` 
https://github.com/anjia0532/elastalert-wechat-plugin.git  
```  

2. 安装插件到elastalert  
``` shell 
$ cd /usr/local/elk-extend/elastalert  
$ mkdir  elastalert_modules    
$ 然后手动拷贝插件源码内wechat_qiye_alert.py到elastalert_modules
# 配置config.yaml，同email预警时配置
$ cp  config.yaml.example config.yaml  
```  



## 二 规则配置    
1. 拷贝默认的规则配置：  
```  
$ cd /usr/local/elk-extend/elastalert/example_rules  
$ cp example_frequency.yaml mytest_frequency-weixin.yaml 
$ vi mytest_frequency-weixin.yaml 
```    

2. 修改mytest_frequency-weixin.yaml     
  
``` shell  
# Alert when the rate of events exceeds a threshold
# (Optional)
# Elasticsearch host
es_host: localhost

# (Optional)
# Elasticsearch port
es_port: 9200

# (OptionaL) Connect with SSL to Elasticsearch
#use_ssl: True

# (Optional) basic-auth username and password for Elasticsearch
es_username: elastic
es_password: changeme

# (Required)
# Rule name, must be unique
name: Example frequency-weixin rule

# (Required)
# Type of alert.
# the frequency rule type alerts when num_events events occur with timeframe time
type: frequency

# (Required)
# Index to search, wildcard supported
index: filebeat-*

# (Required, frequency specific)
# Alert when this many documents matching the query occur within a timeframe
num_events: 2

# (Required, frequency specific)
# num_events must occur within this amount of time to trigger an alert
timeframe:
  #hours: 4
  minutes: 1

# (Required)
# A list of Elasticsearch filters used for find events
# These filters are joined with AND and nested in a filtered query
# For more info: http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl.html
filter:
#- term:
#    some_field: "some_value"
- query:
    query_string:
      query: "message: *error*"
  
# (Required)
# The alert is use when a match is found
alert:  
- "elastalert_modules.wechat_qiye_alert.WeChatAlerter"
#- "email"

#设置微信企业号的appid
corp_id: xxxxx
#设置微信企业号的Secret
secret: xxxxxx
#设置微信企业号应用id
agent_id: xxxxx
#部门id
party_id: 
#用户微信号
user_id: xxxxxx
# 标签id
tag_id: 

```  


## 三 启动   

启动预警服务：   

```  
python -m elastalert.elastalert --verbose --rule example_rules/mytest_frequency-weixin.yaml 

```  

### 错误处理  
1. EAException异常未定义     
启动后，运行时异常，EAException没有被定义：  
__解决办法：__  
 修改`wechat_qiye_alert.py`文件，头部添加引用：  
``` python
from elastalert.util import EAException
```  
2. ssl认证问题   
启动后检查到异常，进行alert时，报异常：  
```
send message has error: ("bad handshake: Error([('SSL routines', 'SSL3_GET_SERVER_CERTIFICATE', 'certificate verify failed')],)",)    
```
__解决办法:__  
修改`wechat_qiye_alert.py`文件,在`postData`时，设置`verify=False`：  
```  python 
response = requests.post(send_url, data=json.dumps(payload, ensure_ascii=False), headers=headers,verify=False)
``` 
> 此办法应该不是最佳解决方案，网上一般的说法是证书策略有问题，可能需要更新证书。 
[参见:ssl-error-routinesssl3-get-server-certificatecertificate-verify-failed](https://stackoverflow.com/questions/17084886/ssl-error-routinesssl3-get-server-certificatecertificate-verify-failed)  


## 四 测试    
```  
$ curl -X POST "http://192.168.6.166:9200/filebeat-2017.06.13/test"  -d '{
"@timestamp": "2017-06-13T05:38:46.000Z",
"message": "post a error msg5 - weixin"
}'

# 返回{
    "_index": "filebeat-2017.06.13",
    "_type": "test",
    "_id": "AVyf98ISYhdRXc1PZtm5",
    "_version": 1,
    "result": "created",
    "_shards": {
        "total": 2,
        "successful": 1,
        "failed": 0
    },
    "created": true
} 
```

