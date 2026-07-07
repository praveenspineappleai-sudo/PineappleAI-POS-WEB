// models/AccessKey.js
module.exports = (sequelize, DataTypes) => {
  const AccessKey = sequelize.define(
    "AccessKey",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      key_value: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      key_status: {
        type: DataTypes.STRING,
        defaultValue: "active",
      },
      valid_till: {
        type: DataTypes.DATE,
      },
      business_details_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      email_status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
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
      tableName: "access_keys",
      timestamps: false,
    }
  );

  AccessKey.associate = (models) => {
    AccessKey.belongsTo(models.BusinessDetail, {
      foreignKey: "business_details_id",
      as: "business",
    });
  };

  return AccessKey;
};