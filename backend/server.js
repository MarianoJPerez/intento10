// backend/server.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializa Firebase Admin con las credenciales de servicio
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Puedes agregar otras configuraciones, por ejemplo, databaseURL, si las requieres.
});

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para permitir peticiones desde el front‑end
app.use(cors());
// Permitir recibir JSON en el body (para endpoints que lo requieran)
app.use(express.json());

/**
 * Middleware para verificar la autenticidad de la sesión sin usar cookie-parser.
 * Este middleware extrae manualmente la cookie "session" desde la cabecera "cookie".
 */
function checkAuth(req, res, next) {
  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).send({ error: 'No se encontró cookie en la petición' });
  }
  
  // Buscar la cookie que comienza con "session="
  const sessionCookieString = cookies.split(';').find(cookie => cookie.trim().startsWith('session='));
  if (!sessionCookieString) {
    return res.status(401).send({ error: 'No se encontró cookie de sesión' });
  }
  
  // Extraer el valor de la cookie (después del "=")
  const sessionCookie = sessionCookieString.split('=')[1];
  
  // Verificar la cookie de sesión usando Firebase Admin
  admin.auth().verifySessionCookie(sessionCookie, true)
    .then(decodedClaims => {
      req.user = decodedClaims; // Agrega la información del usuario a la petición
      next();
    })
    .catch(error => {
      console.error('Error al verificar la cookie:', error);
      res.status(401).send({ error: 'No autorizado' });
    });
}

/**
 * Endpoint para obtener la lista de juegos.
 * Actúa como proxy entre el front‑end y la API RAWG.
 * Permite enviar opcionalmente parámetros en la query (page y page_size).
 */
app.get('/api/games', async (req, res) => {
  try {
    // Parámetros opcionales enviados desde el front‑end
    const page = req.query.page || 1;
    const pageSize = req.query.page_size || 40;
    
    // Tu API key RAWG (se mantiene en el servidor para no exponerla)
    const apiKey = '0b6043ca10304ceb8d5fa64a76a75965';
    
    // Realizar la petición a la API RAWG
    const response = await axios.get(
      `https://api.rawg.io/api/games?key=${apiKey}&page=${page}&page_size=${pageSize}`
    );
    
    // Extraer los resultados y enviarlos al front‑end
    const games = response.data.results;
    res.json(games);
  } catch (error) {
    console.error("Error al obtener juegos de RAWG:", error);
    res.status(500).json({ error: 'Error al obtener juegos' });
  }
});

// Duración de la sesión: 5 días (en milisegundos)
const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días

/**
 * Endpoint para login:
 * Recibe el idToken desde el front‑end, lo verifica y crea una cookie de sesión.
 */
app.post('/api/login', async (req, res) => {
  const idToken = req.body.idToken; // Esperamos que el idToken venga en el body
  if (!idToken) {
    return res.status(400).send({ error: 'No se recibió idToken' });
  }
  try {
    // Verifica el ID token
    await admin.auth().verifyIdToken(idToken);
    // Crea la cookie de sesión a partir del idToken
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    
    // Opciones para la cookie: httpOnly evita el acceso desde JavaScript en el cliente
    const options = { maxAge: expiresIn, httpOnly: true, secure: false }; // Cambia secure a true en producción con HTTPS
    
    // Envía la cookie "session" al cliente
    res.cookie('session', sessionCookie, options);
    res.status(200).send({ status: 'success' });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(401).send({ error: 'UNAUTHORIZED REQUEST' });
  }
});

/**
 * Ejemplo de endpoint protegido:
 * Este endpoint solo es accesible si el middleware checkAuth verifica correctamente la cookie de sesión.
 */
app.get('/api/protected', checkAuth, (req, res) => {
  res.status(200).send({ message: 'Acceso concedido', user: req.user });
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
