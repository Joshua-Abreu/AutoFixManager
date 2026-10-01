import express from 'express';
import { GetPiezas, GetCrearPieza, PostCrearPieza, GetEditarPieza, PostEditarPieza, GetDetallePieza, PostEliminarPieza } from '../controllers/PiezasController.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/', GetPiezas);
router.get('/crear', GetCrearPieza);
router.post('/crear', (req, res, next) => {
    upload.single('imagen')(req, res, function (err) {
        if (err) {
            return res.render('piezas/crear', { error: err.message, pieza: req.body });
        }
        next();
    });
}, PostCrearPieza);

router.get('/editar/:id', GetEditarPieza);
router.post('/editar/:id', (req, res, next) => {
    upload.single('imagen')(req, res, function (err) {
        if (err) return res.render('piezas/editar', { error: err.message, pieza: { id: req.params.id, ...req.body } });
        next();
    });
}, PostEditarPieza);

router.get('/detalle/:id', GetDetallePieza);
router.post('/eliminar/:id', PostEliminarPieza);


export default router;