const { Sequelize, DataTypes } = require('sequelize')

module.exports = (Sequelize, DataTypes) => {
    const Contact = Sequelize.define('Contact', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        FullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        Message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        Date: {
            type: DataTypes.STRING,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        }
    }, {
        modelName: "Contact",
        tableName: "Contact",
        timestamps: true,
    })

    return Contact;
}