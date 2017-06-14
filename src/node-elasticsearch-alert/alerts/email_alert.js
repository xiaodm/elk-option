/**
 * Created by 98892 on 2017/6/14.
 */

'use strict';

const config = require('../configs');
const log = require('../configs/logconfig');
const email_config = config.alertConfig.alert.email;
function email_alert() {
    this.alert = function (es_resp) {
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
        let mailContent = JSON.stringify( es_resp.hits.hits[0]);

        // mial options
        let mailOptions = {
            from: email_config.from_addr, // 发件地址
            to: email_config.to, // 收件列表
            subject: email_config.subject, // 标题
            text: 'error log alert', //text 内容
            html: mailContent // html 内容
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                 log.error(error);
            }
            log.info('Message sent success ' + info);

        });
    };
}

module.exports = email_alert;