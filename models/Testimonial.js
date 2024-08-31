const { Sequelize, DataTypes } = require("sequelize")


module.exports = (Sequelize, DataTypes) => {
    const Testimonial = Sequelize.define(
        "Testimonial", {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Designation: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Details: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        URL: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Priority: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        Status: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        timestamps: true,
        modelName: "Testimonial",
        tableName: "testimonials",
        underscrored: true,
    }
    )

    return Testimonial;
}