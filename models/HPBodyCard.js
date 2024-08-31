const { Sequelize, DataTypes } = require("sequelize")

module.exports = (Sequelize, DataTypes) => {
    const HPBodyCard = Sequelize.define("HPBodyCard", {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Heading: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        URL: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Details: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        CardImage: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        CardWidth: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Priority: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Status: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        timestamps: true,
        modelName: "HPBodyCard",
        tableName: "HPBodyCards",
        underscrored: true,
    })

    return HPBodyCard
}