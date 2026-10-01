import { Router } from "express";
import { GetMarcas, GetCrearMarca, PostCrearMarca, GetEditarMarca, PostEditarMarca, GetDetalleMarca, PostEliminarMarca } from "../controllers/MarcasController.js";

const router = Router();

router.get("/", GetMarcas);
router.get("/crear", GetCrearMarca);
router.post("/crear", PostCrearMarca);

router.get("/editar/:id", GetEditarMarca);
router.post("/editar/:id", PostEditarMarca);

router.get("/detalle/:id", GetDetalleMarca);
router.post("/eliminar/:id", PostEliminarMarca);
export default router;