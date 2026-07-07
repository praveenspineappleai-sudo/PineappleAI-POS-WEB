// // models/OwnerDetail.js
// module.exports = (sequelize, DataTypes) => {
//   const OwnerDetail = sequelize.define(
//     "OwnerDetail",
//     {
//       name: { type: DataTypes.STRING, allowNull: false },
//       gender: { type: DataTypes.STRING, allowNull: false },
//       dob: { type: DataTypes.DATE, allowNull: false },
//       phone_number: { type: DataTypes.STRING, allowNull: false, unique: true },
//       phone_verified_at: { type: DataTypes.DATE, allowNull: true },
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
//       tableName: "owner_details",
//       timestamps: false,
//       freezeTableName: true,
//     }
//   );

//   OwnerDetail.associate = (models) => {
//     OwnerDetail.belongsTo(models.User, { foreignKey: "user_id" });
//     OwnerDetail.hasMany(models.BusinessDetail, { foreignKey: "owner_id" });
//   };

//   return OwnerDetail;
// };


// models/OwnerDetail.js
module.exports = (sequelize, DataTypes) => {
  const OwnerDetail = sequelize.define(
    "OwnerDetail",
    {
      // ... your existing fields
      name: { type: DataTypes.STRING, allowNull: false },
      gender: { type: DataTypes.STRING },
      dob: { type: DataTypes.DATE },
      phone_number: { type: DataTypes.STRING, allowNull: false, unique: true },
      phone_verified_at: { type: DataTypes.DATE },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
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
      tableName: "owner_details",
      timestamps: false,
      freezeTableName: true,
    }
  );

  OwnerDetail.associate = (models) => {
    OwnerDetail.belongsTo(models.User, { 
      foreignKey: "user_id",
      as: "user"
    });
    
    // ADD this association with alias
    OwnerDetail.hasOne(models.BusinessDetail, { 
      foreignKey: "owner_id",
      as: "businessDetail"  // <-- ADD THIS
    });
  };

  return OwnerDetail;
};