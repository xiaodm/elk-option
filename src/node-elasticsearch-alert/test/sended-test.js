/**
 * Created by 98892 on 2017/6/22.
 */


var sended=require('../alerts/sended');



sended.pushIds(['1','2','3']);

console.log(sended.ReadedIds);
sended.pushIds(['1','2','4','5','6','7','8']);
console.log(sended.ReadedIds);

console.log(sended.hadRead('11'));

console.log(sended.filterNoRead(['2','5','8','111']));