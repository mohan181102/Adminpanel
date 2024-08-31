const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
  const ProductCategoryMaster = Sequelize.define(
    "ProductCategoryMaster",
    {
      Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      CategoryName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      URL: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      Imagepaths: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },

      Priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      ShowOnCategory: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      ShowCategoryList: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },

      Status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      Description: {
        type: DataTypes.STRING, // Assuming you want to store rich text
        allowNull: true, // Adjust as per your requirement
      },

    },
    {
      modelName: "ProductCategoryMaster",
      tableName: "ProductCategoryMasters",
      timestamps: true,
      underscrored: true,
    }
  );
  return ProductCategoryMaster;
};