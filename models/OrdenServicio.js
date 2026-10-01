import { DataTypes } from "sequelize";
import sequelize from "../utils/database.js";
import OrdenTrabajo from "./OrdenTrabajo.js";
import Servicio from "./Servicio.js"; 

const OrdenServicio = sequelize.define("OrdenServicio", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ordenId: { type: DataTypes.INTEGER, allowNull: false },
    servicioId: { type: DataTypes.INTEGER, allowNull: false },
    precioAplicado: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    nota: { type: DataTypes.STRING, allowNull: true }
}, {
    timestamps: true,
    tableName: 'ordenes_servicios',
});

OrdenTrabajo.hasMany(OrdenServicio, { foreignKey: 'ordenId', as: 'servicios' });
OrdenServicio.belongsTo(OrdenTrabajo, { foreignKey: 'ordenId', as: 'orden' });

Servicio.hasMany(OrdenServicio, { foreignKey: 'servicioId', as: 'historialOrdenes' });
OrdenServicio.belongsTo(Servicio, { foreignKey: 'servicioId', as: 'servicioInfo' });

export default OrdenServicio;