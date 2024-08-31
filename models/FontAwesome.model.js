const { Sequelize, DataTypes } = require("sequelize")


module.exports = (Sequelize, DataTypes) => {
    const FontAwesome = Sequelize.define("FontAwesome",
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            FontName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            FontValue: {
                type: DataTypes.STRING,
                allowNull: false
            },
        },
        {
            modelName: "FontAwesome",
            tableName: "FontAwesome",
            timestamps: true,
            underscrored: true,
        }
    )
    return FontAwesome;
}