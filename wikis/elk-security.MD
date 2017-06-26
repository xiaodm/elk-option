# ELK的安全策略
由于一些业务特性，我们可能需要将Elasticsearch或kibana的一些访问接口暴露到外网，此时就不得不考虑Elasticsearch的安全问题了。  

[Elasticsearch的勒索事件-2017年初](https://www.oschina.net/news/81125/50-billion-data-deleted-by-elasticsearch-blackmailers)      
```  
截止2017年1月17日，白帽汇通过FOFA系统中的68000余个Elasticsearch进行统计分析，发现目前全球共有9750台存在勒索信息。  
其中此次被删除的数据达到至少500亿条，被删除数据大小至少450TB。  
通过两次勒索情况的对比分析，发现有大概1%的Elasticsearch使用了验证插件，另外有2%则关闭Elasticsearch，现在已经无法访问。  
互联网上公开可访问的Elasticsearch超过68000余台。其中，共有受害总数9750台。

目前全球中受影响最多的为美国4380台，其次是中国第二944台。法国787台，爱尔兰462台，新加坡418台。    
```  

## 针对Elasticsearch安全处理建议
* [腾讯云建议](http://bbs.qcloud.com/thread-26539-1-1.html)    

```  
【安全建议】
方案一：禁止公网对elasticsearch的访问。您可以在控制台使用安全组功能或在CVM主机上使用iptables工具来配置网络访问策略，拒绝来自Internet的访问请求。

方案二：若必须要通过Internet对ElasticSearch进行访问，应采取如下措施：  
1、增加验证，官方推荐并且经过认证的是shield插件，Shield可以通过bin/plugin install [github-name]/[repo-name]形式安装。  
	其他免费插件可使用elasticsearch-http-basic, searchguard。
2、使用Nginx搭建反向代理，通过配置Nginx实现对Elasticsearch的认证。
3、统一升级版本至1.7.1以上。目前在1.7.1以上版本还没有爆出过相关漏洞。
4、禁用脚本功能。另外ElasticSearch 2.x以前的版本使用的脚本语言不具有沙箱功能，  
建议ElasticSearch 1.x和0.x的用户尽快升级；使用ElasticSearch 2.x的用户，其默认脚本语言也是不具有沙箱功能的groovy，应将其从配置中删除。
```
  
* [阿里云建议](http://www.w2bc.com/article/215124)    

```  
但是我收到了阿里发的“【高危漏洞通告】  ElasticSearch  未授权访问漏洞”以下内容邮件：
尊敬的 xxx@xxx.com：
您好,接上级主管部门通知，您的主机123.**.**.**安装有elasticsearch，目前elasticsearch有部分漏洞已被公布，   
存在信息泄露的隐患，请及时整改。如无法整改,经主管单位核实后，根据网络安全法的规定，会有关停主机的风险。
以下整改措施仅供参考：
一、监管部门加固方案
elasticsearch自身安全设置
1、为elasticsearch增加登录验证，可以使用官方推荐的shield插件，该插件为收费插件，  
可试用30天，免费的可以使用elasticsearch-http-basic，searchguard插件。  
插件可以通过运行Biplugin install [github-name]/repo-name。同时需要注意增加验证后，请勿使用弱口令。
2、架设nginx反向代理服务器，并设置http basic认证来实现elasticsearch的登录认证。
3、默认开启的9200端口和使用的端口不对外公布，或架设内网环境。
4、elasticsearch 早期版本在“CVE中文漏洞信息库”网站上已有部分漏洞被披露，建议使用1.7.1以上版本或使用最新版本程序。  
```  

## 这里我们选择的安全策略  
使用searchguard插件，针对elasticsearch进行ssl+http basic认证。
### 部署结构  
![elk-security](imgs/ELK-security.png)  
### [Search Guard安装配置过程](searchguard.MD)
