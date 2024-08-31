const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const AdvertisementMaster = Sequelize.define(
        "AdvertisementMaster",
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Category: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            AdvertisementName: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            URL: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            Imagepaths: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
            },

            Priority: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            Description: {
                type: DataTypes.STRING,
                allowNull: true,
            },

        },
        {
            modelName: "AdvertisementMaster",
            tableName: "AdvertisementMasters",
            timestamps: true,
            underscrored: true,
        }
    );
    return AdvertisementMaster;
};