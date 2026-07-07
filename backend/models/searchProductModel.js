// developed by G.Sabisan start 26/2/2025 to 27/2/2025

"use strict";

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      categorys_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "categorys",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      tableName: "products",
      timestamps: true,
      underscored: true,
    }
  );

  Product.associate = (models) => {
    Product.hasMany(models.Price, { foreignKey: "product_id" });
    Product.belongsTo(models.Category, { foreignKey: "categorys_id" });
  };

  return Product;
};
