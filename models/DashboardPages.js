const { Sequelize, DataTypes } = require('sequelize')

module.exports = (Sequelize, DataTypes) => {
    const DashboardPage = Sequelize.define('DashboardPage',
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Icon: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            PageName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            PageURL: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Status: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            }
        },
        {
            timestamps: true,
            underscrored: true,
            modelName: "DashboardPage",
            tableName: "DashboardPage",
        }
    )

    return DashboardPage
}