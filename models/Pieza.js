import { DataTypes } from "sequelize";
import sequelize from "../utils/database.js";

const Pieza = sequelize.define("Pieza",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    categoria: {
        type: DataTypes.ENUM(
            'Motor', 'Frenos', 'Suspensión', 'Transmisión', 
            'Electricidad', 'Filtros', 'Aceites y fluidos', 
            'Neumáticos', 'Accesorios', 'Otro'
        ),
        allowNull: false
    },
    stockActual: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    stockMinimo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0 
        }
    },
    costoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0 
        }
    },
    precioVenta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01, 
            mayorOIgualAlCosto(value) {
                if (parseFloat(value) < parseFloat(this.costoUnitario)) {
                    throw new Error('El precio de venta no debe ser menor que el costo unitario.');
                }
            }
        }
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    estado: {
        type: DataTypes.ENUM('Activa', 'Inactiva'),
        allowNull: false,
        defaultValue: 'Activa'
    }
}, {
    timestamps: true,
    tableName: 'piezas'
});

export default Pieza;