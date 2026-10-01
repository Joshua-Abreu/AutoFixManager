import { DataTypes } from "sequelize";
import sequelize from "../utils/database.js";
import OrdenTrabajo from "./OrdenTrabajo.js";
import Pieza from "./Pieza.js"; 

const OrdenPieza = sequelize.define("OrdenPieza", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ordenId: { type: DataTypes.INTEGER, allowNull: false },
    piezaId: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    precioUnitarioAplicado: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, {
    timestamps: true,
    tableName: 'ordenes_piezas',
});

OrdenTrabajo.hasMany(OrdenPieza, { foreignKey: 'ordenId', as: 'piezas' });
OrdenPieza.belongsTo(OrdenTrabajo, { foreignKey: 'ordenId', as: 'orden' });

Pieza.hasMany(OrdenPieza, { foreignKey: 'piezaId', as: 'historialOrdenes' });
OrdenPieza.belongsTo(Pieza, { foreignKey: 'piezaId', as: 'piezaInfo' });

export default OrdenPieza;