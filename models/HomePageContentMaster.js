const { Sequelize, DataTypes } = require('sequelize')

module.exports = (Sequelize, DataTypes) => {
    const HeaderTopMaster = Sequelize.define('HeaderTopMaster',
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
            Priority: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            BgColor: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            TextArea: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        },
        {
            modelName: "HeaderTopMaster",
            tableName: "HeaderTopMaster",
            timestamps: true,
            underscrored: true,
        }
    )

    return HeaderTopMaster;

}