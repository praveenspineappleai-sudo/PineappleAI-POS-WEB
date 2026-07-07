module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define(
    "Otp",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      target: { type: DataTypes.STRING, allowNull: false },
      code: { type: DataTypes.STRING, allowNull: false },
      type: {
        type: DataTypes.ENUM("phone", "email", "password_reset"),
        allowNull: false,
      },
      attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

      expires_at: { type: DataTypes.DATE, allowNull: false },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      verified_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "otps",
      timestamps: true, // Sequelize manages createdAt & updatedAt automatically
      createdAt: "created_at", // Map to your existing column names
      updatedAt: "updated_at",
      freezeTableName: true,
    }
  );

  return Otp;
};
