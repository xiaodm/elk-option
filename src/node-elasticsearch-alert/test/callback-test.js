/**
 * Created by 98892 on 2017/6/22.
 */

const requestUtil = require('../utils/request_util');
/*
 // 变量被修改，即并发错误使用
 let a = 0;
 for (let i = 0; i < 10; i++) {
 a += i;
 requestUtil.getDataByRequest("http://www.zhihu.com/question/23594158", function (data) {
 console.log(a);
 });

 }
 */


// 解决方法一、使用闭包避免作用域污染
/*let a1 = 0;
 for (let i = 0; i < 10; i++) {
 a1 += i;
 (function (t1) {
 requestUtil.getDataByRequest("http://www.zhihu.com/question/23594158?" + i, function (data) {
 console.log(t1);
 });
 })(a1);
 }*/





// 简单做法就是把异步方法单独到一个方法即可
let a2 = 0;
for (let i = 0; i < 10; i++) {
    a2 += i;
    md(i, a2);
}

function md(i, a) {
    requestUtil.getDataByRequest("http://www.zhihu.com/question/23594158?" + i, function (data) {
        console.log(a);
    });
}
