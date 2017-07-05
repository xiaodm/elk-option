/**
 * Created by deexiao on 2017/7/4.
 */
let previousUsage = process.cpuUsage();
// { user: 38579, system: 6986 }

// spin the CPU for 500 milliseconds
const now = Date.now();
while (Date.now() - now < 500);

for (let i = 0; i < 5; i++) {
// set 2 sec "non-busy" timeout
    setTimeout(function () {
        /* cpuUsage=process.cpuUsage(previousUsage);
         console.log(cpuUsage);
         previousUsage=cpuUsage;*/

        for (let i = 0; i < 500000000; i++) {
            if (i === 400000000) {
                console.log(process.cpuUsage());

              /*  cpuUsage=process.cpuUsage(previousUsage);
                console.log(cpuUsage);
                previousUsage=cpuUsage;*/
            }
        }

        // { user: 514883, system: 11226 }    ~ 0,5 sec
    }, 2000);
}