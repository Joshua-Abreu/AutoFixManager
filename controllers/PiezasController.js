import Pieza from "../models/Pieza.js";
import OrdenPieza from "../models/OrdenPieza.js";
import { Op, Sequelize } from "sequelize";

export const GetPiezas = async (req, res) => {
    try {
        const { categoria, estado, nivelInventario, error } = req.query;
        let condicionesDeBusqueda = {};

        if (categoria) condicionesDeBusqueda.categoria = categoria;
        if (estado) condicionesDeBusqueda.estado = estado;

        if (nivelInventario === 'Bajo') {
            condicionesDeBusqueda.stockActual = { [Op.lte]: Sequelize.col('stockMinimo') };
        } else if (nivelInventario === 'Normal') {
            condicionesDeBusqueda.stockActual = { [Op.gt]: Sequelize.col('stockMinimo') };
        }

        const piezas = await Pieza.findAll({
            where: condicionesDeBusqueda,
            raw: true
        });

        const piezasProcesadas = piezas.map(pieza => ({
            ...pieza,
            bajoInventario: pieza.stockActual <= pieza.stockMinimo
        }));

        let mensajeError = null;
        if (error === 'pieza_usada') {
            mensajeError = 'No se puede eliminar esta pieza porque ha sido utilizada en una o más órdenes de trabajo.';
        }

        res.render('piezas/index', { 
            piezas: piezasProcesadas,
            filtros: req.query,
            mensajeError
        });
    } catch (error) {
        console.error("Error al listar las piezas:", error);
        res.status(500).send("Error interno del servidor al cargar las piezas");
    }
};

export const GetCrearPieza = (req, res) => {
    res.render("piezas/crear");
};

export const PostCrearPieza = async (req, res) => {
    try{
        let { codigo, nombre, descripcion, categoria, stockActual, stockMinimo, costoUnitario, precioVenta, estado } = req.body;

        codigo = codigo ? codigo.trim() : '';
        nombre = nombre ? nombre.trim() : '';

        if (!codigo || !nombre || !categoria || !stockActual || !stockMinimo || !costoUnitario || !precioVenta || !estado) {
            return res.render('piezas/crear', { 
                error: 'Todos los campos marcados con * son requeridos.', 
                pieza: req.body 
            });
        }
        if (parseInt(stockActual) < 0) return res.render('piezas/crear', { error: 'El stock actual no puede ser menor que cero.', pieza: req.body });
        if (parseInt(stockMinimo) < 0) return res.render('piezas/crear', { error: 'El stock mínimo no puede ser menor que cero.', pieza: req.body });
        if (parseFloat(costoUnitario) < 0) return res.render('piezas/crear', { error: 'El costo unitario no puede ser menor que cero.', pieza: req.body });
        if (parseFloat(precioVenta) <= 0) return res.render('piezas/crear', { error: 'El precio de venta debe ser mayor que cero.', pieza: req.body });
        if (parseFloat(precioVenta) < parseFloat(costoUnitario)) {
            return res.render('piezas/crear', { error: 'El precio de venta no puede ser menor que el costo unitario.', pieza: req.body });
        }
        const piezaExistente = await Pieza.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('codigo')), 
                codigo.toLowerCase()
            )
        });

        if (piezaExistente) {
            return res.render('piezas/crear', { 
                error: 'Ya existe una pieza registrada con ese código.', 
                pieza: req.body 
            });
        }
        const imagenPath = req.file ? `/uploads/piezas/${req.file.filename}` : null;

        await Pieza.create({
            codigo,
            nombre,
            descripcion: descripcion || null,
            categoria,
            stockActual,
            stockMinimo,
            costoUnitario,
            precioVenta,
            imagen: imagenPath,
            estado: estado || 'Activa'
        });
        res.redirect('/piezas');
    } catch (error) {
        console.error('Error al crear la pieza:', error);
        res.render('piezas/crear', { 
            error: 'Ocurrió un error interno al guardar la pieza.', 
            pieza: req.body 
        });
    }
};

