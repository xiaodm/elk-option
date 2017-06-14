'use strict';

const elasticsearch = require('elasticsearch');

const config = require('../configs/index');
const log = require('../configs/logconfig');

const esConfig = config.alertConfig.elasticsearch;


const client = new elasticsearch.Client({
    host: `${esConfig.es_host}:${esConfig.es_port}`,
    httpAuth: `${esConfig.es_usr}:${esConfig.es_pwd}`,
    log: 'trace'
});


let esFilter = config.alertConfig.filter;
esFilter.body.query.bool.must.push({
    "range": {
        "@timestamp": {
            "gte": 1497110400000,
            "lte": 1497715199999,
            "format": "epoch_millis"
        }
    }
});

client.search(esFilter).then(function (resp) {
    var hits = resp.hits.hits;
    hits.forEach(function (element) {
        log.info(element);
    }, this);

}, function (err) {
    log.trace(err.message);
});

