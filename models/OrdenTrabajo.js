import { DataTypes } from "sequelize";
import sequelize from "../utils/database.js";
import Vehiculo from "./Vehiculo.js";

const OrdenTrabajo = sequelize.define("OrdenTrabajo", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numeroOrden: { type: DataTypes.STRING, allowNull: false, unique: true },
    vehiculoId: { type: DataTypes.INTEGER, allowNull: false },
    fechaRecepcion: { type: DataTypes.DATEONLY, allowNull: false },
    fechaEstimadaEntrega: { type: DataTypes.DATEONLY, allowNull: true },
    kilometrajeEntrada: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    descripcionProblema: { type: DataTypes.TEXT, allowNull: false },
    diagnosticoInicial: { type: DataTypes.TEXT, allowNull: true },
    estado: {
        type: DataTypes.ENUM('Recibida', 'En diagnóstico', 'En reparación', 'Esperando piezas', 'Lista para entrega', 'Entregada', 'Cancelada'),
        allowNull: false,
        defaultValue: 'Recibida'
    },
    observaciones: { type: DataTypes.TEXT, allowNull: true },
    
    descuento: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    aplicarImpuesto: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    porcentajeImpuesto: { type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0 },
    
    subtotalServicios: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    subtotalPiezas: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    subtotalGeneral: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    baseImponible: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    impuesto: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    totalGeneral: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }
}, {
    timestamps: true,
    tableName: 'ordenes_trabajo',
});

OrdenTrabajo.belongsTo(Vehiculo, { foreignKey: 'vehiculoId', as: 'vehiculo' });
Vehiculo.hasMany(OrdenTrabajo, { foreignKey: 'vehiculoId', as: 'ordenes' });

export default OrdenTrabajo;