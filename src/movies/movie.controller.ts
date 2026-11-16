import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { movieService } from './movie.service';

export class MovieController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { genero, director, minPuntaje } = req.query;

      const movies = await movieService.findAll({
        genero: genero ? String(genero) : undefined,
        director: director ? String(director) : undefined,
        minPuntaje: minPuntaje ? Number(minPuntaje) : undefined,
      });

      res.status(200).json({
        success: true,
        total: movies.length,
        data: movies,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener las películas',
        error: error.message,
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'El ID proporcionado no tiene un formato válido de MongoDB',
        });
        return;
      }

      const movie = await movieService.findById(id);
      if (!movie) {
        res.status(404).json({
          success: false,
          message: `No se encontró la película con el ID: ${id}`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: movie,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al buscar la película',
        error: error.message,
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { titulo, director, genero, puntaje, anio } = req.body;

      if (!titulo || !director || !genero || puntaje === undefined) {
        res.status(400).json({
          success: false,
          message: 'Campos obligatorios requeridos: titulo, director, genero, puntaje',
        });
        return;
      }

      const createdBy = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;

      const newMovie = await movieService.create({
        titulo,
        director,
        genero,
        puntaje: Number(puntaje),
        anio: anio !== undefined ? Number(anio) : undefined,
        createdBy,
      });

      res.status(201).json({
        success: true,
        message: 'Película creada exitosamente',
        data: newMovie,
      });
    } catch (error: any) {
      if (
        error.name === 'ValidationError' ||
        error.message.includes('Validación de negocio') ||
        error.message.includes('Ya existe')
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear la película',
        error: error.message,
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'El ID proporcionado no tiene un formato válido de MongoDB',
        });
        return;
      }

      const updatedMovie = await movieService.update(id, req.body);
      if (!updatedMovie) {
        res.status(404).json({
          success: false,
          message: `No se encontró la película con el ID: ${id} para actualizar`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Película actualizada exitosamente',
        data: updatedMovie,
      });
    } catch (error: any) {
      if (
        error.name === 'ValidationError' ||
        error.message.includes('Validación de negocio') ||
        error.message.includes('Ya existe')
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al actualizar la película',
        error: error.message,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'El ID proporcionado no tiene un formato válido de MongoDB',
        });
        return;
      }

      const deletedMovie = await movieService.delete(id);
      if (!deletedMovie) {
        res.status(404).json({
          success: false,
          message: `No se encontró la película con el ID: ${id} para eliminar`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Película eliminada correctamente',
        data: deletedMovie,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al eliminar la película',
        error: error.message,
      });
    }
  }
}

export const movieController = new MovieController();
