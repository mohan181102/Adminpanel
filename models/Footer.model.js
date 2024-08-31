const { Sequelize, DataTypes } = require('sequelize')

module.exports = (Sequelize, DataTypes) => {
    const Footer = Sequelize.define('Footer',
        {
            Id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            Title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Priority: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Bgcolor: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            TextContent: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        },
        {
            modelName: "Footer",
            tableName: "Footer",
            timestamps: true,
            underscrored: true,
        }
    )

    return Footer
}