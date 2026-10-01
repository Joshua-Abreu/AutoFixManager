import { Op } from 'sequelize';
import sequelize from '../utils/database.js';
import Vehiculo from '../models/Vehiculo.js';
import OrdenTrabajo from '../models/OrdenTrabajo.js';
import Pieza from '../models/Pieza.js';

export const GetDashboard = async (req, res) => {
    try {
        const totalVehiculos = await Vehiculo.count();
        const totalOrdenes = await OrdenTrabajo.count();
        const estadosActivos = ['Recibida', 'En diagnóstico', 'En reparación', 'Esperando piezas', 'Lista para entrega'];
        const ordenesActivas = await OrdenTrabajo.count({
            where: { estado: { [Op.in]: estadosActivos } }
        });

        const ordenesFinalizadas = await OrdenTrabajo.count({
            where: { estado: 'Entregada' }
        });

        const ordenesCanceladas = await OrdenTrabajo.count({
            where: { estado: 'Cancelada' }
        });

        let totalFacturado = await OrdenTrabajo.sum('totalGeneral', {
            where: { estado: 'Entregada' }
        });
        totalFacturado = totalFacturado ? parseFloat(totalFacturado).toFixed(2) : '0.00';

        const piezasBajoInventario = await Pieza.count({
            where: {
                stockActual: { [Op.lte]: sequelize.col('stockMinimo') }
            }
        });

        const ultimasOrdenes = await OrdenTrabajo.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{
                model: Vehiculo,
                as: 'vehiculo',
                include: ['marca']
            }],
            raw: true,
            nest: true
        });

        res.render('home/index', {
            resumen: {
                totalVehiculos,
                totalOrdenes,
                ordenesActivas,
                ordenesFinalizadas,
                ordenesCanceladas,
                totalFacturado,
                piezasBajoInventario
            },
            ultimasOrdenes
        });

    } catch (error) {
        console.error('Error al cargar el dashboard:', error);
        res.render('home/index', { errorGeneral: 'No fue posible cargar el resumen general del taller en este momento.' });
    }
};