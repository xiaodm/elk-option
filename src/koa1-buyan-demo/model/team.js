/**
 * Created by 98892 on 2017/5/25.
 */
'use strict';

module.exports = function(sequelize,DataTypes){
    var Team = sequelize.define('team',{
        id:{
            type:DataTypes.UUID,
            primaryKey:true,
            allowNull:false,
            defaultValue:DataTypes.UUIDV1
        },
        name:{
            type:DataTypes.STRING
        }
    },{
        freezeTableName: true
    });

    return Team;
};
