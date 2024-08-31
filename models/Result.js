const { Sequelize, DataTypes } = require('sequelize')


module.exports = (sequelize, DataTypes) => {
    const Result = sequelize.define("Result", {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        EventTitle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        URL: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        File: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Status: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    },
        {
            timesstamp: true,
            modelName: "Result",
            tableName: "Result",

        }
    )

    return Result
}