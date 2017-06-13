'use strict'
var schedule = require("node-schedule"); 

schedule.scheduleJob('*/5 * * * * *', function(){  
  //
   console.log('test msg 2');
});  