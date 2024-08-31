const { Sequelize, DataTypes } = require("sequelize")


module.exports = (Sequelize, DataTypes) => {
    const PageViewMaster = Sequelize.define("PageViewMaster",
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
            PageName: {
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
            modelName: "PageViewMaster",
            tableName: "PageviewMasters",
            timestamps: true,
            underscrored: true,
        }
    )

    return PageViewMaster
}