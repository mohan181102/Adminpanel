const { Sequelize, DataTypes } = require('sequelize')

module.exports = (Sequelize, DataTypes) => {
    const DashboardCard = Sequelize.define('DashboardCard',
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Icon: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            CardName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            Pageurl: {
                type: DataTypes.STRING,
                allowNull: false
            },
            CardColor: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            TableName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            TableCondition: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            NewTab: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Priority: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            }
        },
        {
            timestamps: true,
            underscrored: true,
            modelName: "DashboardCard",
            tableName: "DashboardCard",
        }
    )


    return DashboardCard
}