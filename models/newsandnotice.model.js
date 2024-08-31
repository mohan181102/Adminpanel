const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
  const NewsNotice = Sequelize.define(
    "NewsNotice",
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
      Description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      ImagePath: {
        type: DataTypes.STRING, // Assuming you'll store the path to the image file
        allowNull: true,
      },
      Status: {
        type: DataTypes.BOOLEAN, // Assuming Status is a boolean value
        allowNull: false,
      },
      Type: {
        type: DataTypes.ENUM("News", "Notice"), // Using ENUM for Type field with predefined values
        allowNull: false,
      },
    },
    {
      modelName: "NewsNotice",
      tableName: "NewsNotices",
      timestamps: true,
      underscrored: true,
    }
  );
  return NewsNotice;
};
