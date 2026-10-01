import { DataTypes } from "sequelize";
import sequelize from "../utils/database.js";

const Servicio = sequelize.define("Servicio", {
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
    descripcion:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    categoria:{
        type: DataTypes.ENUM(
            'Diagnóstico', 'Mantenimiento', 'Reparación', 'Electricidad', 
            'Frenos', 'Motor', 'Transmisión', 'Suspensión', 
            'Aire acondicionado', 'Otro'
        ),
        allowNull: false
    },
    precioBase:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate:{
            min: 0.01
        }
    },
    duracionEstimada:{
        type: DataTypes.INTEGER,
        allowNull: true,
        validate:{
            min: 1
        }
    },
    estado:{
        type: DataTypes.ENUM("Activo", "Inactivo"),
        allowNull: false,
        defaultValue: "Activo"
    }
}, {
    timestamps: true,
    tableName: 'servicios'
});

export default Servicio;