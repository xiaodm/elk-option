/**
 * Created by 98892 on 2017/6/14.
 */

'use strict';
var prettyjson = require('../utils/json.human');

const config = require('../configs');
const log = require('../configs/logconfig');
const email_config = config.alertConfig.alert.email;
function email_alert() {
    this.alert = function (es_resp,success) {
        let nodemailer = require('nodemailer');
        let transporter = nodemailer.createTransport({
            //https://github.com/andris9/nodemailer-wellknown#supported-services 支持列表
            service: email_config.smtp_host,
            port: email_config.smtp_port, // SMTP 端口
            secureConnection: true, // 使用 SSL
            auth: {
                user: email_config.smtp_auth_user,
                //这里密码不是密码，是你设置的smtp密码
                pass: email_config.smtp_auth_pwd
            }
        });

        let hitsCount = es_resp.hits.total;
        let ids = es_resp.hits.hits.map(t => t._id).join(';&nbsp;');

        let mailContent = `您好，日志平台发现预警信息${hitsCount}条：<br/>
&nbsp;&nbsp; &nbsp; &nbsp;IDs:${ids}<br/>
其中一条错误详细日志为(其他请到日志平台查看)：<br/>`;

        mailContent +=   prettyjson.formatJson(JSON.stringify(es_resp.hits.hits[0])).replace(/\n/g, '<br>').replace(/\\?\\n/g, '<br>');
        // mial options
        let mailOptions = {
            from: email_config.from_addr, // 发件地址
            to: email_config.to, // 收件列表
            subject: email_config.subject, // 标题
            html: mailContent // html 内容
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                log.error(error);
            }
            success();
            log.info('Message sent success ' + info);
        });
    };
}

module.exports = email_alert;