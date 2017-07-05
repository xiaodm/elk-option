/**
 * Created by deexiao on 2017/7/4.
 */
let perfor=require('../utils/performance');
perfor();

setInterval(function () {
    for (let i = 0; i < 5000000000; i++) {
        if (i === 400000000) {

        }
    }

    // { user: 514883, system: 11226 }    ~ 0,5 sec
}, 2000);