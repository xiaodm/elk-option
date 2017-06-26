/**
 * Created by 98892 on 2017/6/14.
 */

'use strict';

const config = require('../configs');
const log = require('../configs/logconfig');
const requestUtil = require('../utils/request_util');
const qywx_config = config.alertConfig.alert.qiye_weixin;

function qyweixin_alert() {
    this.alert = function (es_resp,success) {
        // get access token
        let getTokenUrl = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${qywx_config.corp_id}&corpsecret=${qywx_config.secret}`;
        try {
            requestUtil.getDataByRequest(getTokenUrl, function (data) {
                let body = JSON.parse(data);
                if (!body.errcode) {
                    let hitsCount = es_resp.hits.total;
                    let ids = es_resp.hits.hits.map(t => t._id).join('; ');

                    let mailContent = `您好，日志平台发现预警信息${hitsCount}条,IDs:${ids}
其中一条错误详细日志为(其它的请到日志平台查看)：\n`;
                    let detailContent = JSON.stringify(es_resp.hits.hits[0]);
                    mailContent +=   detailContent;
                    mailContent = mailContent.length > 2000 ? (mailContent.substr(0, 1996) + '...') : mailContent;

                    let access_token = body.access_token;
                    // send msg
                    let postUrl = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${access_token}`;
                    let postData = {
                        "touser": qywx_config.user_id,
                        "toparty": "",
                        "totag": "",
                        "msgtype": "text",
                        "agentid": qywx_config.agent_id,
                        "text": {
                            "content": mailContent
                        }
                    };

                    try {
                        requestUtil.postDataByRequest(postUrl, postData,function () {
                            success();
                        });
                    } catch (e) {
                        log.error(e);
                    }

                }
            });
        } catch (e) {
            log.error(e);
        }
    };

}

module.exports = qyweixin_alert;