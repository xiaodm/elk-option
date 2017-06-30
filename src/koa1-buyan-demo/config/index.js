
'use strict'

var all = {
    sequelize:{
        username: 'root',
        password: '123456',
        database: 'test',
        host: "192.168.6.163",
        dialect: 'mysql',
        define: {
            underscored: false,
            timestamps: true,
            paranoid: true
        }
    }
};

module.exports = all;





