import { Router } from 'express';
import { movieController } from './movie.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

router.get('/', (req, res) => movieController.getAll(req, res));
router.get('/:id', (req, res) => movieController.getById(req, res));
router.post('/', authMiddleware, (req, res) => movieController.create(req, res));
router.put('/:id', authMiddleware, (req, res) => movieController.update(req, res));
router.delete('/:id', authMiddleware, requireAdmin, (req, res) => movieController.delete(req, res));

export default router;
