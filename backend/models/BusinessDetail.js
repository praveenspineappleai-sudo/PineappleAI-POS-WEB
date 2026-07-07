// models/BusinessDetail.js
module.exports = (sequelize, DataTypes) => {
  const BusinessDetail = sequelize.define(
    "BusinessDetail",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      address: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.STRING, defaultValue: "active" },
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
      tableName: "business_details",
      timestamps: false,
      freezeTableName: true,
    }
  );

  // models/BusinessDetail.js
  BusinessDetail.associate = (models) => {
    BusinessDetail.belongsTo(models.OwnerDetail, {
      foreignKey: "owner_id",
      as: "owner",
    });

    // Add this
    BusinessDetail.hasMany(models.AccessKey, {
      foreignKey: "business_details_id",
      as: "accessKeys", // must match what you use in include
    });
  };

  return BusinessDetail;
};
