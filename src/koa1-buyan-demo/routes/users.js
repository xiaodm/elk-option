var router = require('koa-router')();

//var log = require('../logconfig').userlog;

var db = require('../sqldb');
var User = db.User;

router.get('/', function *(next) {
    try {
        var u1 = yield User.findAndCountAll();
        this.body = u1;
    } catch (error) {
        this.log.error(error);
        //set error oode
        this.body = 'has some mysql  error';
    }
});
router.post('/', function *(next) {
    var req = this.request;
    var res = this.response;
    this.log.info("+++++++++++++++++++++++");
    var saveUser = {
        name: req.body.name,
        age: req.body.age,
        height: req.body.height,
        weight: req.body.weight
    };

    this.log.info("+++++++++++++++++++");

    try {
        let rlt = yield User.create(saveUser);
    } catch (error) {
        this.log.error(error);
    }

    this.body = rlt;
});


router.get('/:userid', function *(next) {
    //this.log.info('info', 'Test Log Message', { anything: 'This is metadata' });

    let id = this.params.userid;
    this.log.info({userid: id}, `start get user info userid:${id}`);
    try {
        let rlt = yield getUser(id);
        this.body = rlt;
    } catch (error) {
        this.log.error(error);
        //set error code
        this.status = 500;
        this.body = 'has error';
    }
});

function* getUser(id) {
    throw new Error('has error happened,i thorw');
    var u1 = yield User.findOne({
        where: {
            id: id
        }
    });
    return u1;
}

module.exports = router;
