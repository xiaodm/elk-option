# Elastalert安装配置  
## 参考  
1. [ElastAlert Github](https://github.com/Yelp/elastalert) 
2. [ElastAlert Doc](http://elastalert.readthedocs.org/) 
3. [ElastAlert 基于Elasticsearch的监控告警之Email报警](http://www.jianshu.com/p/3542c5c52123)  

## 依赖  
* Elasticsearch
* ISO8601 or Unix timestamped data
* Python 2.6 or 2.7
* pip, see requirements.txt    
* Packages on Ubuntu 14.x: 
    - python-pip 
    - python-dev 
    - libffi-dev 
    - libssl-dev

## 一 安装pip  
参见[pip官网](https://pip.pypa.io/en/stable/installing/)  
### 下载get-pip.py  
[get-pip.py下载地址](https://bootstrap.pypa.io/get-pip.py)  
### 安装pip    
```  
python get-pip.py  
```    

## 二 安装elastalert  
###  1. 下载ealstalert源码
可先从`git`下载最新的[ealstalert安装包](https://github.com/Yelp/elastalert.git)      
压缩为tar.gz后拷贝到服务器。

###  2. 安装      
```  
python setup.py install  
```  
* 问题1-安装依赖报错：  
```  
Installed /usr/lib/python2.7/site-packages/elastalert-0.1.14-py2.7.egg
Processing dependencies for elastalert==0.1.14
Searching for twilio<6.1,>=6.0.0
Reading https://pypi.python.org/simple/twilio/
Download error on https://pypi.python.org/simple/twilio/: [Errno -2] Name or service not known -- Some packages may not be found!
Couldn't find index page for 'twilio' (maybe misspelled?)
Scanning index of all packages (this may take a while)
Reading https://pypi.python.org/simple/
Download error on https://pypi.python.org/simple/: [Errno -2] Name or service not known -- Some packages may not be found!
No local packages or working download links found for twilio<6.1,>=6.0.0
error: Could not find suitable distribution for Requirement.parse('twilio<6.1,>=6.0.0')    
```   
__解决办法：需要先安装依赖包。__

###  3. 安装依赖
 
```  
 pip install -r requirements.txt  
```    

* 问题2-报错：  
> unable to execute gcc: No such file or directory
    error: command 'gcc' failed with exit status 1      

  - 解决方式：   
安装`gcc`:  
```  
  yum install -y gcc  
```  

* 问题3-报错：    
```  
I/usr/include/python2.7 -c blist/_blist.c -o build/temp.linux-x86_64-2.7/blist/_blist.o
    blist/_blist.c:38:20: fatal error: Python.h: No such file or directory
     #include <Python.h>
                        ^
    compilation terminated.
    error: command 'gcc' failed with exit status 1      
```    

  - 解决方式：   
安装`python-devel`:  
```  
  yum install -y python-devel  
```  

* 问题4-报错：  
```  
 build/temp.linux-x86_64-2.7/_openssl.c:434:30: fatal error: openssl/opensslv.h: No such file or directory  
```  
  - 解决方式：   
安装`openssl-devel`。最上面的依赖项有`libssl-dev`,但在centos上是`openssl-devel`:  
```  
  yum install openssl-devel 
```    
* 再执行依赖安装  
成功执行：  
```  
 pip install -r requirements.txt  
```      

###  4. 安装elastalert 
依赖安装后，再次执行安装： 
```  
python setup.py install  
```       


##  三 设置elasticsearch索引    
### 1. 先启动elasticsearch（略）  
### 2. 设置elasticsearch索引   
```  
$ elastalert-create-index    
New index name (Default elastalert_status)
Name of existing index to copy (Default None)
New index elastalert_status created
Done!
```    

##  四 设置配置文件和规则Rule  

### 1. 修改配置文件  

```  
cd   /usr/local/elk-extend/elastalert  
cp config.yaml.example config.yaml  

vi config.yaml  
```  
```  
# This is the folder that contains the rule yaml files
# Any .yaml file will be loaded as a rule
rules_folder: example_rules

# How often ElastAlert will query Elasticsearch
# The unit can be anything from weeks to seconds
run_every:
  minutes: 1

# ElastAlert will buffer results from the most recent
# period of time, in case some log sources are not in real time
buffer_time:
  minutes: 15

# The Elasticsearch hostname for metadata writeback
# Note that every rule can have its own Elasticsearch host
es_host: localhost

# The Elasticsearch port
es_port: 9200

# The AWS region to use. Set this when using AWS-managed elasticsearch
#aws_region: us-east-1

# The AWS profile to use. Use this if you are using an aws-cli profile.
# See http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html
# for details
#profile: test

# Optional URL prefix for Elasticsearch
#es_url_prefix: elasticsearch

# Connect with TLS to Elasticsearch
#use_ssl: True

# Verify TLS certificates
#verify_certs: True

# GET request with body is the default option for Elasticsearch.
# If it fails for some reason, you can pass 'GET', 'POST' or 'source'.
# See http://elasticsearch-py.readthedocs.io/en/master/connection.html?highlight=send_get_body_as#transport
# for details
#es_send_get_body_as: GET

# Option basic-auth username and password for Elasticsearch
es_username: elastic
es_password: changeme

# The index on es_host which is used for metadata storage
# This can be a unmapped index, but it is recommended that you run
# elastalert-create-index to set a mapping
writeback_index: elastalert_status

# If an alert fails for some reason, ElastAlert will retry
# sending the alert until this time period has elapsed
alert_time_limit:
  days: 2

```    

### 2. 创建规则  

这里配置使用`Email`发送预警：  

```
cd example_rules  
cp example_frequency.yaml  mytest_frequency.yaml  

vi mytest_frequency.yaml
```  
mytest_frequency.yaml修改如下，设置5分钟内如果发现2次messange内有error信息则发送email：
```    
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
name: Example frequency rule

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
  minutes: 5

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

      #SMTP协议的邮件服务器相关配置
#smtp.163.com是网易163邮箱的smtp服务器
#登陆163邮箱后，找到 【设置】>【POP3/SMTP/IMAP】>开启，然后设置【客户端授权密码】
smtp_host: smtp.126.com
smtp_port: 25

#用户认证文件，需要user和password两个属性
#注意将${userName}替换成具体用户名
smtp_auth_file: /usr/local/elk-extend/elastalert/example_rules/smtp_auth_file.yaml
#回复给那个邮箱
email_reply_to: xxxxx@126.com
#从哪个邮箱发送
from_addr: xxxxx@126.com

# (Required)
# The alert is use when a match is found
alert:
- "email"

# (required, email specific)
# a list of email addresses to send alerts to
email:
- "xxxx@qq.com"

```    


### 3. 创建规则smtp认证文件      
```
vi /usr/local/elk-extend/elastalert/example_rules/smtp_auth_file.yaml   
```  
编辑内容如下：  
```    
#发送邮件的邮箱
user: xxxxx@126.com
#认证密码
password: xxxxxx
```    

### 4. 测试规则 
```  
elastalert-test-rule /XXXXXX/mytest_frequency.yaml  
```  

### 5. 运行  
```    
$ cd /usr/local/elk-extend/elastalert
$ python -m elastalert.elastalert --verbose --rule example_frequency.yaml  
```

### 6. 测试  
```  
$ curl -X POST "http://xxxxxx:9200/filebeat-2017.06.12/test"  -d '{
"@timestamp": "2017-06-12T07:38:46.000Z",
"message": "post a error msg1"
}'

# 返回 {
  "_index": "filebeat-2017.06.12",
  "_type": "test",
  "_id": "AVybP2KGyzSik6XRyhKz",
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














