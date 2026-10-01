import { Router } from "express";
import { GetServicios, GetCrearServicio, PostCrearServicio, GetEditarServicio, PostEditarServicio, GetDetalleServicio, PostEliminarServicio } from "../controllers/ServiciosController.js";

const router = Router();

router.get("/", GetServicios);
router.get("/crear", GetCrearServicio);
router.post("/crear", PostCrearServicio);

router.get("/editar/:id", GetEditarServicio);
router.post("/editar/:id", PostEditarServicio);

router.get("/detalle/:id", GetDetalleServicio);
router.post("/eliminar/:id", PostEliminarServicio);
export default router;