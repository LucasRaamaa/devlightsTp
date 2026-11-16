import app from './app';
import { ENV } from './config/env';
import { connectDB } from './config/database';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(ENV.PORT, () => {
      console.log(`Servidor activo en el puerto ${ENV.PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
