// // Developed by Janarthan            06/03/2025

// module.exports = (sequelize, DataTypes) => {
//   const CashierPrice = sequelize.define(
//     "CashierPrice",
//     {
//       id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
//       product_id: { type: DataTypes.BIGINT, allowNull: false },
//       Cost_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
//       selling_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
//       size_id: { type: DataTypes.BIGINT, allowNull: true },
//       color_id: { type: DataTypes.BIGINT, allowNull: true },
//       barcode_id: { type: DataTypes.BIGINT, allowNull: false },
//       quantity: { type: DataTypes.INTEGER, allowNull: false },
//       created_at: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
//       },
//       updated_at: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
//       },
//     },
//     {
//       tableName: "prices",
//       timestamps: false,
//       freezeTableName: true,
//     }
//   );

//   CashierPrice.associate = (models) => {
//     // ✅ Added as: "product" alias
//     CashierPrice.belongsTo(models.CashierProduct, { 
//       foreignKey: "product_id",
//       as: "product" 
//     });
    
//     CashierPrice.belongsTo(models.CashierBarcode, { 
//       foreignKey: "barcode_id",
//       as: "barcode" // Added alias for consistency
//     });
//   };

//   return CashierPrice;
// };


module.exports = (sequelize, DataTypes) => {
  const CashierPrice = sequelize.define(
    "CashierPrice",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      product_id: { type: DataTypes.BIGINT, allowNull: false },
      Cost_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      selling_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      size_id: { type: DataTypes.BIGINT, allowNull: true },
      color_id: { type: DataTypes.BIGINT, allowNull: true },
      barcode_id: { type: DataTypes.BIGINT, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "prices",
      timestamps: false,
      freezeTableName: true,
    }
  );

  CashierPrice.associate = function (models) {
  CashierPrice.belongsTo(models.CashierProduct, {
    foreignKey: "product_id",
    as: "product", // ✅ alias
  });

  CashierPrice.belongsTo(models.Barcode, { // ✅ must also declare reverse belongsTo
    foreignKey: "barcode_id",
    as: "barcode",
  });
};


  return CashierPrice;
};
