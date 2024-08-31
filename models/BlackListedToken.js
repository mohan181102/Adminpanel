const { DataTypes } = require("sequelize");
const sequelize = require("../config");

module.exports = (sequelize, DataTypes) => {
    const BlackListToken = sequelize.define("Blacklist",
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            BlackToken: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
            }
        },
        {
            modelName: "Blacklist",
            tableName: "Blacklist"
        }
    )

    return BlackListToken
}   