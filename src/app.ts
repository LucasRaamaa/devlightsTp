import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middlewares/logger.middleware';
import movieRoutes from './movies/movie.routes';
import authRoutes from './auth/auth.routes';

const app: Application = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware); // Extra: Middleware de logging para registrar método y URL

// Ruta base de información
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'API Catálogo de Películas - TP Integrador Devlights',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      movies: '/api/movies',
      auth: '/api/auth',
    },
  });
});

// Rutas de componentes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// Manejo de rutas no encontradas (404)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

export default app;
