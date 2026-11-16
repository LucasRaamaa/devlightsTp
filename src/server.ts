import app from './app';
import { ENV } from './config/env';
import { connectDB } from './config/database';

const startServer = async () => {
  try {
    // 1. Conectar a MongoDB
    await connectDB();

    // 2. Levantar el servidor Express
    app.listen(ENV.PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${ENV.PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al inicializar el servidor:', error);
  }
};

startServer();

