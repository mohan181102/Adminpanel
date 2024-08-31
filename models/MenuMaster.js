const { Sequelize, DataTypes } = require('sequelize')

module.exports = (Sequelize, DataTypes) => {
    const MenuMaster = Sequelize.define("MenuMaster",
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Category_sub: {
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
            TextArea: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Priority: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            GruopName: {
                type: DataTypes.STRING,
                allowNull: true
            },
            Status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            }
        },
        {
            modelName: "MenuMaster",
            tableName: "MenuMasters",
            timestamps: true,
            underscrored: true,
        }
    )

    return MenuMaster
}