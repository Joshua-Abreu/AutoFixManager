import OrdenTrabajo from '../models/OrdenTrabajo.js';
import Vehiculo from '../models/Vehiculo.js';
import { Op } from 'sequelize';
import OrdenServicio from '../models/OrdenServicio.js';
import OrdenPieza from '../models/OrdenPieza.js'; 
import Servicio from '../models/Servicio.js';     
import Pieza from '../models/Pieza.js';           
import Evidencia from '../models/Evidencia.js';

const recalcularTotalesOrden = async (ordenId) => {
    const orden = await OrdenTrabajo.findByPk(ordenId);
    if (!orden) return;

    const servicios = await OrdenServicio.findAll({ where: { ordenId }, raw: true });
    const subtotalServicios = servicios.reduce((sum, s) => sum + parseFloat(s.precioAplicado || 0), 0);

    const piezas = await OrdenPieza.findAll({ where: { ordenId }, raw: true });
    const subtotalPiezas = piezas.reduce((sum, p) => sum + parseFloat(p.subtotal || 0), 0);

    const subtotalGeneral = subtotalServicios + subtotalPiezas;
    
    let descuento = parseFloat(orden.descuento) || 0;
    if (descuento < 0) descuento = 0;
    if (descuento > subtotalGeneral) descuento = subtotalGeneral; 

    let baseImponible = subtotalGeneral - descuento;
    if (baseImponible < 0) baseImponible = 0; 

    let impuesto = 0;
    if (orden.aplicarImpuesto) {
        let porcentaje = parseFloat(orden.porcentajeImpuesto) || 0;
        if (porcentaje < 0) porcentaje = 0;
        if (porcentaje > 100) porcentaje = 100;

        impuesto = baseImponible * (porcentaje / 100);
    }

    let totalGeneral = baseImponible + impuesto;
    if (totalGeneral < 0) totalGeneral = 0;

    await OrdenTrabajo.update({
        subtotalServicios: parseFloat(subtotalServicios.toFixed(2)),
        subtotalPiezas: parseFloat(subtotalPiezas.toFixed(2)),
        subtotalGeneral: parseFloat(subtotalGeneral.toFixed(2)),
        descuento: parseFloat(descuento.toFixed(2)),
        baseImponible: parseFloat(baseImponible.toFixed(2)),
        impuesto: parseFloat(impuesto.toFixed(2)),
        totalGeneral: parseFloat(totalGeneral.toFixed(2))
    }, { where: { id: ordenId } });
};



export const GetOrdenes = async (req, res) => {
    try {
        const ordenes = await OrdenTrabajo.findAll({
            include: [{
                model: Vehiculo,
                as: 'vehiculo',
                attributes: ['placa']
            }],
            order: [['createdAt', 'DESC']],
            raw: true,
            nest: true
        });

        res.render('ordenes/index', { ordenes });
    } catch (error) {
        console.error('Error al listar órdenes:', error);
        res.status(500).send('Error interno del servidor');
    }
};

export const GetCrearOrden = async (req, res) => {
    try {
        const vehiculos = await Vehiculo.findAll({
            where: { estado: { [Op.ne]: 'Inactivo' } },
            raw: true
        });
        res.render('ordenes/crear', { vehiculos });
    } catch (error) {
        console.error('Error al cargar formulario de orden:', error);
        res.redirect('/ordenes');
    }
};

