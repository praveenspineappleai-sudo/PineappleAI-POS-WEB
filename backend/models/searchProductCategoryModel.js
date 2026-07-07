// developed by G.Sabisan start 26/2/2025 to 27/2/2025

"use strict";

module.exports = (sequelize, DataTypes) => {
  const Product_Category = sequelize.define(
    "Product_Category",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "categorys",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "products",
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
      tableName: "products_categorys",
      timestamps: true,
      underscored: true,
    }
  );

  Product_Category.associate = (models) => {
    Product_Category.belongsTo(models.Category, { foreignKey: "category_id" });
    Product_Category.belongsTo(models.Product, { foreignKey: "product_id" });
  };

  return Product_Category;
};
