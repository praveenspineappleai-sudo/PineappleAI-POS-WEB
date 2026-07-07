// //developed by Janarthan    06/03/2025

// module.exports = (sequelize, DataTypes) => {
//   const CashierProduct = sequelize.define(
//     "CashierProduct",
//     {
//       id: {
//         type: DataTypes.BIGINT,
//         primaryKey: true,
//         autoIncrement: true,
//         allowNull: false,
//       },
//       name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       description: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       categorys_id: {
//         type: DataTypes.BIGINT,
//         allowNull: false,
//       },
//       created_at: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
//       },
//       updated_at: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: sequelize.literal(
//           "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
//         ),
//       },
//     },
//     {
//       tableName: "products", // Ensure this matches your actual table name
//       timestamps: false, // Set to true if you're using Sequelize's default timestamp fields
//     }
//   );

//   // // A Product can have multiple Price records (One-to-Many relationship)
//   // db.Product.hasMany(db.Price, { foreignKey: "product_id" });
//   // db.Price.belongsTo(db.Product, { foreignKey: "product_id" }); // Each Price record belongs to a single Product

//   CashierProduct.associate = (models) => {
//     CashierProduct.hasMany(models.CashierPrice, { foreignKey: "product_id" });
//     CashierProduct.belongsToMany(models.CashierOrder, {
//       through: "OrderProduct",
//       foreignKey: "productId",
//     });
//     //Product.belongsTo(models.Category, { foreignKey: "category_id" });
//   };

//   return CashierProduct;
// };



module.exports = (sequelize, DataTypes) => {
  const CashierProduct = sequelize.define(
    "CashierProduct",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      categorys_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    },
    {
      tableName: "products",
      timestamps: false,
    }
  );

  CashierProduct.associate = (models) => {
    CashierProduct.hasMany(models.CashierPrice, {
      foreignKey: "product_id",
      as: "prices", // ✅ alias must match the opposite side alias use
    });

    CashierProduct.belongsToMany(models.CashierOrder, {
      through: "OrderProduct",
      foreignKey: "productId",
    });
  };

  return CashierProduct;
};
