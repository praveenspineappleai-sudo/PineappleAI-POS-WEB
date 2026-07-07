// developed by G.Sabisan start 25/2/2025 to 25/2/2025

"use strict";

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      category_name: {
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
      tableName: "categorys",
      timestamps: true,
      underscored: true,
    }
  );

  Category.associate = (models) => {
    Category.hasMany(models.Product, { foreignKey: "categorys_id" });
  };

  return Category;
};