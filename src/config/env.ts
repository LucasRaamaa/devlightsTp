import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/catalogo_peliculas',
  JWT_SECRET: process.env.JWT_SECRET || 'clave_secreta_para_firmar_jwt_devlights_2026',
};

