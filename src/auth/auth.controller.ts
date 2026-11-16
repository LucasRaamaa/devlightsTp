import { Request, Response } from 'express';
import { authService } from './auth.service';

export class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, email, password, rol } = req.body;

      if (!nombre || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: nombre, email y password son requeridos',
        });
        return;
      }

      const result = await authService.register({
        nombre,
        email,
        password,
        rol,
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
      });
    } catch (error: any) {
      if (error.message.includes('ya está registrado') || error.message.includes('contraseña debe tener') || error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor durante el registro',
        error: error.message,
      });
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Faltan credenciales: email y password son requeridos',
        });
        return;
      }

      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result,
      });
    } catch (error: any) {
      if (error.message.includes('Credenciales inválidas')) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor durante el login',
        error: error.message,
      });
    }
  }
}

export const authController = new AuthController();

