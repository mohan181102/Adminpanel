const { Sequelize, DataTypes } = require('sequelize')

module.exports = (Sequelize, DataTypes) => {
    const CourseMaster = Sequelize.define('CourseMaster', {
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
        Bgcolor: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        TextContent: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        modelName: "CourseMaster",
        tableName: "CourseMaster",
        underscrored: true,
        timestamps: true,
    })

    return CourseMaster;
}

