module.exports = (sequelize, DataTypes) => {
  const CashierOrder = sequelize.define(
    "CashierOrder",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      order_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      customer_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      ordered_total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      ordered_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "orders",
      timestamps: true, // Enables `createdAt` and `updatedAt`
      underscored: true, // Maps `created_at` and `updated_at`
    }
  );

  CashierOrder.associate = (models) => {
    CashierOrder.belongsTo(models.CashierPrice, { 
      foreignKey: "price_id",
      as: "price" // ✅ Added this alias
    });
    
    CashierOrder.hasOne(models.CashierBill, {
      foreignKey: "order_no",
      sourceKey: "order_no",
      as: "bill",
      onDelete: "CASCADE",
    });

    CashierOrder.belongsTo(models.Customer, {
      foreignKey: "customer_id",
      as: "customer",
    });
  };

  return CashierOrder;
};