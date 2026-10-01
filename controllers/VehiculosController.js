import Vehiculo from "../models/Vehiculo.js";
import Marca from "../models/Marca.js";
import { Op, Sequelize } from "sequelize";
import OrdenTrabajo from "../models/OrdenTrabajo.js";


export const GetVehiculos = async (req, res) => {
    try {
        const { marcaId, estado, placa, error } = req.query;
        let condicionesDeBusqueda = {};

        if (marcaId) condicionesDeBusqueda.marcaId = marcaId;
        if (estado) condicionesDeBusqueda.estado = estado;
        if (placa) {
            condicionesDeBusqueda.placa = { [Op.like]: `%${placa}%` };
        }

        const vehiculos = await Vehiculo.findAll({
            where: condicionesDeBusqueda,
            include: [{
                model: Marca,
                as: 'marca', 
                attributes: ['nombre'] 
            }],
            raw: true,
            nest: true
        });

        const marcas = await Marca.findAll({
            where: { estado: 'Activa' },
            raw: true
        });

        let mensajeError = null;
        if (error === 'tiene_ordenes') {
            mensajeError = 'No se puede eliminar este vehículo porque tiene órdenes de trabajo asociadas.';
        }

        res.render("vehiculos/index", {
            vehiculos,
            marcas,
            filtros: req.query,
            mensajeError
        });
    } catch (error) {
        console.error("Error al listar los vehículos:", error);
        res.status(500).send("Error interno del servidor al cargar los vehículos");
    }
};

export const GetCrearVehiculo = async (req, res) => {
    try{
        const marcas = await Marca.findAll({
            where: { estado: "Activa"},
            raw: true
        });
        res.render("vehiculos/crear", { marcas });
    } catch (error) {
        console.error("Error al cargar el formulario de creación:", error);
        res.redirect("/vehiculos");
    }
};

export const PostCrearVehiculo = async (req, res) => {
    try{
        let { placa, marcaId, modelo, anio, color, tipoVehiculo, propietarioNombre, propietarioTelefono, propietarioCorreo, kilometraje, estado } = req.body; 
       placa = placa ? placa.replace(/\s+/g, '') : '';

        const marcas = await Marca.findAll({ where: { estado: 'Activa' }, raw: true });
        if (!placa || !marcaId || !modelo || !anio || !color || !tipoVehiculo || !propietarioNombre || !propietarioTelefono || !kilometraje || !estado) {
            return res.render('vehiculos/crear', { error: 'Todos los campos obligatorios deben ser completados.', vehiculo: req.body, marcas });
        }

        const currentYear = new Date().getFullYear();
        const anioInt = parseInt(anio);
        if (anioInt < 1980 || anioInt > currentYear + 1) {
            return res.render('vehiculos/crear', { error: 'El año del vehículo no es válido.', vehiculo: req.body, marcas });
        } 
        if (parseFloat(kilometraje) < 0) {
            return res.render('vehiculos/crear', { error: 'El kilometraje actual no puede ser menor que cero.', vehiculo: req.body, marcas });
        }
        if (propietarioCorreo) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(propietarioCorreo)) {
                return res.render('vehiculos/crear', { error: 'El correo electrónico no tiene un formato válido.', vehiculo: req.body, marcas });
            }
        }
        const vehiculoExistente = await Vehiculo.findOne({
            where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('placa')), placa.toLowerCase())
        });

        if (vehiculoExistente) {
            return res.render('vehiculos/crear', { error: 'Ya existe un vehículo registrado con esta placa.', vehiculo: req.body, marcas });
        }
        const imagenPath = req.file ? `/uploads/vehiculos/${req.file.filename}` : null;
        
        await Vehiculo.create({
            placa, marcaId, modelo, anio: anioInt, color, tipoVehiculo,
            propietarioNombre, propietarioTelefono, 
            propietarioCorreo: propietarioCorreo || null,
            kilometraje, imagen: imagenPath,
            estado: estado || 'Registrado'
        });
        res.redirect("/vehiculos");
    } catch (error) {
        console.error("Error al crear el vehículo:", error);
        const marcas = await Marca.findAll({ where: { estado: 'Activa' }, raw: true });
        res.render('vehiculos/crear', { error: 'Ocurrió un error al guardar el vehículo.', vehiculo: req.body, marcas });
    }
};

export const GetEditarVehiculo = async (req, res) => {
    try{
        const vehiculo =  await Vehiculo.findByPk(req.params.id, { raw: true });
        if(!vehiculo) {
            return res.redirect("/vehiculos");
        }
        const marcas = await Marca.findAll({ 
            where: {
                [Op.or]: [
                    { estado: 'Activa' },
                    { id: vehiculo.marcaId }
                ]
            },
            raw: true 
        });
        res.render("vehiculos/editar", { vehiculo, marcas });
    } catch (error) {
        console.error("Error al obtener el vehículo para editar:", error);
        res.redirect("/vehiculos");
    }
};

