# 🎬 API REST - Catálogo de Películas
**Trabajo Práctico Integrador - Bootcamp Devlights 5.0 (Módulo Node.js)**

API RESTful completa construida con **Node.js**, **Express** y **TypeScript**, utilizando **MongoDB** con **Mongoose** como base de datos. El proyecto implementa una arquitectura orientada a componentes y dividida en capas (rutas, controladores, servicios y acceso a datos), autenticación segura con **Bcrypt** y **JWT**, control de acceso por roles, validaciones de negocio y manejo semántico de errores HTTP.

---

## 🚀 Tecnologías Utilizadas

- **Entorno:** Node.js v18+
- **Lenguaje:** TypeScript v5+
- **Framework Web:** Express.js
- **Base de Datos:** MongoDB con ODM Mongoose
- **Seguridad y Criptografía:** Bcryptjs (hashing con salt) y JSON Web Token (JWT)
- **Utilidades:** Dotenv, CORS, ts-node-dev (recarga en caliente para desarrollo)

---

## 📁 Arquitectura del Proyecto (Por Componentes y en Capas)

El proyecto adopta un diseño **modular / feature-based** donde cada dominio funcional agrupa sus capas:

```text
src/
├── app.ts                        # Configuración de Express, middlewares y rutas globales
├── server.ts                     # Punto de entrada y conexión a MongoDB
│
├── config/
│   ├── database.ts               # Conexión Mongoose a MongoDB
│   └── env.ts                    # Carga y tipado de variables de entorno
│
├── middlewares/
│   ├── auth.middleware.ts        # Verificación y decodificación de JWT (Bearer Token)
│   ├── role.middleware.ts        # Control de autorización por roles (ej. solo 'admin')
│   └── logger.middleware.ts      # Extra: Logging de método HTTP y URL en consola
│
├── types/
│   └── express.d.ts              # Declaración de tipos extendidos (req.user)
│
├── movies/                       # 📁 Componente Películas
│   ├── movie.model.ts            # Capa de Datos: Esquema Mongoose de Película
│   ├── movie.service.ts          # Capa de Servicio: Lógica y validaciones de negocio
│   ├── movie.controller.ts       # Capa de Controlador: Manejo de req/res y try/catch
│   └── movie.routes.ts           # Capa de Rutas: Endpoints y protección de acceso
│
└── auth/                         # 📁 Componente Autenticación / Usuarios
    ├── user.model.ts             # Capa de Datos: Esquema de Usuario (roles, password)
    ├── auth.service.ts           # Capa de Servicio: Hash con Bcrypt y emisión de JWT
    ├── auth.controller.ts        # Capa de Controlador: Registro y Login
    └── auth.routes.ts            # Capa de Rutas: /api/auth
```

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd TpDevlights
npm install
```

### 2. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto basándose en `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/catalogo_peliculas?retryWrites=true&w=majority
JWT_SECRET=tu_clave_secreta_para_firmar_jwt
```

> **Nota:** Puedes utilizar una base de datos local (`mongodb://127.0.0.1:27017/catalogo_peliculas`) o una instancia de MongoDB Atlas.

### 3. Ejecutar el proyecto

- **Modo Desarrollo (con recarga automática):**
  ```bash
  npm run dev
  ```

- **Compilar para producción (TypeScript a JavaScript):**
  ```bash
  npm run build
  ```

- **Ejecutar en producción:**
  ```bash
  npm start
  ```

El servidor estará escuchando en `http://localhost:3000`.

---

## 📌 Catálogo de Endpoints

### 🔐 1. Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Requiere Token | Códigos HTTP |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/api/auth/register` | Registra un usuario (`user` o `admin`) | No | `201`, `400`, `500` |
| `POST` | `/api/auth/login` | Inicia sesión y retorna token JWT | No | `200`, `400`, `401`, `500` |

#### Payload de ejemplo - Registro:
```json
{
  "nombre": "Lucas Administrador",
  "email": "admin@cine.com",
  "password": "PasswordSeguro123",
  "rol": "admin"
}
```

#### Payload de ejemplo - Login:
```json
{
  "email": "admin@cine.com",
  "password": "PasswordSeguro123"
}
```

---

### 🎥 2. Películas (`/api/movies`)

| Método | Endpoint | Descripción | Requiere Token | Roles | Códigos HTTP |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `GET` | `/api/movies` | Obtiene todas las películas (soporta filtros) | No | Todos | `200`, `500` |
| `GET` | `/api/movies/:id` | Obtiene una película por su ID | No | Todos | `200`, `400`, `404`, `500` |
| `POST` | `/api/movies` | Crea una nueva película | **Sí** | `user` / `admin` | `201`, `400`, `401`, `500` |
| `PUT` | `/api/movies/:id` | Modifica una película por su ID | **Sí** | `user` / `admin` | `200`, `400`, `401`, `404`, `500` |
| `DELETE` | `/api/movies/:id` | Elimina una película por su ID | **Sí** | **Solo `admin`** | `200`, `400`, `401`, `403`, `404`, `500` |

#### Payload de ejemplo - Crear / Modificar Película:
```json
{
  "titulo": "Interestelar",
  "director": "Christopher Nolan",
  "genero": "Ciencia Ficción",
  "puntaje": 9.5,
  "anio": 2014
}
```

---

## 🌟 Extras y Buenas Prácticas Implementadas (+10 Puntos)

1. **Filtros por Query Params (`req.query`):**
   - Filtrado dinámico en `GET /api/movies?genero=Accion&minPuntaje=8&director=Nolan`.
2. **Control de Acceso por Roles (RBAC):**
   - El endpoint `DELETE /api/movies/:id` está protegido con el middleware `requireAdmin`: los usuarios con rol `user` reciben `403 Forbidden`, y solo usuarios con rol `admin` pueden concretar la eliminación.
3. **Relación entre Modelos:**
   - Cada película almacena la referencia del usuario que la registró (`createdBy`), accesible y poblada (`populate`) en las respuestas.
4. **Middleware de Logging:**
   - Se registra en consola en tiempo real la fecha/hora, método HTTP y URL de cada petición entrante.
5. **Validaciones de Reglas de Negocio en Capa de Servicio:**
   - El puntaje debe estar obligatoriamente entre **1 y 10**.
   - No se permiten películas con títulos duplicados (búsqueda insensible a mayúsculas/minúsculas).
   - El año de estreno debe ser válido (no anterior a 1888 ni superior a fechas incoherentes).

---

## 🧪 Pruebas con Thunder Client

El proyecto incluye el archivo **`thunder-collection.json`** en la raíz. Para utilizarlo:

1. Instalar la extensión **Thunder Client** en VS Code.
2. Abrir la pestaña de Thunder Client y seleccionar **Collections > Import**.
3. Seleccionar el archivo `thunder-collection.json`.
4. La colección incluye requests organizados para:
   - Registro y Login exitoso.
   - CRUD completo de películas.
   - Casos de error esperados:
     - `400 Bad Request`: datos faltantes o validaciones de negocio fallidas.
     - `401 Unauthorized`: acceso a rutas protegidas sin token o token expirado.
     - `403 Forbidden`: intento de eliminación por usuario sin rol `admin`.
     - `404 Not Found`: búsqueda de ID inexistente.

