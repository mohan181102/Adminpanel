const { Sequelize, DataTypes } = require('sequelize')


module.exports = (Sequelize, DataTypes) => {
    const PriceMaster = Sequelize.define('PriceMaster',
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            Category: {
                type: DataTypes.STRING,
                allowNull: false
            },
            PlanName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            URL: {
                type: DataTypes.STRING,
                allowNull: false
            },
            Image: {
                type: DataTypes.STRING,
                allowNull: false
            },
            Priority: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            Status: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            TextArea: {
                type: DataTypes.STRING,
                allowNull: false
            },
            GruopName: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },
        {
            modelName: "PriceMaster",
            tableName: "PriceMasters",
            timestamps: true,
            underscrored: true,
        }
    )

    return PriceMaster
}