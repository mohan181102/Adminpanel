const { Sequelize, DataTypes } = require("sequelize")

module.exports = (Sequelize, DataTypes) => {
    const VideoMaster = Sequelize.define("VideoMaster", {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        URL: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        Priority: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }

    }, {
        timestamps: true,
        modelName: "VideoMaster",
        tableName: "VideoMasters",
        underscrored: true,
    })

    return VideoMaster;
}