export const PostCrearOrden = async (req, res) => {
    try {
        let { numeroOrden, vehiculoId, fechaRecepcion, fechaEstimadaEntrega, kilometrajeEntrada, descripcionProblema, diagnosticoInicial, observaciones } = req.body;

        const vehiculos = await Vehiculo.findAll({ where: { estado: { [Op.ne]: 'Inactivo' } }, raw: true });
        
        if (!numeroOrden || !vehiculoId || !fechaRecepcion || !kilometrajeEntrada || !descripcionProblema) {
            return res.render('ordenes/crear', { error: 'Por favor complete todos los campos obligatorios.', orden: req.body, vehiculos });
        }
        numeroOrden = numeroOrden.trim();

        const ordenExistente = await OrdenTrabajo.findOne({ where: { numeroOrden } });
        if (ordenExistente) {
            return res.render('ordenes/crear', { error: 'Ya existe una orden registrada con ese número.', orden: req.body, vehiculos });
        }

        const vehiculo = await Vehiculo.findByPk(vehiculoId);
        
        if (!vehiculo || vehiculo.estado === 'Inactivo') {
            return res.render('ordenes/crear', { error: 'El vehículo seleccionado no está disponible.', orden: req.body, vehiculos });
        }

        const estadosActivos = ['Recibida', 'En diagnóstico', 'En reparación', 'Esperando piezas', 'Lista para entrega'];
        const ordenActiva = await OrdenTrabajo.findOne({
            where: {
                vehiculoId,
                estado: { [Op.in]: estadosActivos }
            }
        });

        if (ordenActiva) {
            return res.render('ordenes/crear', { error: 'Este vehículo ya tiene una orden activa. Debe entregarla o cancelarla para crear una nueva.', orden: req.body, vehiculos });
        }

        if (fechaEstimadaEntrega && fechaEstimadaEntrega < fechaRecepcion) {
            return res.render('ordenes/crear', { error: 'La fecha estimada de entrega debe ser igual o mayor que la fecha de recepción.', orden: req.body, vehiculos });
        }

        if (parseFloat(kilometrajeEntrada) < parseFloat(vehiculo.kilometraje)) {
            return res.render('ordenes/crear', { error: 'El kilometraje de entrada no puede ser menor que el kilometraje actual registrado del vehículo.', orden: req.body, vehiculos });
        }

        await OrdenTrabajo.create({
            numeroOrden, vehiculoId, fechaRecepcion, 
            fechaEstimadaEntrega: fechaEstimadaEntrega || null, 
            kilometrajeEntrada, descripcionProblema, 
            diagnosticoInicial: diagnosticoInicial || null, 
            observaciones: observaciones || null,
            estado: 'Recibida'
        });

        await Vehiculo.update({ estado: 'En taller' }, { where: { id: vehiculoId } });

        res.redirect('/ordenes');

    } catch (error) {
        console.error('Error al crear la orden:', error);
        const vehiculos = await Vehiculo.findAll({ where: { estado: { [Op.ne]: 'Inactivo' } }, raw: true });
        res.render('ordenes/crear', { error: 'Ocurrió un error al guardar la orden.', orden: req.body, vehiculos });
    }
};

export const GetEditarOrden = async (req, res) => {
    try {
        const orden = await OrdenTrabajo.findByPk(req.params.id, { raw: true });
        if (!orden) return res.redirect('/ordenes');

        if (orden.estado === 'Entregada' || orden.estado === 'Cancelada') {
            return res.redirect('/ordenes'); 
        }

        const vehiculos = await Vehiculo.findAll({
            where: {
                [Op.or]: [
                    { estado: { [Op.ne]: 'Inactivo' } },
                    { id: orden.vehiculoId }
                ]
            },
            raw: true
        });

        res.render('ordenes/editar', { orden, vehiculos });
    } catch (error) {
        console.error('Error al cargar la orden para editar:', error);
        res.redirect('/ordenes');
    }
};

