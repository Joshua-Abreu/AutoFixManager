import { DataTypes } from "sequelize";
import sequelize from "../utils/database.js";

const Marca = sequelize.define("Marca",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    paisOrigen:{
        type: DataTypes.STRING,
        allowNull: true
    },
    estado:{
        type: DataTypes.ENUM("Activa", "Inactiva"),
        allowNull: false,
        defaultValue: "Activa"
    }
}, {
    timestamps: true,
    tableName: 'marcas'
});

export default Marca;
