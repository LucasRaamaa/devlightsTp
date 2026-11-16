# API REST - Catalogo de Peliculas
Trabajo Practico Integrador - Bootcamp Devlights 5.0 (Modulo Node.js)

API RESTful desarrollada en Node.js, Express y TypeScript, con MongoDB y Mongoose como base de datos. El diseno sigue una arquitectura modular orientada a componentes y dividida en capas (rutas, controladores, servicios y acceso a datos). Incluye autenticacion mediante Bcrypt y JWT, control de acceso basado en roles (RBAC), validaciones de negocio y codigos de estado HTTP semanticos.

---

## Tecnologias

- **Runtime:** Node.js (v18+)
- **Lenguaje:** TypeScript (v5+)
- **Framework:** Express.js
- **Base de Datos / ODM:** MongoDB / Mongoose
- **Seguridad:** Bcryptjs y JSON Web Token (jsonwebtoken)
- **Tooling:** Dotenv, CORS, ts-node-dev

---

## Arquitectura del Proyecto

Estructura por componentes (feature-based) con separacion de responsabilidades en capas:

```text
src/
├── app.ts                        # Configuracion de middleware y registro de rutas
├── server.ts                     # Entrada de la aplicacion y conexion a la base de datos
├── config/
│   ├── database.ts               # Conexion Mongoose a MongoDB
│   └── env.ts                    # Resolucion de variables de entorno tipadas
├── middlewares/
│   ├── auth.middleware.ts        # Validacion de token Bearer JWT
│   ├── role.middleware.ts        # Verificacion de permisos por rol
│   └── logger.middleware.ts      # Registro de peticiones entrantes (metodo y URL)
├── types/
│   └── express.d.ts              # Extensiones de interfaces de Express (req.user)
├── movies/                       # Componente de Peliculas
│   ├── movie.model.ts            # Esquema y modelo Mongoose
│   ├── movie.service.ts          # Reglas de negocio y operaciones de datos
│   ├── movie.controller.ts       # Procesamiento de peticiones y respuestas HTTP
│   └── movie.routes.ts           # Definicion de endpoints de peliculas
└── auth/                         # Componente de Autenticacion
    ├── user.model.ts             # Esquema de usuario
    ├── auth.service.ts           # Hashing, comparacion de credenciales y firma de JWT
    ├── auth.controller.ts        # Controladores de registro y login
    └── auth.routes.ts            # Endpoints de autenticacion
```

---

## Instalacion y Ejecucion

### 1. Clonar repositorio e instalar dependencias
```bash
git clone https://github.com/LucasRaamaa/devlightsTp.git
cd TpDevlights
npm install
```

### 2. Variables de entorno
Crear el archivo `.env` tomando como base `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/catalogo_peliculas?retryWrites=true&w=majority
JWT_SECRET=clave_secreta_para_firmar_jwt
```

### 3. Comandos de ejecucion

- **Desarrollo:**
  ```bash
  npm run dev
  ```

- **Build de produccion:**
  ```bash
  npm run build
  ```

- **Iniciar en produccion:**
  ```bash
  npm start
  ```

---

## Catalogo de Endpoints

### 1. Autenticacion (`/api/auth`)

| Metodo | Endpoint | Descripcion | Auth | Codigos HTTP |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/api/auth/register` | Registro de nuevo usuario (`user` o `admin`) | Publico | `201`, `400`, `500` |
| `POST` | `/api/auth/login` | Autenticacion de usuario y emision de JWT | Publico | `200`, `400`, `401`, `500` |

#### Payload de registro:
```json
{
  "nombre": "Lucas Rama",
  "email": "lucas@example.com",
  "password": "Password123",
  "rol": "admin"
}
```

#### Payload de login:
```json
{
  "email": "lucas@example.com",
  "password": "Password123"
}
```

---

### 2. Peliculas (`/api/movies`)

| Metodo | Endpoint | Descripcion | Auth | Roles | Codigos HTTP |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `GET` | `/api/movies` | Listar peliculas (soporta filtros por query) | Publico | Todos | `200`, `500` |
| `GET` | `/api/movies/:id` | Obtener pelicula por ID | Publico | Todos | `200`, `400`, `404`, `500` |
| `POST` | `/api/movies` | Crear pelicula | Bearer JWT | `user`, `admin` | `201`, `400`, `401`, `500` |
| `PUT` | `/api/movies/:id` | Actualizar pelicula | Bearer JWT | `user`, `admin` | `200`, `400`, `401`, `404`, `500` |
| `DELETE` | `/api/movies/:id` | Eliminar pelicula | Bearer JWT | Solo `admin` | `200`, `400`, `401`, `403`, `404`, `500` |

#### Payload de creacion / modificacion:
```json
{
  "titulo": "Interestelar",
  "director": "Christopher Nolan",
  "genero": "Ciencia Ficcion",
  "puntaje": 9.5,
  "anio": 2014
}
```

---

## Funcionalidades y Reglas de Negocio

1. **Filtros por Query Params (`req.query`):**
   - Busqueda combinada en `GET /api/movies?genero=Ciencia%20Ficcion&minPuntaje=8&director=Nolan`.
2. **Control de Acceso por Roles (RBAC):**
   - Restriccion en `DELETE /api/movies/:id` mediante middleware `requireAdmin` (retorna `403 Forbidden` si el usuario no posee rol `admin`).
3. **Relacion entre Modelos:**
   - La entidad `Movie` asocia al usuario creador (`createdBy: ObjectId`) y expone los datos poblados (`populate`).
4. **Middleware de Logging:**
   - Registro en consola de marca temporal, metodo HTTP y URL de cada solicitud.
5. **Validaciones en Capa de Servicio:**
   - Rango de puntaje restringido entre 1 y 10.
   - Unicidad de titulo de pelicula (insensible a mayusculas/minusculas).
   - Validacion de anio de estreno valido (a partir de 1888).

---

## Coleccion de Pruebas (Thunder Client)

El archivo `thunder-collection.json` se encuentra en la raiz del repositorio listo para ser importado en la extension Thunder Client de VS Code:

- Casos de exito (200, 201)
- Casos de error controlados:
  - `400 Bad Request`: datos ausentes o violacion de reglas de negocio
  - `401 Unauthorized`: ausencia o invalidez de token JWT
  - `403 Forbidden`: operacion no autorizada para rol regular
  - `404 Not Found`: recurso inexistente por ID