export const PostEditarOrden = async (req, res) => {
    const ordenId = req.params.id;
    try {
        let { numeroOrden, vehiculoId, fechaRecepcion, fechaEstimadaEntrega, kilometrajeEntrada, descripcionProblema, diagnosticoInicial, observaciones, estado } = req.body;

        const ordenOriginal = await OrdenTrabajo.findByPk(ordenId);
        if (!ordenOriginal) return res.redirect('/ordenes');

        const vehiculos = await Vehiculo.findAll({ where: { estado: { [Op.ne]: 'Inactivo' } }, raw: true });

        if (ordenOriginal.estado === 'Entregada' || ordenOriginal.estado === 'Cancelada') {
            return res.render('ordenes/editar', { error: 'Una orden entregada o cancelada no puede ser modificada.', orden: { id: ordenId, ...req.body }, vehiculos });
        }

        numeroOrden = numeroOrden.trim();

        const ordenExistente = await OrdenTrabajo.findOne({
            where: { numeroOrden, id: { [Op.ne]: ordenId } }
        });
        if (ordenExistente) {
            return res.render('ordenes/editar', { error: 'Ya existe otra orden registrada con ese número.', orden: { id: ordenId, ...req.body }, vehiculos });
        }

        const vehiculo = await Vehiculo.findByPk(vehiculoId);

        if (fechaEstimadaEntrega && fechaEstimadaEntrega < fechaRecepcion) {
            return res.render('ordenes/editar', { error: 'La fecha estimada de entrega debe ser igual o mayor que la fecha de recepción.', orden: { id: ordenId, ...req.body }, vehiculos });
        }

        if (parseFloat(kilometrajeEntrada) < parseFloat(vehiculo.kilometraje)) {
            return res.render('ordenes/editar', { error: 'El kilometraje de entrada no puede ser menor que el kilometraje actual registrado del vehículo.', orden: { id: ordenId, ...req.body }, vehiculos });
        }

        if (estado === 'Entregada') {
            const cantidadServicios = await OrdenServicio.count({ where: { ordenId } });
            if (cantidadServicios === 0) {
                return res.render('ordenes/editar', { error: 'No se puede cambiar el estado a Entregada sin al menos un servicio registrado.', orden: { id: ordenId, ...req.body }, vehiculos });
            }
        }

        await OrdenTrabajo.update({
            numeroOrden, vehiculoId, fechaRecepcion, 
            fechaEstimadaEntrega: fechaEstimadaEntrega || null, 
            kilometrajeEntrada, descripcionProblema, 
            diagnosticoInicial: diagnosticoInicial || null, 
            observaciones: observaciones || null,
            estado
        }, {
            where: { id: ordenId }
        });

        if (estado === 'Entregada') {
            await Vehiculo.update({ estado: 'Fuera del taller' }, { where: { id: vehiculoId } });
            
        } else if (estado === 'Cancelada') {
            const piezasUsadas = await OrdenPieza.findAll({ where: { ordenId } });
            for (const item of piezasUsadas) {
                const pieza = await Pieza.findByPk(item.piezaId);
                if (pieza) {
                    await pieza.increment('stockActual', { by: item.cantidad });
                }
            }
            
            const estadosActivos = ['Recibida', 'En diagnóstico', 'En reparación', 'Esperando piezas', 'Lista para entrega'];
            const otraOrdenActiva = await OrdenTrabajo.findOne({
                where: {
                    vehiculoId,
                    id: { [Op.ne]: ordenId },
                    estado: { [Op.in]: estadosActivos }
                }
            });

            if (!otraOrdenActiva) {
                await Vehiculo.update({ estado: 'Fuera del taller' }, { where: { id: vehiculoId } });
            }
            
        } else {
            await Vehiculo.update({ estado: 'En taller' }, { where: { id: vehiculoId } });
        }
        res.redirect('/ordenes');

    } catch (error) {
        console.error('Error al editar la orden:', error);
        const vehiculos = await Vehiculo.findAll({ where: { estado: { [Op.ne]: 'Inactivo' } }, raw: true });
        res.render('ordenes/editar', { error: 'Ocurrió un error al actualizar la orden.', orden: { id: ordenId, ...req.body }, vehiculos });
    }
};

