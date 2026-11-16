const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  details?: any;
}

const results: TestResult[] = [];

const record = (name: string, expectedStatus: number, actualStatus: number, details?: any) => {
  const passed = expectedStatus === actualStatus;
  results.push({ name, expectedStatus, actualStatus, passed, details });
  const mark = passed ? '[PASS]' : '[FAIL]';
  console.log(`${mark} ${name} -> Esperado: ${expectedStatus}, Recibido: ${actualStatus}`);
};

const runAllTests = async (): Promise<void> => {
  console.log('Iniciando ejecucion de pruebas de la API en:', BASE_URL);
  console.log('---------------------------------------------------------');

  const timestamp = Date.now();
  const testAdminEmail = `admin_test_${timestamp}@example.com`;
  const testUserEmail = `user_test_${timestamp}@example.com`;
  const testMovieTitle = `Pelicula Test ${timestamp}`;

  let adminToken = '';
  let userToken = '';
  let createdMovieId = '';

  // 1. Healthcheck raiz
  try {
    const res = await fetch(`${BASE_URL}/`);
    record('GET / (Healthcheck de la API)', 200, res.status);
  } catch (err: any) {
    record('GET / (Healthcheck de la API)', 200, 0, err.message);
  }

  // 2. Registro usuario admin
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Admin Tester',
        email: testAdminEmail,
        password: 'Password123!',
        rol: 'admin',
      }),
    });
    const data = await res.json();
    record('POST /api/auth/register (Crear usuario admin)', 201, res.status);
    adminToken = data.data?.token || '';
  } catch (err: any) {
    record('POST /api/auth/register (Crear usuario admin)', 201, 0, err.message);
  }

  // 3. Registro usuario regular
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'User Tester',
        email: testUserEmail,
        password: 'Password123!',
        rol: 'user',
      }),
    });
    const data = await res.json();
    record('POST /api/auth/register (Crear usuario regular)', 201, res.status);
    userToken = data.data?.token || '';
  } catch (err: any) {
    record('POST /api/auth/register (Crear usuario regular)', 201, 0, err.message);
  }

  // 4. Login exitoso
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdminEmail,
        password: 'Password123!',
      }),
    });
    const data = await res.json();
    if (data.data?.token) adminToken = data.data.token;
    record('POST /api/auth/login (Login exitoso)', 200, res.status);
  } catch (err: any) {
    record('POST /api/auth/login (Login exitoso)', 200, 0, err.message);
  }

  // 5. Error 401 en login con contrasenia incorrecta
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdminEmail,
        password: 'PasswordIncorrecto',
      }),
    });
    record('POST /api/auth/login (Error credenciales invalidas)', 401, res.status);
  } catch (err: any) {
    record('POST /api/auth/login (Error credenciales invalidas)', 401, 0, err.message);
  }

  // 6. Listar peliculas
  try {
    const res = await fetch(`${BASE_URL}/api/movies`);
    record('GET /api/movies (Listar peliculas)', 200, res.status);
  } catch (err: any) {
    record('GET /api/movies (Listar peliculas)', 200, 0, err.message);
  }

  // 7. Error 401 al crear pelicula sin token
  try {
    const res = await fetch(`${BASE_URL}/api/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: 'Pelicula Sin Auth',
        director: 'Anonimo',
        genero: 'Accion',
        puntaje: 8,
      }),
    });
    record('POST /api/movies (Error 401 sin token)', 401, res.status);
  } catch (err: any) {
    record('POST /api/movies (Error 401 sin token)', 401, 0, err.message);
  }

  // 8. Error 400 por validacion de negocio (puntaje > 10)
  try {
    const res = await fetch(`${BASE_URL}/api/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        titulo: 'Pelicula Puntaje Excesivo',
        director: 'Director Test',
        genero: 'Drama',
        puntaje: 15,
      }),
    });
    record('POST /api/movies (Error 400 puntaje mayor a 10)', 400, res.status);
  } catch (err: any) {
    record('POST /api/movies (Error 400 puntaje mayor a 10)', 400, 0, err.message);
  }

  // 9. Crear pelicula exitosamente con token
  try {
    const res = await fetch(`${BASE_URL}/api/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        titulo: testMovieTitle,
        director: 'Christopher Nolan',
        genero: 'Ciencia Ficcion',
        puntaje: 9.5,
        anio: 2014,
      }),
    });
    const data = await res.json();
    createdMovieId = data.data?._id || '';
    record('POST /api/movies (Crear pelicula exitosamente)', 201, res.status);
  } catch (err: any) {
    record('POST /api/movies (Crear pelicula exitosamente)', 201, 0, err.message);
  }

  // 10. Error 400 por titulo duplicado
  try {
    const res = await fetch(`${BASE_URL}/api/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        titulo: testMovieTitle,
        director: 'Christopher Nolan',
        genero: 'Ciencia Ficcion',
        puntaje: 9.0,
      }),
    });
    record('POST /api/movies (Error 400 titulo duplicado)', 400, res.status);
  } catch (err: any) {
    record('POST /api/movies (Error 400 titulo duplicado)', 400, 0, err.message);
  }

  // 11. Filtrar peliculas por req.query
  try {
    const res = await fetch(`${BASE_URL}/api/movies?genero=Ciencia%20Ficcion&minPuntaje=9`);
    record('GET /api/movies?genero=...&minPuntaje=... (Filtro query params)', 200, res.status);
  } catch (err: any) {
    record('GET /api/movies?genero=...&minPuntaje=... (Filtro query params)', 200, 0, err.message);
  }

  // 12. Obtener pelicula por ID
  try {
    const res = await fetch(`${BASE_URL}/api/movies/${createdMovieId}`);
    record('GET /api/movies/:id (Buscar pelicula por ID)', 200, res.status);
  } catch (err: any) {
    record('GET /api/movies/:id (Buscar pelicula por ID)', 200, 0, err.message);
  }

  // 13. Error 404 pelicula no encontrada
  try {
    const res = await fetch(`${BASE_URL}/api/movies/650000000000000000000000`);
    record('GET /api/movies/:id (Error 404 recurso inexistente)', 404, res.status);
  } catch (err: any) {
    record('GET /api/movies/:id (Error 404 recurso inexistente)', 404, 0, err.message);
  }

  // 14. Error 400 por ID con formato invalido
  try {
    const res = await fetch(`${BASE_URL}/api/movies/id_invalido_123`);
    record('GET /api/movies/:id (Error 400 formato de ID invalido)', 400, res.status);
  } catch (err: any) {
    record('GET /api/movies/:id (Error 400 formato de ID invalido)', 400, 0, err.message);
  }

  // 15. Actualizar pelicula
  try {
    const res = await fetch(`${BASE_URL}/api/movies/${createdMovieId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        puntaje: 10,
      }),
    });
    record('PUT /api/movies/:id (Actualizar pelicula)', 200, res.status);
  } catch (err: any) {
    record('PUT /api/movies/:id (Actualizar pelicula)', 200, 0, err.message);
  }

  // 16. Error 403 al intentar eliminar con usuario regular
  try {
    const res = await fetch(`${BASE_URL}/api/movies/${createdMovieId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    record('DELETE /api/movies/:id (Error 403 usuario regular no autorizado)', 403, res.status);
  } catch (err: any) {
    record('DELETE /api/movies/:id (Error 403 usuario regular no autorizado)', 403, 0, err.message);
  }

  // 17. Eliminar pelicula exitosamente con usuario admin
  try {
    const res = await fetch(`${BASE_URL}/api/movies/${createdMovieId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    record('DELETE /api/movies/:id (Eliminar pelicula con usuario admin)', 200, res.status);
  } catch (err: any) {
    record('DELETE /api/movies/:id (Eliminar pelicula con usuario admin)', 200, 0, err.message);
  }

  console.log('---------------------------------------------------------');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`Resumen de ejecucion: ${passed}/${total} pruebas pasadas (${failed} fallos).`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runAllTests();
