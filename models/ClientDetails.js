const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const ClientDetails = sequelize.define('ClientDetails', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        SiteUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        CompanyCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        dbName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        Restriction: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        modelName: "ClientDetail",
        tableName: "ClientDetails",
        timestamps: true,
        hooks: {
            beforeValidate: async (company, options) => {
                if (!company.CompanyCode) {
                    company.CompanyCode = await generateUniqueHexCode();
                }
                if (company.CompanyCode) {
                    company.dbName = await generateDbName(company.dbName, company.CompanyCode)
                }
            },


        }
    });

    async function generateUniqueHexCode() {
        let code;
        let isUnique = false;

        function generateHexCode() {
            return '0x' + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(8, '0');
        }

        while (!isUnique) {
            code = generateHexCode();

            const count = await ClientDetails.count({ where: { CompanyCode: code } });
            if (count === 0) {
                isUnique = true;
            }
        }

        return code;
    }


    async function generateDbName(Name, CompanyCode) {
        return `${Name}_${CompanyCode}`;
    }

    return ClientDetails;
}
