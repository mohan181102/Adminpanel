const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
  const FlashNews = Sequelize.define(
    "FlashNews",
    {
      Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      FlashNews: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      Priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Status: {
        type: DataTypes.BOOLEAN, // Assuming Status is a boolean value
        allowNull: false,
      },
    },
    {
      modelName: "FlashNews",
      tableName: "FlashNews's",
      timestamps: true,
      underscrored: true,
    }
  );
  return FlashNews;
};
