const { Sequelize, DataTypes } = require('sequelize');


module.exports = (Sequelize, DataTypes) => {
    const Clients = Sequelize.define('Clients',
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Details: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            URL: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Image: {
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
            modelName: "Client",
            tableName: "Client",
            timestamps: true,
        }
    )

    return Clients
}