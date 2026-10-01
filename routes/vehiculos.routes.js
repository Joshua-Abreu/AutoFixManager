import express from "express";
import { GetVehiculos, GetCrearVehiculo, PostCrearVehiculo, GetEditarVehiculo, PostEditarVehiculo, GetDetalleVehiculo, PostEliminarVehiculo } from "../controllers/VehiculosController.js";
import { uploadVehiculo } from "../middlewares/uploadVehiculo.js";

const router = express.Router();

router.get("/", GetVehiculos);
router.get("/crear", GetCrearVehiculo);
router.post("/crear", (req, res, next) => {
    uploadVehiculo.single("imagen")(req, res, async function (err){
        if (err) {
            const { default: Marca } = await import('../models/Marca.js');
            const marcas = await Marca.findAll({ where: { estado: 'Activa' }, raw: true });
            return res.render('vehiculos/crear', { error: err.message, vehiculo: req.body, marcas });
        }
        next();
    });
}, PostCrearVehiculo);

router.get("/editar/:id", GetEditarVehiculo);
router.post("/editar/:id", (req, res, next) => {
    uploadVehiculo.single('imagen')(req, res, async function (err) {
        if (err) {
            const { default: Marca } = await import('../models/Marca.js');
            const marcas = await Marca.findAll({ where: { estado: 'Activa' }, raw: true });
            return res.render('vehiculos/editar', { error: err.message, vehiculo: { id: req.params.id, ...req.body }, marcas });
        }
        next();
    });
}, PostEditarVehiculo);

router.get("/detalle/:id", GetDetalleVehiculo);
router.post("/eliminar/:id", PostEliminarVehiculo);

export default router;