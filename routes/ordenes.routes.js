import express from 'express';
import { uploadEvidencia } from '../middlewares/uploadEvidencia.js';
import { GetOrdenes, GetCrearOrden, PostCrearOrden, GetEditarOrden, PostEditarOrden, GetDetalleOrden, PostAgregarServicio, PostEliminarServicio, PostAgregarPieza, PostEliminarPieza, PostAgregarEvidencia, PostEliminarEvidencia } from '../controllers/OrdenesController.js';

const router = express.Router();

router.get('/', GetOrdenes);
router.get('/crear', GetCrearOrden);
router.post('/crear', PostCrearOrden);
router.get('/editar/:id', GetEditarOrden);
router.post('/editar/:id', PostEditarOrden);
router.get('/detalle/:id', GetDetalleOrden);
router.post('/agregar-servicio/:id', PostAgregarServicio);
router.post('/eliminar-servicio/:id', PostEliminarServicio);
router.post('/agregar-pieza/:id', PostAgregarPieza);
router.post('/eliminar-pieza/:id', PostEliminarPieza);
router.post('/agregar-evidencia/:id', (req, res, next) => {
    uploadEvidencia.single('imagen')(req, res, function (err) {
        if (err) {
            let mensajeError = 'Error al subir la imagen.';
            if (err.code === 'LIMIT_FILE_SIZE') {
                mensajeError = 'La imagen no debe exceder 2 MB.';
            } 
            else if (err.message) {
                mensajeError = err.message;
            }
            return res.redirect(`/ordenes/detalle/${req.params.id}?error=${encodeURIComponent(mensajeError)}`);
        }
        next();
    });
}, PostAgregarEvidencia);
router.post('/eliminar-evidencia/:id', PostEliminarEvidencia);
export default router;