export const GetEditarPieza = async (req, res) => {
    try {
        const pieza = await Pieza.findByPk(req.params.id, { raw: true });
        if (!pieza) {
            return res.redirect('/piezas');
        }
        res.render('piezas/editar', { pieza });
    } catch (error) {
        console.error('Error al obtener la pieza para editar:', error);
        res.redirect('/piezas');
    }
};

export const PostEditarPieza = async (req, res) => {
    const piezaId = req.params.id;
    try{
        let { codigo, nombre, descripcion, categoria, stockActual, stockMinimo, costoUnitario, precioVenta, estado } = req.body;

        codigo = codigo ? codigo.trim() : '';
        nombre = nombre ? nombre.trim() : '';

        if (parseInt(stockActual) < 0) return res.render('piezas/editar', { error: 'El stock actual no puede ser menor que cero.', pieza: { id: piezaId, ...req.body } });
        if (parseInt(stockMinimo) < 0) return res.render('piezas/editar', { error: 'El stock mínimo no puede ser menor que cero.', pieza: { id: piezaId, ...req.body } });
        if (parseFloat(costoUnitario) < 0) return res.render('piezas/editar', { error: 'El costo unitario no puede ser menor que cero.', pieza: { id: piezaId, ...req.body } });
        if (parseFloat(precioVenta) <= 0) return res.render('piezas/editar', { error: 'El precio de venta debe ser mayor que cero.', pieza: { id: piezaId, ...req.body } });
        if (parseFloat(precioVenta) < parseFloat(costoUnitario)) {
            return res.render('piezas/editar', { error: 'El precio de venta no puede ser menor que el costo unitario.', pieza: { id: piezaId, ...req.body } });
        }
        const piezaExistente = await Pieza.findOne({
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('codigo')), codigo.toLowerCase()),
                    { id: { [Op.ne]: piezaId } }
                ]
            }
        });

        if (piezaExistente) {
            return res.render('piezas/editar', { 
                error: 'Ya existe otra pieza registrada con ese código.', 
                pieza: { id: piezaId, ...req.body } 
            });
        }
        const piezaOriginal = await Pieza.findByPk(piezaId);
        let imagenPath = piezaOriginal.imagen;

        if(req.file){
            imagenPath = `/uploads/piezas/${req.file.filename}`;
        }
        await Pieza.update({
            codigo,
            nombre,
            descripcion: descripcion || null,
            categoria,
            stockActual,
            stockMinimo,
            costoUnitario,
            precioVenta,
            imagen: imagenPath,
            estado: estado || 'Activa'
        }, {
            where: { id: piezaId }
        });
        res.redirect('/piezas');
    } catch (error) {
        console.error("Error al editar la pieza:", error);
        res.render("piezas/editar", {
            error: "Ocurrió un error interno al actualizar la pieza.",
            pieza: { id: piezaId, ...req.body }
        });
    }
};

export const GetDetallePieza = async (req, res) => {
    try {
        const pieza = await Pieza.findByPk(req.params.id, { raw: true });
        if (!pieza) {
            return res.redirect('/piezas');
        }
        
        pieza.bajoInventario = pieza.stockActual <= pieza.stockMinimo;
        
        const usosEnOrdenes = await OrdenPieza.count({
            where: { piezaId: req.params.id }
        });
        pieza.usosEnOrdenes = usosEnOrdenes;

        res.render('piezas/detalle', { pieza });
    } catch (error) {
        console.error('Error al obtener el detalle de la pieza:', error);
        res.redirect('/piezas');
    }
};

export const PostEliminarPieza = async (req, res) => {
    try {
        const id = req.params.id;

        const usoEnOrdenes = await OrdenPieza.count({
            where: { piezaId: id }
        });

        if (usoEnOrdenes > 0) {
            return res.redirect('/piezas?error=pieza_usada');
        }

        await Pieza.destroy({
            where: { id }
        });

        res.redirect('/piezas');
    } catch (error) {
        console.error("Error al eliminar la pieza:", error);
        res.redirect('/piezas');
    }
};