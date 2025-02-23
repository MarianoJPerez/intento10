const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
//async function makeMeAdmin() {
  //const myUID = "Rz0RWxNo0lfCc528fJaJax1cCtJ2"; // Reemplázalo con tu UID real

  //try {
    //await admin.auth().setCustomUserClaims(myUID, { role: "admin" });
    //console.log(`✅ Usuario con UID ${myUID} ahora es ADMIN`);
  //} catch (error) {
   // console.error("❌ Error al asignar rol de admin:", error);
  //}
//}

// Ejecutar la función para asignar el rol
//makeMeAdmin();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors());
app.use(express.json());

// Middleware para verificar autenticación y roles
async function checkAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ error: "No autorizado. Token no encontrado." });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Guarda el usuario decodificado en `req.user`
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

// Endpoint para registrar un usuario (siempre como "user")
app.post("/api/register", async (req, res) => {
  const idToken = req.body.idToken;
  if (!idToken) {
    return res.status(400).send({ error: "No se recibió idToken" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    await admin.auth().setCustomUserClaims(decodedToken.uid, { role: "user" });

    res.status(200).send({ message: "Usuario registrado como user" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).send({ error: "Error al registrar usuario" });
  }
});


// Endpoint para obtener la lista de usuarios (solo admins pueden ver esto)
app.get('/api/users', async (req, res) => {
  try {
    const listUsers = await admin.auth().listUsers();
    const users = listUsers.users.map(user => ({
      uid: user.uid,
      email: user.email,
      role: user.customClaims?.role || "user", // Si no tiene rol, se asume "user"
    }));
    res.json(users);
  } catch (error) {
    res.status(500).send({ error: "Error al obtener usuarios" });
  }
});


// Endpoint para asignar rol de administrador (solo accesible por admins)
app.post('/api/set-admin', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { uid } = req.body; // Recibir UID del usuario
    await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
    res.send({ message: `Rol de admin asignado al usuario ${uid}` });
  } catch (error) {
    res.status(500).send({ error: 'Error asignando rol de admin' });
  }
});

// Endpoint protegido para administradores
app.post('/api/add-game', checkAuth, checkAdmin, async (req, res) => {
  res.send({ message: 'Juego agregado con éxito' });
});

// Endpoint para obtener lista de juegos desde RAWG
app.get('/api/games', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const pageSize = req.query.page_size || 40;
    const apiKey = '0b6043ca10304ceb8d5fa64a76a75965';
    const response = await axios.get(`https://api.rawg.io/api/games?key=${apiKey}&page=${page}&page_size=${pageSize}`);
    res.json(response.data.results);
  } catch (error) {
    console.error('Error al obtener juegos de RAWG:', error);
    res.status(500).json({ error: 'Error al obtener juegos' });
  }
});

const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días

// Endpoint para login con Firebase
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

// Ruta protegida genérica
app.get('/api/protected', checkAuth, (req, res) => {
  res.status(200).send({ message: 'Acceso concedido', user: req.user });
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});