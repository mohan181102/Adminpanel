const { DataTypes, Sequelize } = require('sequelize')


module.exports = (sequelize, DataTypes) => {
    const TCIssued = sequelize.define("TCIssued",
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Studentname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Fathersname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Mothersname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            DOB: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            AdmissionNo: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ClassLeft: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            TCNo: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            LeavingDate: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Remark: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            LINK: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            }

        }, {
        timestamps: true,
        modelName: "TCIssued",
        tableName: "TCIssued",
        underscrored: true,
    }
    )

    return TCIssued;

}