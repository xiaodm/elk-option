/**
 * Created by 98892 on 2017/6/14.
 */
'use strict';

const elasticsearch = require('elasticsearch');
const log = require('../configs/logconfig');

const config = require('../configs');
const alerts = require('../alerts');
const esConfig = config.alertConfig.elasticsearch;


const client = new elasticsearch.Client({
    host: `${esConfig.es_host}:${esConfig.es_port}`,
    httpAuth: `${esConfig.es_usr}:${esConfig.es_pwd}`,
    log: 'trace'
});

function validate_es() {
    this.validate = function (startTime, endTime) {
        let esFilter = config.alertConfig.filter;
        let start = Date.parse(startTime);
        let end = Date.parse(endTime);

        if (esFilter.body.query.bool.must.length < 2) {
            esFilter.body.query.bool.must.push({
                "range": {
                    "@timestamp": {
                        "gte": start,
                        "lte": end,
                        "format": "epoch_millis"
                    }
                }
            });
        }
        else {
            esFilter.body.query.bool.must[1].range['@timestamp'].gte=start;
            esFilter.body.query.bool.must[1].range['@timestamp'].lte=end;
        }

        let self=this;
        client.search(esFilter).then(function (resp) {
            if (!resp || !resp.hits || !resp.hits.hits || resp.hits.hits.length < 1) {
                log.info(`no result hits between  ${startTime} and ${endTime}`);
            }
            else {
                log.info(`hits ${resp.hits.hits.length} between  ${startTime} and ${endTime}`);
                self.sendAlert(resp);
                /* var hits = resp.hits.hits;
                 hits.forEach(function (element) {
                 log.info(element);
                 }, this);*/
            }

        }, function (err) {
            log.trace(err.message);
        });
    };

    this.sendAlert = function (resp) {
        if (config.alertConfig.alert.email.enabled) {
            new alerts.mail_alert().alert(resp);
        }
        if (config.alertConfig.alert.qiye_weixin.enabled) {
            new alerts.qyweixin_alert().alert(resp);
        }
    }
}

module.exports = validate_es;



