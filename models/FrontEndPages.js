const { Sequelize, DataTypes } = require('sequelize')

module.exports = (Sequelize, DataTypes) => {
    const frontendpage = Sequelize.define('frontendpage',
        {
            Id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            Icon: {
                type: DataTypes.STRING,
                allowNull: false
            },
            PageName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            PageURL: {
                type: DataTypes.STRING,
                allowNull: false
            },
            NewTab: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            Priority: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            Status: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            }
        }
    )

    return frontendpage
}