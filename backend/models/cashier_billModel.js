// models/cashier_billModel.js
// CashierBill Model Definition
module.exports = (sequelize, DataTypes) => {
  const CashierBill = sequelize.define(
    "CashierBill",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      order_no: {
        // ✅ Ensure you are using order_no
        type: DataTypes.STRING,
        allowNull: false,
      },
      cashier_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      discounted_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discounting_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      discounting_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      paid_amount: {                     // ✅ ADD THIS
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
    },
    {
      tableName: "bills",
      timestamps: true,
      underscored: true,
    }
  );

  // 🔗 Associations
  CashierBill.associate = (models) => {
    CashierBill.belongsTo(models.CashierOrder, {
      foreignKey: "order_no", // ✅ use existing column in bills table
      targetKey: "order_no", // ✅ match with order_no in orders table
      as: "order", // ✅ alias to use in includes
      onDelete: "CASCADE",
    });
  };

  return CashierBill;
};
