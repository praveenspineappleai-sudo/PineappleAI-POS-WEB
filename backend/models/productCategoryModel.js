//Developed by M.Vaishnavi start 01/4 end 02/4

module.exports = (sequelize, DataTypes) => {
  // Define the ProductCategory model, which acts as a junction table between Product and Category
  const ProductCategory = sequelize.define(
    "ProductCategory", // The model name
    {
      // id: A unique identifier for each product-category relationship
      id: {
        type: DataTypes.INTEGER, // Integer data type for the primary key
        primaryKey: true, // Marks this field as the primary key
        autoIncrement: true, // Automatically increments for each new record
        allowNull: false, // This field cannot be null
      },
      
      // product_id: A foreign key that references the Product model
      product_id: {
        type: DataTypes.INTEGER, // Integer data type for product ID
        allowNull: false, // This field is mandatory
        references: {
          model: "products", // Refers to the products table
          key: "id", // The primary key in the products table
        },
        onDelete: "CASCADE", // If a product is deleted, delete the associated product-category records
        onUpdate: "CASCADE", // If a product ID is updated, update it in the junction table as well
      },

      // category_id: A foreign key that references the Category model
      category_id: {
        type: DataTypes.INTEGER, // Integer data type for category ID
        allowNull: false, // This field is mandatory
        references: {
          model: "categorys", // Refers to the categories table
          key: "id", // The primary key in the categories table
        },
        onDelete: "CASCADE", // If a category is deleted, delete the associated product-category records
        onUpdate: "CASCADE", // If a category ID is updated, update it in the junction table as well
      },
    },
    {
      // Define table name and timestamp options
      tableName: "products_categorys", // The table for this model is named 'products_categorys'
      timestamps: true, // Enable automatic timestamp tracking
      createdAt: "created_at", // Custom name for the created timestamp
      updatedAt: "updated_at", // Custom name for the updated timestamp
    }
  );

  // Define associations for the ProductCategory model
  ProductCategory.associate = (models) => {
    // ProductCategory belongs to a Product
    ProductCategory.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
    // ProductCategory belongs to a Category
    ProductCategory.belongsTo(models.Category, { foreignKey: "category_id", as: "category" });
  };

  // Return the ProductCategory model
  return ProductCategory;
};
