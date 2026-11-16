import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'No autorizado: se requiere autenticación previa',
    });
    return;
  }

  if (req.user.rol !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado: esta acción requiere permisos de administrador (rol: admin)',
    });
    return;
  }

  next();
};

