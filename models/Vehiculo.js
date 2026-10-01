import { DataTypes } from "sequelize";
import sequelize from "../utils/database.js";
import Marca from "./Marca.js";

const Vehiculo = sequelize.define("Vehiculo", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    placa: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
        }
    },
    modelo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1980,
            max: new Date().getFullYear() + 1
        }
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    tipoVehiculo: {
        type: DataTypes.ENUM('Carro', 'Jeepeta', 'Camioneta', 'Camión', 'Motocicleta', 'Otro'),
        allowNull: false
    },
    propietarioNombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    propietarioTelefono: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    kilometraje: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0 
        }
    },
    propietarioCorreo: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('Registrado', 'En taller', 'Fuera del taller', 'Inactivo'),
        allowNull: false,
        defaultValue: 'Registrado'
    }
}, {
    timestamps: true,
    tableName: 'vehiculos',
});

Vehiculo.belongsTo(Marca, { foreignKey: 'marcaId', as: 'marca' });
Marca.hasMany(Vehiculo, { foreignKey: 'marcaId', as: 'vehiculos' });

export default Vehiculo;