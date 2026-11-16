import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env';
import { User } from '../auth/user.model';
import { Movie } from '../movies/movie.model';

const runSeed = async (): Promise<void> => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log('Iniciando carga de datos de prueba...');

    // Limpieza de colecciones existentes
    await User.deleteMany({});
    await Movie.deleteMany({});

    // Creacion de contraseñas hasheadas
    const salt = await bcrypt.genSalt(10);
    const passwordUser = await bcrypt.hash('User123!', salt);
    const passwordAdmin = await bcrypt.hash('Admin123!', salt);

    // Creacion de usuarios
    const adminUser = await User.create({
      nombre: 'Administrador General',
      email: 'admin@example.com',
      password: passwordAdmin,
      rol: 'admin',
    });

    const regularUser = await User.create({
      nombre: 'Usuario Estandar',
      email: 'user@example.com',
      password: passwordUser,
      rol: 'user',
    });

    console.log('Usuarios creados: admin@example.com (admin) y user@example.com (user)');

    // Creacion de peliculas de prueba
    await Movie.insertMany([
      {
        titulo: 'Inception',
        director: 'Christopher Nolan',
        genero: 'Ciencia Ficcion',
        puntaje: 9.0,
        anio: 2010,
        createdBy: adminUser._id,
      },
      {
        titulo: 'Interstellar',
        director: 'Christopher Nolan',
        genero: 'Ciencia Ficcion',
        puntaje: 9.5,
        anio: 2014,
        createdBy: adminUser._id,
      },
      {
        titulo: 'El Padrino',
        director: 'Francis Ford Coppola',
        genero: 'Drama',
        puntaje: 10.0,
        anio: 1972,
        createdBy: regularUser._id,
      },
      {
        titulo: 'Pulp Fiction',
        director: 'Quentin Tarantino',
        genero: 'Crimen',
        puntaje: 8.9,
        anio: 1994,
        createdBy: regularUser._id,
      },
      {
        titulo: 'El Conjuro',
        director: 'James Wan',
        genero: 'Terror',
        puntaje: 7.5,
        anio: 2013,
        createdBy: regularUser._id,
      },
    ]);

    console.log('Peliculas cargadas con exito.');
    console.log('Proceso de seed finalizado.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la ejecucion del seed:', error);
    process.exit(1);
  }
};

runSeed();
