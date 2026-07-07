// developed by G.Sabisan start 4/3/2025 to 4/3/2025

"use strict"; // Enforces strict mode for better error handling and safer code execution

module.exports = (sequelize, DataTypes) => {
  // Define the 'Price' model with its attributes and configurations
  const Price = sequelize.define(
    "Price",
    {
      id: {
        type: DataTypes.INTEGER, // Data type: Integer
        autoIncrement: true, // Auto-incrementing primary key
        primaryKey: true, // Sets this column as the primary key
      },

      cost_price: {
        type: DataTypes.FLOAT, // Data type: Float (stores cost price of product)
        allowNull: false, // Ensures this field cannot be null
      },
      selling_price: {
        type: DataTypes.FLOAT, // Data type: Float (stores selling price of product)
        allowNull: false, // Ensures this field cannot be null
      },

      quantity: {
        type: DataTypes.INTEGER, // Data type: Integer (stores available quantity of product)
        allowNull: false, // Ensures this field cannot be null
      },
      barcode_id: {
        type: DataTypes.INTEGER, // Data type: Integer (foreign key)
        allowNull: false, // Ensures this field cannot be null
        references: {
          model: "barcodes", // References the 'barcodes' table
          key: "id", // Links to the 'id' column in the referenced table
        },
        onUpdate: "CASCADE", // Updates related records in 'barcodes' table when changed
        onDelete: "CASCADE", // Deletes related records in 'price' table when the barcode is deleted
      },
      product_id: {
        type: DataTypes.INTEGER, // Data type: Integer (foreign key)
        allowNull: false, // Ensures this field cannot be null
        references: {
          model: "products", // References the 'products' table
          key: "id", // Links to the 'id' column in the referenced table
        },
        onUpdate: "CASCADE", // Updates related records in 'products' table when changed
        onDelete: "CASCADE", // Deletes related records in 'price' table when the product is deleted
      },
      color_id: {
        type: DataTypes.INTEGER, // Data type: Integer (foreign key)
        allowNull: false, // Ensures this field cannot be null
        references: {
          model: "colors", // References the 'colors' table
          key: "id", // Links to the 'id' column in the referenced table
        },
        onUpdate: "CASCADE", // Updates related records in 'colors' table when changed
        onDelete: "CASCADE", // Deletes related records in 'price' table when the color is deleted
      },
      size_id: {
        type: DataTypes.INTEGER, // Data type: Integer (foreign key)
        allowNull: false, // Ensures this field cannot be null
        references: {
          model: "sizes", // References the 'sizes' table
          key: "id", // Links to the 'id' column in the referenced table
        },
        onUpdate: "CASCADE", // Updates related records in 'sizes' table when changed
        onDelete: "CASCADE", // Deletes related records in 'price' table when the size is deleted
      },
      created_at: {
        type: DataTypes.DATE, // Data type: Date (stores timestamp of record creation)
        allowNull: false, // Ensures this field cannot be null
      },
      updated_at: {
        type: DataTypes.DATE, // Data type: Date (stores timestamp of last update)
        allowNull: false, // Ensures this field cannot be null
      },
    },
    {
      tableName: "prices", // Explicitly sets the table name as 'price'
      timestamps: true, // Enables automatic management of createdAt and updatedAt fields
      underscored: true, // Uses snake_case for automatically generated timestamps instead of camelCase
    }
  );

  // Define association inside the model
  Price.associate = (models) => {
    // Establish a many-to-one relationship between Price and Product
    // Many price records belong to one product
    Price.belongsTo(models.Product, { foreignKey: "product_id" });
    Price.belongsTo(models.Size, { foreignKey: "size_id" });
    Price.belongsTo(models.Color, { foreignKey: "color_id" });
    Price.belongsTo(models.Barcode, { foreignKey: "barcode_id" });
  };

  return Price; // Returns the defined model
};
