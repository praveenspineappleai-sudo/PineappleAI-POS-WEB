"use strict";

module.exports = (sequelize, DataTypes) => {
  const Bill = sequelize.define(
    "Bill",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      order_no: {
        type: DataTypes.STRING, // Match the data type with Order model
        allowNull: false,
        references: {
          model: "Order", // References the 'Order' table
          key: "order_no", // Links to the 'order_no' column in the referenced table
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      discounted_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      discounting_percentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
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
      tableName: "bills",
      timestamps: true,
      underscored: true,
    }
  );

  Bill.associate = (models) => {
    Bill.belongsTo(models.Order, {
      foreignKey: "order_no",
      targetKey: "order_no",
    }); // Specify targetKey
  };

  return Bill;
};
