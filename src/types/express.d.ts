export interface JwtUserPayload {
  id: string;
  email: string;
  rol: 'user' | 'admin';
  nombre: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

