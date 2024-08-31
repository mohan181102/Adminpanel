const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
  const ProductMaster = Sequelize.define(
    "ProductMaster",
    {
      Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Category: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      ProductName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      URL: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      Priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      Status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },

      Price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Details2: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Details3: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Details4: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Details5: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Image1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Image2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Image3: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Image4: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Image5: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Image6: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Image7: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Image8: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Image9: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      modelName: "ProductMaster",
      tableName: "ProductMasters",
      timestamps: true,
      underscrored: true,
    }
  );
  return ProductMaster;
};
