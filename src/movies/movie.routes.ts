import { Router } from 'express';
import { movieController } from './movie.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// Rutas públicas (Lectura)
router.get('/', (req, res) => movieController.getAll(req, res));
router.get('/:id', (req, res) => movieController.getById(req, res));

// Rutas protegidas con autenticación JWT
router.post('/', authMiddleware, (req, res) => movieController.create(req, res));
router.put('/:id', authMiddleware, (req, res) => movieController.update(req, res));

// Ruta protegida con autenticación JWT y control de rol (Solo Administradores pueden eliminar)
router.delete('/:id', authMiddleware, requireAdmin, (req, res) => movieController.delete(req, res));

export default router;
