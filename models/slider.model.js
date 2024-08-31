const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
  const Slider = Sequelize.define(
    "Slider",
    {
      Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      SliderName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Imagepaths: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      modelName: "Slider",
      tableName: "Sliders",
      timestamps: true,
      underscrored: true,
    }
  );
  return Slider;
};
