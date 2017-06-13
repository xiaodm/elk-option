'use strict'
const elasticsearch = require('elasticsearch');
 
 var bunyan = require('bunyan');
var log = bunyan.createLogger({
    src: true,
    name: 'trace-es',
    streams: [{
        path: 'logs/trace.log',
        // `type: 'file'` is implied
    }]
});


var client = new elasticsearch.Client({
  host: '192.168.6.166:9200',
  httpAuth:"elastic:changeme",
  log: 'trace'
});  

client.search({
  index: 'filebeat-2017.06.13',
  type: 'test',
  body: {
    query: {
      match: {
        message: 'error'
      }
    }
  }
}).then(function (resp) {
    var hits = resp.hits.hits;
    hits.forEach(function(element) {
        log.info(element);
    }, this);
    
}, function (err) {
    console.trace(err.message);
});

