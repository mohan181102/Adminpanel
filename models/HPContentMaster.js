const { Sequelize, DataTypes } = require('sequelize')

module.exports = (Sequelize, DataTypes) => {
    const HPContentMaster = Sequelize.define("HPContentMaster",
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            Title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            Priority: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            BgColor: {
                type: DataTypes.STRING,
                allowNull: false
            },
            Status: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            Content: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            timestamps: true,
            modelName: "HPContentMaster",
            tableName: "HPContentMasters",
            underscrored: true,
        }
    )

    return HPContentMaster;
}