// developed by G.Sabisan start 27/2/2025 to 27/2/2025

"use strict";

module.exports = (sequelize, DataTypes) => {
  const Color = sequelize.define(
    "Color",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      colour_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "colors",
      timestamps: true,
      underscored: true,
    }
  );

  // Define association inside the model
  Color.associate = (models) => {
    // Establish a one-to-many relationship between Color and Price
    // One color can have multiple price entries
    Color.hasMany(models.Price, { foreignKey: "color_id" });
  };

  return Color;
};
