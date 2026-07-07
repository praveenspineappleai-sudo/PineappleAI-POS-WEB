// models/CashierDetail.js

module.exports = (sequelize, DataTypes) => {
  const CashierDetail = sequelize.define(
    "CashierDetail",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // table name of User model
          key: "id",
        },
        onDelete: "CASCADE",
      },
      owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // assuming owners are stored in User table
          key: "id",
        },
        onDelete: "CASCADE",
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
      tableName: "cashier_details",
      timestamps: true,
      underscored: true,
    }
  );

  CashierDetail.associate = (models) => {
    CashierDetail.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    CashierDetail.belongsTo(models.User, {
      foreignKey: "owner_id",
      as: "owner",
    });
  };

  return CashierDetail;
};
