// // developed by G.Sabisan start 25/2/2025 to 25/2/2025

// 'use strict';

// module.exports = (sequelize, DataTypes) => {
//   const Barcode = sequelize.define('Barcode', {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     barcode_no: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     barcode_image: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     created_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     updated_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//   }, {
//     tableName: 'barcodes',
//     timestamps: true,
//     underscored: true,
//   });

//   return Barcode;
// };

"use strict";

module.exports = (sequelize, DataTypes) => {
  const Barcode = sequelize.define(
    "Barcode",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      timestamps: true, // Sequelize will auto-manage createdAt and updatedAt
      underscored: true, // This ensures created_at / updated_at column names
    }
  );

  return Barcode;
};
