import { Movie, IMovie } from './movie.model';

export interface MovieFilters {
  genero?: string;
  director?: string;
  minPuntaje?: number;
}

export class MovieService {
  /**
   * Obtiene todas las películas con soporte para filtros por query params (Extra)
   */
  async findAll(filters: MovieFilters = {}): Promise<IMovie[]> {
    const query: Record<string, any> = {};

    if (filters.genero) {
      query.genero = { $regex: new RegExp(filters.genero, 'i') };
    }

    if (filters.director) {
      query.director = { $regex: new RegExp(filters.director, 'i') };
    }

    if (filters.minPuntaje !== undefined && !isNaN(filters.minPuntaje)) {
      query.puntaje = { $gte: Number(filters.minPuntaje) };
    }

    return Movie.find(query).populate('createdBy', 'nombre email rol');
  }

  /**
   * Obtiene una película por su ID
   */
  async findById(id: string): Promise<IMovie | null> {
    return Movie.findById(id).populate('createdBy', 'nombre email rol');
  }

  /**
   * Crea una nueva película aplicando validaciones de negocio
   */
  async create(movieData: Partial<IMovie>): Promise<IMovie> {
    this.validateBusinessRules(movieData);

    const existingMovie = await Movie.findOne({
      titulo: { $regex: new RegExp(`^${movieData.titulo?.trim()}$`, 'i') },
    });
    if (existingMovie) {
      throw new Error(`Ya existe una película registrada con el título "${movieData.titulo}"`);
    }

    const movie = new Movie(movieData);
    return await movie.save();
  }

  /**
   * Actualiza una película existente por su ID con validaciones de negocio
   */
  async update(id: string, movieData: Partial<IMovie>): Promise<IMovie | null> {
    this.validateBusinessRules(movieData);

    if (movieData.titulo) {
      const existingMovie = await Movie.findOne({
        _id: { $ne: id },
        titulo: { $regex: new RegExp(`^${movieData.titulo?.trim()}$`, 'i') },
      });
      if (existingMovie) {
        throw new Error(`Ya existe otra película con el título "${movieData.titulo}"`);
      }
    }

    return Movie.findByIdAndUpdate(id, movieData, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'nombre email rol');
  }

  /**
   * Elimina una película por su ID
   */
  async delete(id: string): Promise<IMovie | null> {
    return Movie.findByIdAndDelete(id);
  }

  /**
   * Validaciones de reglas de negocio requeridas por la consigna
   */
  private validateBusinessRules(movieData: Partial<IMovie>): void {
    // Regla 1: El puntaje debe estar comprendido entre 1 y 10
    if (movieData.puntaje !== undefined) {
      if (typeof movieData.puntaje !== 'number' || movieData.puntaje < 1 || movieData.puntaje > 10) {
        throw new Error('Validación de negocio: El puntaje de la película debe ser un número entre 1 y 10');
      }
    }

    // Regla 2: El año no puede ser anterior a 1888 ni superar el año próximo
    if (movieData.anio !== undefined) {
      const maxYear = new Date().getFullYear() + 2;
      if (typeof movieData.anio !== 'number' || movieData.anio < 1888 || movieData.anio > maxYear) {
        throw new Error(`Validación de negocio: El año de estreno debe ser un año válido entre 1888 y ${maxYear}`);
      }
    }
  }
}

export const movieService = new MovieService();

