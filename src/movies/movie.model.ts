import { Schema, model, Document, Types } from 'mongoose';

export interface IMovie extends Document {
  titulo: string;
  director: string;
  genero: string;
  puntaje: number;
  anio?: number;
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const movieSchema = new Schema<IMovie>(
  {
    titulo: {
      type: String,
      required: [true, 'El título de la película es obligatorio'],
      trim: true,
      unique: true,
    },
    director: {
      type: String,
      required: [true, 'El director de la película es obligatorio'],
      trim: true,
    },
    genero: {
      type: String,
      required: [true, 'El género de la película es obligatorio'],
      trim: true,
    },
    puntaje: {
      type: Number,
      required: [true, 'El puntaje de la película es obligatorio'],
      min: [1, 'El puntaje mínimo permitido es 1'],
      max: [10, 'El puntaje máximo permitido es 10'],
    },
    anio: {
      type: Number,
      min: [1888, 'El año no puede ser anterior al inicio del cine (1888)'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Movie = model<IMovie>('Movie', movieSchema);

