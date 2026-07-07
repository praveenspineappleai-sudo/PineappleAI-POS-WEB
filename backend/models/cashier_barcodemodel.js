// Developed by Janarthan 06/03/2025

// Exporting a function that defines the "Barcode" model using Sequelize
module.exports = (sequelize, DataTypes) => {
  // Define the "Barcode" model with its attributes and configurations
  const CashierBarcode = sequelize.define(
    "CashierBarcode", // Model name
    {
      id: { 
        type: DataTypes.INTEGER, // Data type: Integer
        primaryKey: true, // Sets 'id' as the primary key
        autoIncrement: true // Enables auto-increment for 'id'
      }, 
      barcode_no: { 
        type: DataTypes.STRING, // Data type: String (VARCHAR)
        allowNull: false, // Ensures 'barcode_no' cannot be null
        unique: true // Ensures 'barcode_no' is unique
      } 
    },
    {
      tableName: "barcodes", // Explicitly setting the table name to 'barcodes'
      timestamps: false // Disables Sequelize's automatic 'createdAt' and 'updatedAt' fields
    }
  );

  // Define the associations within the associate method
  

  CashierBarcode.associate = (models) =>{
    CashierBarcode.hasOne(models.CashierPrice, { foreignKey: "barcode_id" });
  }
  

  return CashierBarcode; // Returns the defined model
};
