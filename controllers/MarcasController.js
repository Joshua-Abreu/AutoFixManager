import Marca from "../models/Marca.js";
import Vehiculo from "../models/Vehiculo.js";
import { Op, Sequelize } from "sequelize";

export const GetMarcas = async (req, res) => {
    try {
        const marcasBase = await Marca.findAll({ raw: true });
        
        const marcas = await Promise.all(marcasBase.map(async (marca) => {
            const cantidad = await Vehiculo.count({ 
                where: { marcaId: marca.id } 
            });
            
            return {
                ...marca,
                cantidadVehiculos: cantidad
            };
        }));

        res.render('marcas/index', { marcas });
    } catch (error) {
        console.error('Error al listar las marcas:', error);
        res.status(500).send('Error interno del servidor');
    }
};

export const GetCrearMarca = (req, res) => {
    res.render("marcas/crear");
};

export const PostCrearMarca = async (req, res) => {
    try{
        let {nombre, paisOrigen, estado} = req.body;

        nombre = nombre ? nombre.trim() : "";
        paisOrigen = paisOrigen ? paisOrigen.trim() : "";

        if(!nombre){
            return res.render("marcas/crear", {
                error: 'El nombre de la marca es requerido.', 
                marca: req.body 
            });
        }

        const marcaExistente = await Marca.findOne({
            where: Sequelize.where(
                Sequelize.fn("LOWER", Sequelize.col("nombre")),
                nombre.toLowerCase()
            )
        });
                
        if(marcaExistente){
            return res.render("marcas/crear", {
                error: 'Ya existe una marca con ese nombre.',
                marca: req.body
            });
        }
        await Marca.create({
            nombre,
            paisOrigen: paisOrigen || null,
            estado: estado || "Activa"
        });
        res.redirect("/marcas");
    } catch (error){
        console.error("Error al crear la marca:", error);
        res.render("marcas/crear", {
            error: 'Ocurrió un error al crear la marca. Por favor, inténtelo de nuevo.',
            marca: req.body
        });
    }
};

export const GetEditarMarca = async (req, res) => {
    try {
        const marca = await Marca.findByPk(req.params.id, { raw: true });
        if (!marca) {
            return res.redirect('/marcas'); 
        }
        res.render('marcas/editar', { marca });
    } catch (error) {
        console.error('Error al obtener la marca para editar:', error);
        res.redirect('/marcas');
    }
};

export const PostEditarMarca = async (req, res) => {
    const marcaId = req.params.id;
    try {
        let { nombre, paisOrigen, estado } = req.body;

        nombre = nombre ? nombre.trim() : '';
        paisOrigen = paisOrigen ? paisOrigen.trim() : '';

        if (!nombre) {
            return res.render('marcas/editar', { 
                error: 'El nombre de la marca es requerido.', 
                marca: { id: marcaId, nombre, paisOrigen, estado } 
            });
        }

        const marcaExistente = await Marca.findOne({
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('nombre')), nombre.toLowerCase()),
                    { id: { [Op.ne]: marcaId } }
                ]
            }
        });

        if (marcaExistente) {
            return res.render('marcas/editar', { 
                error: 'Ya existe otra marca registrada con ese nombre.', 
                marca: { id: marcaId, nombre, paisOrigen, estado } 
            });
        }

        await Marca.update({
            nombre,
            paisOrigen: paisOrigen || null,
            estado: estado || 'Activa'
        }, {
            where: { id: marcaId }
        });

        res.redirect('/marcas');

    } catch (error) {
        console.error('Error al editar la marca:', error);
        res.render('marcas/editar', { 
            error: 'Ocurrió un error interno al actualizar la marca.', 
            marca: { id: marcaId, ...req.body }
        });
    }
};

export const GetDetalleMarca = async (req, res) => {
    try {
        const marca = await Marca.findByPk(req.params.id, { raw: true });
        
        if (!marca) {
            return res.redirect('/marcas');
        }

        const cantidadVehiculos = await Vehiculo.count({
            where: { marcaId: req.params.id }
        });

        res.render('marcas/detalle', {
            marca,
            cantidadVehiculos
        });
    } catch (error) {
        console.error('Error al obtener el detalle de la marca:', error);
        res.redirect('/marcas');
    }
};

export const PostEliminarMarca = async (req, res) => {
    try {
        const id = req.params.id;

         const cantidadVehiculos = await Vehiculo.count({ 
            where: { marcaId: id } 
        });

        if (cantidadVehiculos > 0) {
            const marcasBase = await Marca.findAll({ raw: true });
            const marcas = await Promise.all(marcasBase.map(async (marca) => {
                const cantidad = await Vehiculo.count({ where: { marcaId: marca.id } });
                return { ...marca, cantidadVehiculos: cantidad };
            }));

            return res.render('marcas/index', { 
                marcas, 
                error: 'No se puede eliminar la marca porque tiene vehículos registrados en el sistema.' 
            });
        }

        await Marca.destroy({ where: { id } });
        res.redirect('/marcas');

    } catch (error) {
        console.error('Error al eliminar la marca:', error);
        res.redirect('/marcas');
    }
};