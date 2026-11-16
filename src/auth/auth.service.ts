import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from './user.model';
import { ENV } from '../config/env';

export interface RegisterDTO {
  nombre: string;
  email: string;
  password: string;
  rol?: 'user' | 'admin';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  };
  token: string;
}

export class AuthService {
  /**
   * Registra un nuevo usuario hasheando la contraseña con Bcrypt
   */
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const emailNormalized = data.email.trim().toLowerCase();

    // Validar si el usuario ya existe
    const existingUser = await User.findOne({ email: emailNormalized });
    if (existingUser) {
      throw new Error(`El email "${data.email}" ya está registrado`);
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('La contraseña debe tener un mínimo de 6 caracteres');
    }

    // Hasheo de contraseña con Salt (10 rondas)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Crear y guardar el usuario
    const newUser = new User({
      nombre: data.nombre.trim(),
      email: emailNormalized,
      password: hashedPassword,
      rol: data.rol || 'user',
    });

    const savedUser = await newUser.save();

    // Generar JWT (sin incluir datos sensibles como el password)
    const token = this.generateToken(savedUser);

    return {
      user: {
        id: savedUser._id.toString(),
        nombre: savedUser.nombre,
        email: savedUser.email,
        rol: savedUser.rol,
      },
      token,
    };
  }

  /**
   * Autentica un usuario y genera un JWT
   */
  async login(credentials: LoginDTO): Promise<AuthResponse> {
    const emailNormalized = credentials.email.trim().toLowerCase();

    // Buscar usuario por email
    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      throw new Error('Credenciales inválidas: usuario o contraseña incorrectos');
    }

    // Comparar password con el hash guardado
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas: usuario o contraseña incorrectos');
    }

    // Generar JWT
    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
      token,
    };
  }

  /**
   * Genera un JSON Web Token firmado con el secreto del .env
   */
  private generateToken(user: IUser): string {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
    };

    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: '24h',
    });
  }
}

export const authService = new AuthService();

