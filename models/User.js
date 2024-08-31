const { Sequelize, DataTypes } = require('sequelize')


module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User',
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            Username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            Password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            Role: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'staff'
            },
            AllowField: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
            },
            Token: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },
        {
            timestamps: true,
            modelName: "User",
            tableName: "Users",
            underscrored: true,
        }
    )

    return User;
}