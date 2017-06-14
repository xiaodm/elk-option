/**
 * Created by 98892 on 2017/6/14.
 */
var request = require("request");
const log = require('../configs/logconfig');

var RequestUtil=(function () {
    function RequestUtil() {
    }

    RequestUtil.getDataByRequest = function (url, callback) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(body);
            }
            else {
                log.error('getDataByRequest fail:'+error);
            }
        });
    };
    RequestUtil.postDataByRequest = function (url, data, callback) {
        request.post({
            url: url,
            body: data,
            json: true,
            headers: { "content-type": "application/json" }
        }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return log.error('upload failed:'+ err);
            }
            log.info('post successful!  Server responded with:', body);
            if (callback != null) {
                callback(body);
            }
        });
    };

    return RequestUtil;
    
}());

module.exports=RequestUtil;