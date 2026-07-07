// developed by G.Sabisan start 25/2/2025 to 25/2/2025

"use strict"; // Enforces strict mode for better error handling and safer code execution

module.exports = (sequelize, DataTypes) => {
  // Define the 'Size' model with its attributes and configurations
  const Size = sequelize.define(
    "Size",
    {
      id: {
        type: DataTypes.INTEGER, // Data type: Integer
        autoIncrement: true, // Auto-incrementing primary key
        primaryKey: true, // Sets this column as the primary key
      },
      size: {
        type: DataTypes.STRING, // Data type: String
        allowNull: false, // Ensures this field cannot be null
        unique: true, // Enforces unique values for this field
      },
      created_at: {
        type: DataTypes.DATE, // Data type: Date (stores timestamp of record creation)
        allowNull: false, // Cannot be null
      },
      updated_at: {
        type: DataTypes.DATE, // Data type: Date (stores timestamp of last update)
        allowNull: false, // Cannot be null
      },
    },
    {
      tableName: "sizes", // Explicitly sets the table name as 'sizes'
      timestamps: true, // Enables automatic management of createdAt and updatedAt fields
      underscored: true, // Uses snake_case for automatically generated timestamps instead of camelCase
    }
  );

  // Define association inside the model
  Size.associate = (models) => {
    // Establish a one-to-many relationship between Size and Price
    // One size can have multiple price entries
    Size.hasMany(models.Price, { foreignKey: "size_id" });
  };

  return Size; // Returns the defined model
};
