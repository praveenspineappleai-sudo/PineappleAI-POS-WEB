// // Developed by M.Vaishnavi start 01/4 end 02/4

// module.exports = (sequelize, DataTypes) => {
//   // Define the Barcode model
//   const Barcode = sequelize.define(
//     "Barcode",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true, // Sets this field as the primary key
//         autoIncrement: true, // Auto-increment the ID field
//         allowNull: false, // This field cannot be null
//       },
//       barcode_no: {
//         type: DataTypes.STRING, // Barcode number is a string
//         allowNull: false, // Barcode number cannot be null
//         unique: true, // Ensures that the barcode number is unique in the database
//       },
//       barcode_image: {
//         type: DataTypes.STRING, // This stores the file path of the barcode image
//         allowNull: true, // This field is optional (can be null)
//       },
//     },
//     {
//       tableName: "barcodes", // The name of the table in the database
//       timestamps: true, // Automatically includes createdAt and updatedAt fields
//       createdAt: "created_at", // Renames the default createdAt field
//       updatedAt: "updated_at", // Renames the default updatedAt field
//     }
//   );

//   // Associate Barcode with Product model using foreign key
//   Barcode.associate = function (models) {
//     //Barcode.belongsTo(models.Product, { foreignKey: "product_id", onDelete: "CASCADE" });
//     Barcode.hasMany(models.Price, {
//       foreignKey: "barcode_id",
//       onDelete: "CASCADE",
//       hooks: true,
//     });
//   };

//   return Barcode;
// };



// Developed by M.Vaishnavi start 01/4 end 02/4

module.exports = (sequelize, DataTypes) => {
  // Define the Barcode model
  const Barcode = sequelize.define(
    "Barcode",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      barcode_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      barcode_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "barcodes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Associations
Barcode.associate = function (models) {
  Barcode.hasMany(models.CashierPrice, {
    foreignKey: "barcode_id",
    as: "prices", // ✅ alias
    onDelete: "CASCADE",
    hooks: true,
  });
};


  return Barcode;
};
