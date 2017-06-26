/**
 * Created by 98892 on 2017/6/22.
 */

'use strict';
/**
 * 已发送的log id管理类
 */

const config = require('../configs');

let maxcount = config.alertConfig.send_array_maxcount;

var Readed = (function () {
    function Readed() {

    }

    //已读日志id集合
    Readed.ReadedIds = [];

    /**
     * push已读id到集合
     * @param ids array数组对象
     */
    Readed.pushIds = function (ids) {
        var noReads= Readed.filterNoRead(ids);
        Readed.ReadedIds =  Readed.ReadedIds.concat(noReads);
        if (Readed.ReadedIds.length > maxcount) {
            let removeCount = Readed.ReadedIds.length - maxcount;
            Readed.ReadedIds.splice(0, removeCount);
        }
    };

    /**
     * 判断id是否已读
     * @param id
     * @returns {boolean}
     */
    Readed.hadRead = function (id) {
        return Readed.ReadedIds.includes(id);
    };

    /**
     * 过滤出未读id
     * @param ids
     * @returns {T}
     */
    Readed.filterNoRead = function (ids) {
       return ids.filter(t => !Readed.ReadedIds.includes(t));
    };
    return Readed;
}());


module.exports = Readed;