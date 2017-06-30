
'use strict'

var config = require('../config');
var Sequelize = require('sequelize');
var db = {
    sequelize:new Sequelize(config.sequelize.database,config.sequelize.username,config.sequelize.password,config.sequelize)
};
db.User = db.sequelize.import('../model/user.js');
db.Team = db.sequelize.import('../model/team.js');

db.User.belongsTo(db.Team);
db.Team.hasMany(db.User);

module.exports = db;







