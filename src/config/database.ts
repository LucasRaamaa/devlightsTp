import mongoose from 'mongoose';
import { ENV } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log(`MongoDB conectado: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('Error de conexion a MongoDB:', error);
    process.exit(1);
  }
};
