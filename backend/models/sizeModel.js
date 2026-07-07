module.exports = (sequelize, DataTypes) => {
    const Size = sequelize.define(
        "Size",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            size: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: {
                        msg: "Size is required",
                    },
                    len: {
                        args: [1, 50],
                        msg: "Size must be between 1 and 50 characters",
                    },
                },
            },
        },
        {
            tableName: "sizes",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    Size.associate = (models) => {
        Size.hasMany(models.Price, {
            foreignKey: "size_id",
            as: "Prices",
        });
    };

    return Size;
};