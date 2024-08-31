const { DataTypes } = require("sequelize");
const sequelize = require("../config");

module.exports = (sequelize, DataTypes) => {
    const CompanyUserList = sequelize.define("CompanyUserList",
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            AllUserId: {
                type: DataTypes.JSON,
                allowNull: false
            },
            CompanyId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            BlacklistedCompanyId: {
                type: DataTypes.JSON,
                allowNull: true
            }
        }
    )

    return CompanyUserList
}