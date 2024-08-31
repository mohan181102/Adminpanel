const { Sequelize, DataTypes } = require('sequelize')

module.exports = (Sequelize, DataTypes) => {
    const AcademicMaster = Sequelize.define('AcademicMaster',
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            EventTitle: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            EventVideoTitle: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            File: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Status: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                allowNull: false,
            }
        },
        {
            modelName: "AcademicMaster",
            tableName: "AcademicMaster",
            timestamps: true,
        }
    )

    return AcademicMaster
}