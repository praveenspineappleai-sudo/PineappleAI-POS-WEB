// developed by G.Sabisan start 4/3/2025 to 4/3/2025

"use strict";

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      order_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensure order_no is unique
      },
      ordered_total_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      price_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "prices",
          key: "price_id",
        },
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "customers",
          key: "id",
        },
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      ordered_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "orders",
      timestamps: true,
      underscored: true,
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.Price, {
      foreignKey: "price_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });


    Order.belongsTo(models.Customer, { foreignKey: "customer_id" });
    Order.hasOne(models.Bill, {
      foreignKey: "order_no",
      sourceKey: "order_no",
    }); // Specify sourceKey
  };

  return Order;
};
