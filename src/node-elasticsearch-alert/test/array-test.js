/**
 * Created by 98892 on 2017/6/22.
 */


var arr=['1','2','3','4'];


for(let i=5;i<10;i++)
{
    arr.push(i.toString());
}

console.log('arr 0:'+ arr[0]);
console.log('arr 1:'+ arr[1]);
arr.splice(0,3);
console.log(arr);