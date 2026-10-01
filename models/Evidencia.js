import { DataTypes } from "sequelize";
import sequelize from "../utils/database.js";
import OrdenTrabajo from "./OrdenTrabajo.js";

const Evidencia = sequelize.define("Evidencia", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ordenId: { type: DataTypes.INTEGER, allowNull: false },
    imagen: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.STRING, allowNull: true },
    fechaCarga: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
    timestamps: false, 
    tableName: 'evidencias',
});

// Relaciones
OrdenTrabajo.hasMany(Evidencia, { foreignKey: 'ordenId', as: 'evidencias' });
Evidencia.belongsTo(OrdenTrabajo, { foreignKey: 'ordenId', as: 'orden' });

export default Evidencia;