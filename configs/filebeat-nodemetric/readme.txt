1. filebeat.template-nodemetric.json  其实不需要做属性配置，只要指定  "template": "filenodemetric-*"就行了。
2. filebeat.yml内设置json格式就行了：
     json.keys_under_root: true
  
     tags: ['json']