export const GetDetalleOrden = async (req, res) => {
    try {
        const ordenId = req.params.id;
        
        const orden = await OrdenTrabajo.findByPk(ordenId, {
            include: [
                { 
                    model: Vehiculo, 
                    as: 'vehiculo',
                    include: ['marca'] 
                },
                { model: OrdenServicio, as: 'servicios', include: ['servicioInfo'] },
                { model: OrdenPieza, as: 'piezas', include: ['piezaInfo'] },
                { model: Evidencia, as: 'evidencias' }
            ]
        });

        if (!orden) return res.redirect('/ordenes');

        const ordenData = orden.get({ plain: true });

        const serviciosActivos = await Servicio.findAll({ where: { estado: 'Activo' }, raw: true });
        const piezasActivas = await Pieza.findAll({ 
            where: { 
                estado: 'Activa',
                stockActual: { [Op.gt]: 0 } 
            }, 
            raw: true 
        });

        const ordenCerrada = (ordenData.estado === 'Entregada' || ordenData.estado === 'Cancelada');
        const error = req.query.error;

        res.render('ordenes/detalle', { 
            orden: ordenData, 
            servicios: serviciosActivos, 
            piezas: piezasActivas,
            ordenCerrada,
            error
        });

    } catch (error) {
        console.error('Error al obtener el detalle de la orden:', error);
        res.redirect('/ordenes');
    }
};

export const PostAgregarServicio = async (req, res) => {
    const ordenId = req.params.id;
    try {
        const { servicioId, precioAplicado, nota } = req.body;
        
        const orden = await OrdenTrabajo.findByPk(ordenId);
        if (orden.estado === 'Entregada' || orden.estado === 'Cancelada') {
            return res.redirect(`/ordenes/detalle/${ordenId}`); 
        }
        if (!precioAplicado || parseFloat(precioAplicado) <= 0) {
            console.log('Error: El precio aplicado debe ser mayor que cero.');
            return res.redirect(`/ordenes/detalle/${ordenId}?error=precio_invalido`);
        }

        const servicioExistente = await OrdenServicio.findOne({
            where: { ordenId, servicioId }
        });

        if (servicioExistente) {
            console.log('El servicio ya fue agregado.');
            return res.redirect(`/ordenes/detalle/${ordenId}`);
        }

        await OrdenServicio.create({
            ordenId,
            servicioId,
            precioAplicado,
            nota: nota || null
        });

        await recalcularTotalesOrden(ordenId);

        res.redirect(`/ordenes/detalle/${ordenId}`);
    } catch (error) {
        console.error('Error al agregar servicio:', error);
        res.redirect(`/ordenes/detalle/${ordenId}`);
    }
};

export const PostEliminarServicio = async (req, res) => {
    const idOrdenServicio = req.params.id; // 
    try {
        const ordenServicio = await OrdenServicio.findByPk(idOrdenServicio, { include: ['orden'] });
        if (!ordenServicio) return res.redirect('/ordenes');

        const ordenId = ordenServicio.ordenId;
        
        if (ordenServicio.orden.estado === 'Entregada' || ordenServicio.orden.estado === 'Cancelada') {
            return res.redirect(`/ordenes/detalle/${ordenId}`);
        }

        await OrdenServicio.destroy({ where: { id: idOrdenServicio } });

        await recalcularTotalesOrden(ordenId);

        res.redirect(`/ordenes/detalle/${ordenId}`);
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        res.redirect('/ordenes');
    }
};