export const PostEditarVehiculo = async (req, res) => {
    const vehiculoId = req.params.id;
    try{
        let { placa, marcaId, modelo, anio, color, tipoVehiculo, propietarioNombre, propietarioTelefono, propietarioCorreo, kilometraje, estado } = req.body;
        placa = placa ? placa.replace(/\s+/g, '') : '';

        const anioInt = parseInt(anio);
        const currentYear = new Date().getFullYear();
        if (anioInt < 1980 || anioInt > currentYear + 1) {
            const marcas = await Marca.findAll({ where: { estado: 'Activa' }, raw: true });
            return res.render('vehiculos/editar', { error: 'El año del vehículo no es válido.', vehiculo: { id: vehiculoId, ...req.body }, marcas });
        }

        if (parseFloat(kilometraje) < 0) {
            const marcas = await Marca.findAll({ where: { estado: 'Activa' }, raw: true });
            return res.render('vehiculos/editar', { error: 'El kilometraje no puede ser menor que cero.', vehiculo: { id: vehiculoId, ...req.body }, marcas });
        }

        if (propietarioCorreo) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(propietarioCorreo)) {
                const marcas = await Marca.findAll({ where: { estado: 'Activa' }, raw: true });
                return res.render('vehiculos/editar', { error: 'El correo electrónico no es válido.', vehiculo: { id: vehiculoId, ...req.body }, marcas });
            }
        }
        const vehiculoExistente = await Vehiculo.findOne({
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('placa')), placa.toLowerCase()),
                    { id: { [Op.ne]: vehiculoId } }
                ]
            }
        });

        if (vehiculoExistente) {
            const marcas = await Marca.findAll({ where: { estado: 'Activa' }, raw: true });
            return res.render('vehiculos/editar', { error: 'Ya existe otro vehículo con esta placa.', vehiculo: { id: vehiculoId, ...req.body }, marcas });
        }
        const vehiculoOriginal = await Vehiculo.findByPk(vehiculoId);
        let imagenPath = vehiculoOriginal.imagen; 

        if (req.file) {
            imagenPath = `/uploads/vehiculos/${req.file.filename}`;
        }

        await Vehiculo.update({
            placa, marcaId, modelo, anio: anioInt, color, tipoVehiculo,
            propietarioNombre, propietarioTelefono, 
            propietarioCorreo: propietarioCorreo || null,
            kilometraje, imagen: imagenPath,
            estado: estado || 'Registrado'
        }, {
            where: { id: vehiculoId }
        });

        res.redirect('/vehiculos');
    } catch (error) {
        console.error('Error al editar el vehículo:', error);
        const marcas = await Marca.findAll({ where: { estado: 'Activa' }, raw: true });
        res.render('vehiculos/editar', { error: 'Ocurrió un error al actualizar el vehículo.', vehiculo: { id: vehiculoId, ...req.body }, marcas });
    }
};

export const GetDetalleVehiculo = async (req, res) => {
    try {
        const vehiculo = await Vehiculo.findByPk(req.params.id, {
            include: [{
                model: Marca,
                as: 'marca',
                attributes: ['nombre']
            }],
            raw: true,
            nest: true
        });

        if (!vehiculo) {
            return res.redirect('/vehiculos');
        }

        const cantidadOrdenes = await OrdenTrabajo.count({
            where: { vehiculoId: req.params.id }
        });

        vehiculo.cantidadOrdenes = cantidadOrdenes; 

        res.render('vehiculos/detalle', { vehiculo });
    } catch (error) {
        console.error('Error al obtener el detalle del vehículo:', error);
        res.redirect('/vehiculos');
    }
};

export const PostEliminarVehiculo = async (req, res) => {
    try {
        const id = req.params.id;
       
        const ordenesAsociadas = await OrdenTrabajo.count({
            where: { vehiculoId: id }
        });

        if (ordenesAsociadas > 0) {
            console.log(`Bloqueo de seguridad: El vehículo ID ${id} tiene ${ordenesAsociadas} órdenes asociadas.`);
            return res.redirect('/vehiculos?error=tiene_ordenes');
        }

        await Vehiculo.destroy({ 
            where: { id } 
        });
        
        res.redirect('/vehiculos');
    } catch (error) {
        console.error('Error al eliminar el vehículo:', error);
        res.redirect('/vehiculos');
    }
};
    