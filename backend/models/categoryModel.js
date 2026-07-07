//Developed by M.Vaishnavi start 01/4 end 02/4

module.exports = (sequelize, DataTypes) => {
  // Define the Category model
  const Category = sequelize.define(
    "Category",
    {
      // Define the fields for the Category model
      id: {
        type: DataTypes.BIGINT, // The data type for the ID field
        primaryKey: true, // This field is the primary key
        autoIncrement: true, // Automatically increments when a new record is created
        allowNull: false, // This field cannot be null
        
      },
      category_name: {
        type: DataTypes.STRING, // The data type for the category name field
        allowNull: false, // This field cannot be null
        unique: true,
      },
    },
    {
      tableName: "categorys", // The name of the table in the database (should match the actual DB table name)
      freezeTableName: true, //
      timestamps: true, // Automatically adds createdAt and updatedAt fields
      createdAt: "created_at",// Renames createdAt to created_at in the database
      updatedAt: "updated_at",// Renames updatedAt to updated_at in the database
      underscored: true, // optional, converts camelCase to snake_case in DB
                 
    }
  );

  // Define the associations for this model
  Category.associate = (models) => {
    // Many-to-many relationship with Product through ProductCategory
    Category.belongsToMany(models.Product, {
      through: models.ProductCategory, // Specifies the join table (ProductCategory)
      foreignKey: "category_id", // The foreign key in the join table referencing the Category
      otherKey: "product_id", // The foreign key in the join table referencing the Product
      as: "products", // Alias for the relationship to be used in queries
    });
  };

  // Return the model
  return Category;
};
