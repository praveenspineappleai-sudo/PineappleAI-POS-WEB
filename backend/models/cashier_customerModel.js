// // Developed by M.Vaishnavi - Start: 25/2, End: 28/2

// module.exports = (sequelize, DataTypes) => {
//     // Define the "Customer" model
//     const Customer = sequelize.define(
//       "Customer", // Model name
//       {
//         id: {
//           type: DataTypes.INTEGER, // Data type: Integer
//           primaryKey: true, // Sets 'id' as the primary key
//           autoIncrement: true, // Enables auto-increment for 'id'
//           allowNull: false, // Ensures 'id' cannot be null
//         },
//         name: {
//           type: DataTypes.STRING, // Data type: String (VARCHAR)
//           allowNull: false, // Ensures 'name' cannot be null
//         },
//         phone_no: {
//           type: DataTypes.STRING, // Data type: String (VARCHAR)
//           allowNull: false, // Ensures 'phone_no' cannot be null
//         },
//         email: {
//           type: DataTypes.STRING, // Data type: String (VARCHAR)
//           allowNull: false, // Ensures 'email' cannot be null
//         },
//       },
//       {
//         tableName: "customers", // Explicitly setting the table name to 'customers'
//         timestamps: true, // Enables automatic handling of timestamps
//         createdAt: "created_at", // Custom field name for creation timestamp
//         updatedAt: "updated_at", // Custom field name for update timestamp
//       }
//     );

//     // Define the associations within the associate method
//     Customer.associate = (models) => {
//       // Define associations here if required
//     };

//     return Customer; // Returns the defined model
//   };
