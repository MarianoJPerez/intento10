const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Almacenamiento en memoria para los juegos
let localGames = [];

// Middleware para verificar autenticación
async function checkAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ error: "No autorizado. Token no encontrado." });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Guarda el usuario decodificado en req.user
    next();
  } catch (error) {
    console.error("Error verificando el idToken:", error);
    res.status(401).send({ error: "Token inválido o expirado." });
  }
}

// Middleware para verificar si el usuario es administrador
async function checkAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).send({ error: 'No autenticado' });
  }
  try {
    const user = await admin.auth().getUser(req.user.uid);
    if (user.customClaims && user.customClaims.role === 'admin') {
      next(); // Usuario es admin, puede continuar
    } else {
      return res.status(403).send({ error: 'No tienes permisos de administrador' });
    }
  } catch (error) {
    return res.status(500).send({ error: 'Error verificando permisos' });
  }
}

// Endpoint para obtener juegos (si aún no se han cargado, los carga desde RAWG)
app.get('/api/games', async (req, res) => {
  try {
    // Si no hay juegos en memoria, se llenan con datos de RAWG
    if (localGames.length === 0) {
      const page = req.query.page || 1;
      const pageSize = req.query.page_size || 40;
      const apiKey = '0b6043ca10304ceb8d5fa64a76a75965';
      const response = await axios.get(`https://api.rawg.io/api/games?key=${apiKey}&page=${page}&page_size=${pageSize}`);
      localGames = response.data.results;
    }
    res.json(localGames);
  } catch (error) {
    console.error('Error al obtener juegos de RAWG:', error);
    res.status(500).json({ error: 'Error al obtener juegos' });
  }
});

// Endpoint para agregar un juego (simulado en memoria)
app.post('/api/games', checkAuth, checkAdmin, async (req, res) => {
  const { name, price } = req.body;
  // Simula la generación de un ID. Si hay juegos, toma el mayor id y le suma 1.
  const newId = localGames.length > 0 ? Math.max(...localGames.map(game => Number(game.id))) + 1 : 1;
  const newGame = { id: newId, name, price };
  localGames.push(newGame);
  res.json({ message: 'Juego agregado', game: newGame });
});

// Endpoint para actualizar un juego (simulado en memoria)
app.put('/api/games/:id', checkAuth, checkAdmin, async (req, res) => {
  const gameId = req.params.id;
  const { name, price } = req.body;
  let found = false;
  localGames = localGames.map(game => {
    if (String(game.id) === gameId) {
      found = true;
      return { ...game, name, price };
    }
    return game;
  });
  if (!found) return res.status(404).json({ error: 'Juego no encontrado' });
  res.json({ message: 'Juego actualizado correctamente' });
});

// Endpoint para eliminar un juego (simulado en memoria)
app.delete('/api/games/:id', checkAuth, checkAdmin, async (req, res) => {
  const gameId = req.params.id;
  const initialLength = localGames.length;
  localGames = localGames.filter(game => String(game.id) !== gameId);
  if (localGames.length === initialLength) {
    return res.status(404).json({ error: 'Juego no encontrado' });
  }
  res.json({ message: 'Juego eliminado correctamente' });
});

// Otros endpoints (usuarios, login, etc.) se mantienen igual
app.get('/api/users', async (req, res) => {
  try {
    const listUsers = await admin.auth().listUsers();
    const users = listUsers.users.map(user => ({
      uid: user.uid,
      email: user.email,
      role: user.customClaims?.role || "user",
    }));
    res.json(users);
  } catch (error) {
    res.status(500).send({ error: "Error al obtener usuarios" });
  }
});

app.post('/api/set-admin', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { uid } = req.body;
    await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
    res.send({ message: `Rol de admin asignado al usuario ${uid}` });
  } catch (error) {
    res.status(500).send({ error: 'Error asignando rol de admin' });
  }
});

const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días
app.post('/api/login', async (req, res) => {
  const idToken = req.body.idToken;
  if (!idToken) {
    return res.status(400).send({ error: 'No se recibió idToken' });
  }
  try {
    await admin.auth().verifyIdToken(idToken);
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    res.cookie('session', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: false });
    res.status(200).send({ status: 'success' });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(401).send({ error: 'UNAUTHORIZED REQUEST' });
  }
});

app.get('/api/protected', checkAuth, (req, res) => {
  res.status(200).send({ message: 'Acceso concedido', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});

// Endpoint para restaurar 
app.post('/api/games/restore', checkAuth, checkAdmin, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const pageSize = req.query.page_size || 40;
    const apiKey = '0b6043ca10304ceb8d5fa64a76a75965';
    const response = await axios.get(`https://api.rawg.io/api/games?key=${apiKey}&page=${page}&page_size=${pageSize}`);
    localGames = response.data.results;
    res.json({ message: 'Juegos restaurados', games: localGames });
  } catch (error) {
    console.error('Error al restaurar juegos:', error);
    res.status(500).json({ error: 'Error al restaurar juegos' });
  }
});
