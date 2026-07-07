// Developed by M.Vaishnavi start 01/4 end 02/4

module.exports = (sequelize, DataTypes) => {
  // Define the Color model
  const Color = sequelize.define("Color", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  colour_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "colors",
  timestamps: false,  // disable Sequelize timestamps
});


  // Associations
  Color.associate = (models) => {
    // One-to-many relationship with Price model
    Color.hasMany(models.Price, {
      foreignKey: "color_id",
      as: "prices", // use lowercase alias for consistency
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return Color;
};
