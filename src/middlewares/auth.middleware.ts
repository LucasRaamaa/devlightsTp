import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { JwtUserPayload } from '../types/express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Acceso denegado: falta el token de autenticación (Header Authorization: Bearer <token>)',
      });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        message: 'Formato de token inválido. El formato esperado es: Bearer <token>',
      });
      return;
    }

    const token = parts[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtUserPayload;

    // Adjuntar la información del usuario autenticado a la petición
    req.user = decoded;

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado. Por favor inicia sesión nuevamente.',
      error: error.message,
    });
  }
};

