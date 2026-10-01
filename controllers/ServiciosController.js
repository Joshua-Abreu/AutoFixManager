import Servicio from "../models/Servicio.js";
import { Op, Sequelize } from "sequelize";

export const GetServicios =  async (req , res) => {
    try{
        const servicios = await Servicio.findAll({ raw: true });
        res.render("servicios/index", {servicios});
    } catch (error){
        console.error("Error al listar los servicios:", error);
        res.status(500).send("Error interno del servidor al cargar los servicios");
    }
};

export const GetCrearServicio = (req, res) => {
    res.render("servicios/crear");
};

export const PostCrearServicio = async (req, res) => {
    try{
        let { nombre, descripcion, categoria, precioBase, duracionEstimada, estado } = req.body;

        nombre = nombre ? nombre.trim() : "";

        if(!nombre || !categoria || !precioBase || !estado){
            return res.render("servicios/crear", {
                error: "Los campos Nombre, Categoría, Precio Base y Estado son requeridos.",
                servicio: req.body
            });
        }
        if(parseFloat(precioBase) <= 0){
            return res.render("servicios/crear", {
                error: "El precio base debe ser mayor que cero.",
                servicio: req.body
            });
        }
        if(duracionEstimada && parseInt(duracionEstimada) <= 0){
            return res.render("servicios/crear", {
                error: "La duración estimada debe ser mayor que cero.",
                servicio: req.body  
            });
        }
        const servicioExistente = await Servicio.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('nombre')), 
                nombre.toLowerCase()
            )
        });
        if (servicioExistente) {
            return res.render('servicios/crear', { 
                error: 'Ya existe un servicio registrado con ese nombre.', 
                servicio: req.body 
            });
        }
        await Servicio.create({
            nombre,
            descripcion: descripcion || null,
            categoria,
            precioBase,
            duracionEstimada: duracionEstimada || null,
            estado: estado || "Activo"
        });
        res.redirect("/servicios");
    } catch (error){
        console.error("Error al crear el servicio:", error);
        res.render("servicios/crear", {
            error: "Ocurrió un error al crear el servicio.",
            servicio: req.body
        });
    }
};

export const GetEditarServicio = async (req, res) => {
    try{
        const servicio = await Servicio.findByPk(req.params.id, { raw: true });
        if(!servicio){
            return res.redirect("/servicios");
        }
        res.render("servicios/editar", { servicio });
    } catch (error){
        console.error("Error al mostrar el formulario de edición:", error);
        res.redirect("/servicios");
    }
};

export const PostEditarServicio = async (req, res) => {
    const servicioId = req.params.id;
    try{
        let { nombre, descripcion, categoria, precioBase, duracionEstimada, estado } = req.body;

        nombre = nombre ? nombre.trim() : "";
        if (!nombre || !categoria || !precioBase || !estado) {
            return res.render("servicios/editar", {
                error: "Los campos Nombre, Categoría, Precio Base y Estado son requeridos.",
                servicio: { id: servicioId, ...req.body }
            });
        }
        if(parseFloat(precioBase) <= 0){
            return res.render("servicios/editar", {
                error: "El precio base debe ser mayor que cero.",
                servicio: { id: servicioId, ...req.body }
            });
        }
        if (duracionEstimada && parseInt(duracionEstimada) <= 0) {
            return res.render("servicios/editar", {
                error: "La duración estimada debe ser mayor que cero.",
                servicio: { id: servicioId, ...req.body } 
            });
        }
        const servicioExistente = await Servicio.findOne({
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('nombre')), nombre.toLowerCase()),
                    { id: { [Op.ne]: servicioId } }
                ]
            }
        });

        if (servicioExistente) {
            return res.render('servicios/editar', { 
                error: 'Ya existe otro servicio registrado con ese nombre.', 
                servicio: { id: servicioId, ...req.body } 
            });
        }
        await Servicio.update({
            nombre,
            descripcion: descripcion || null,
            categoria,
            precioBase,
            duracionEstimada: duracionEstimada || null,
            estado: estado || "Activo"
        }, {
            where: { id: servicioId }
        });

        res.redirect('/servicios');
    }catch (error){
        console.error("Error al editar el servicio:", error);
        res.render("servicios/editar", {
            error: "Ocurrió un error al editar el servicio.",
            servicio: { id: servicioId, ...req.body }
        });
    }
};

export const GetDetalleServicio = async (req, res) => {
    try{
        const servicio = await Servicio.findByPk(req.params.id, { raw: true });
        if(!servicio){
            return res.redirect("/servicios");
        }
        res.render("servicios/detalle", { servicio });
    } catch (error) {
        console.error("Error al ver el detalle del servicio:", error);
        res.redirect("/servicios");
    }
};

export const PostEliminarServicio = async (req, res) => {
    try {
        const id = req.params.id;
        
        await Servicio.destroy({ 
            where: { id } 
        });
        
        res.redirect('/servicios');
    } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        res.redirect('/servicios');
    }
};
   
        