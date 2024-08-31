const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
  const Gallery = Sequelize.define(
    "Gallery",
    {
      Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: DataTypes.STRING,
      },
      Imagepath: {
        type: DataTypes.STRING,
      },
    },
    {
      modelName: "Gallery",
      tableName: "Gallerys",
      timestamps: true,
      underscrored: true,
    }
  );

  return Gallery;
};
