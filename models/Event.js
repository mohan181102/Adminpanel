const { Sequelize, DataTypes } = require("sequelize")

module.exports = (Sequelize, DataTypes) => {
    const Event = Sequelize.define(
        "Event",
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            EventTitle: {
                type: DataTypes.STRING,
            },
            Imagepath: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
            },
            Priority: {
                type: DataTypes.INTEGER,
            },
            Status: {
                type: DataTypes.BOOLEAN
            },
        },
        {
            modelName: "Event",
            tableName: "Events",
            timestamps: true,
            underscrored: true,
        }
    );

    return Event;
};
