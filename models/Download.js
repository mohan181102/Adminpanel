const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
  const Download = Sequelize.define(
    "Download",
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
      URL: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Filepath: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Status: {
        type: DataTypes.BOOLEAN, // Assuming Status is a boolean value
        allowNull: false,
      },

    },
    {
      modelName: "Download",
      tableName: "Downloads",
      timestamps: true,
      underscrored: true,
    }
  );
  return Download;
};
