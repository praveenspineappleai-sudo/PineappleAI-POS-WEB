// // models/User.js
// module.exports = (sequelize, DataTypes) => {
//   const User = sequelize.define(
//     "User",
//     {
//       email: { type: DataTypes.STRING, allowNull: false, unique: true },
//       email_verified_at: { type: DataTypes.DATE, allowNull: true },
//       password: { type: DataTypes.STRING, allowNull: false },
//       role: { type: DataTypes.STRING, allowNull: false },
//       remember_token: { type: DataTypes.STRING, allowNull: true },
//       status: { type: DataTypes.STRING, defaultValue: "active" },
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
//       tableName: "users",
//       timestamps: false,
//       freezeTableName: true,
//     }
//   );

//   User.associate = (models) => {
//     User.hasOne(models.OwnerDetail, { foreignKey: "user_id" });
//   };

//   return User;
// };


// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true, // optional but good for login
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remember_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "active",
      },
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
      tableName: "users",
      timestamps: false,
      freezeTableName: true,
    }
  );

  User.associate = (models) => {
    User.hasOne(models.OwnerDetail, {
      foreignKey: "user_id",
      as: "ownerDetail",
    });
  };

  return User;
};