export const PostAgregarPieza = async (req, res) => {
    const ordenId = req.params.id;
    try {
        const { piezaId, cantidad, precioUnitarioAplicado } = req.body;
        
        const orden = await OrdenTrabajo.findByPk(ordenId);
        if (orden.estado === 'Entregada' || orden.estado === 'Cancelada') {
            return res.redirect(`/ordenes/detalle/${ordenId}`);
        }

        const cantidadNumerica = parseInt(cantidad);
        const precioUnitario = parseFloat(precioUnitarioAplicado);

        if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
            console.log('Error: La cantidad debe ser un entero mayor que cero.');
            return res.redirect(`/ordenes/detalle/${ordenId}?error=cantidad_invalida`);
        }

        if (isNaN(precioUnitario) || precioUnitario <= 0) {
            console.log('Error: El precio unitario debe ser mayor que cero.');
            return res.redirect(`/ordenes/detalle/${ordenId}?error=precio_invalido`);
        }

        const pieza = await Pieza.findByPk(piezaId);
        if (!pieza) {
            return res.redirect(`/ordenes/detalle/${ordenId}`);
        }

        if (pieza.stockActual < cantidadNumerica) {
            console.log('Error: No hay stock suficiente.');
            return res.redirect(`/ordenes/detalle/${ordenId}?error=sin_stock`);
        }

        const subtotal = cantidadNumerica * precioUnitario;

        await OrdenPieza.create({
            ordenId,
            piezaId,
            cantidad: cantidadNumerica,
            precioUnitarioAplicado: precioUnitario,
            subtotal
        });

        await pieza.decrement('stockActual', { by: cantidadNumerica });

        await recalcularTotalesOrden(ordenId);

        res.redirect(`/ordenes/detalle/${ordenId}`);
    } catch (error) {
        console.error('Error al agregar pieza:', error);
        res.redirect(`/ordenes/detalle/${ordenId}`);
    }
};

export const PostEliminarPieza = async (req, res) => {
    const idOrdenPieza = req.params.id;
    try {
        const ordenPieza = await OrdenPieza.findByPk(idOrdenPieza, { include: ['orden'] });
        if (!ordenPieza) return res.redirect('/ordenes');

        const ordenId = ordenPieza.ordenId;
        
        if (ordenPieza.orden.estado === 'Entregada' || ordenPieza.orden.estado === 'Cancelada') {
            return res.redirect(`/ordenes/detalle/${ordenId}`);
        }

        const pieza = await Pieza.findByPk(ordenPieza.piezaId);
        if (pieza) {
            await pieza.increment('stockActual', { by: ordenPieza.cantidad });
        }

        await OrdenPieza.destroy({ where: { id: idOrdenPieza } });

        await recalcularTotalesOrden(ordenId);

        res.redirect(`/ordenes/detalle/${ordenId}`);
    } catch (error) {
        console.error('Error al eliminar pieza:', error);
        res.redirect('/ordenes');
    }
};

export const PostAgregarEvidencia = async (req, res) => {
    const ordenId = req.params.id;
    try {
        const orden = await OrdenTrabajo.findByPk(ordenId);
        if (orden.estado === 'Entregada' || orden.estado === 'Cancelada') {
            return res.redirect(`/ordenes/detalle/${ordenId}`);
        }

        if (!req.file) {
            console.log('Error: La imagen es requerida.');
            return res.redirect(`/ordenes/detalle/${ordenId}`);
        }

        const descripcion = req.body.descripcion || null;
        const imagenPath = `/uploads/evidencias/${req.file.filename}`;

        await Evidencia.create({
            ordenId,
            imagen: imagenPath,
            descripcion
        });

        res.redirect(`/ordenes/detalle/${ordenId}`);
    } catch (error) {
        console.error('Error al subir evidencia:', error);
        res.redirect(`/ordenes/detalle/${ordenId}`);
    }
};

export const PostEliminarEvidencia = async (req, res) => {
    const idEvidencia = req.params.id;
    try {
        const evidencia = await Evidencia.findByPk(idEvidencia, { include: ['orden'] });
        if (!evidencia) return res.redirect('/ordenes');

        const ordenId = evidencia.ordenId;

        if (evidencia.orden.estado === 'Entregada' || evidencia.orden.estado === 'Cancelada') {
            return res.redirect(`/ordenes/detalle/${ordenId}`);
        }

        await Evidencia.destroy({ where: { id: idEvidencia } });
        res.redirect(`/ordenes/detalle/${ordenId}`);
    } catch (error) {
        console.error('Error al eliminar evidencia:', error);
        res.redirect('/ordenes');
    }
};