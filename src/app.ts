import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middlewares/logger.middleware';
import movieRoutes from './movies/movie.routes';
import authRoutes from './auth/auth.routes';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    name: 'API Catalogo de Peliculas',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      auth: '/api/auth',
      movies: '/api/movies',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

export default app;
