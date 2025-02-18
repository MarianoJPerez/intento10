

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// ACA ES DONDE INICIA. PRIMERO INCALIZO FIREBASE ADMIN.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
 
});

const app = express();
const PORT = process.env.PORT || 3000;


//CORS PARA LAS PETICIONES DEL FRONTEND, NO PUEDE FALTAR.
app.use(cors());


app.use(express.json());


function checkAuth(req, res, next) {
  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).send({ error: 'No se encontró cookie en la petición' });
  }
  

  const sessionCookieString = cookies.split(';').find(cookie => cookie.trim().startsWith('session='));
  if (!sessionCookieString) {
    return res.status(401).send({ error: 'No se encontró cookie de sesión' });
  }
  

  const sessionCookie = sessionCookieString.split('=')[1];
  
  // VERIFICO CON FIREBASE ADMIN LA COOKIE DE INICIO DE SESION
  admin.auth().verifySessionCookie(sessionCookie, true)
    .then(decodedClaims => {
      req.user = decodedClaims; 
      next();
    })
    .catch(error => {
      console.error('Error al verificar la cookie:', error);
      res.status(401).send({ error: 'No autorizado' });
    });
}
// ENDPOINT 1
//ENDPOINT DONDE OBTENEMOS LA LISTA DE LOS JUEGOS
//FUNCIONA COMO UN PROXY ENTRE EL FRONT Y LA APO RAWG

app.get('/api/games', async (req, res) => {
  try {
 
    const page = req.query.page || 1;
    const pageSize = req.query.page_size || 40;
    
    // MANTENGO MI API KEY RAWG EN EL SERVIDOR ASI NO QUEDA EXPUESTA ;)
    const apiKey = '0b6043ca10304ceb8d5fa64a76a75965';
    
    // PETICION
    const response = await axios.get(
      `https://api.rawg.io/api/games?key=${apiKey}&page=${page}&page_size=${pageSize}`
    );
    
    // SE EXTRAEN LOS DATOS Y SE ENVIAN AL FRONT
    const games = response.data.results;
    res.json(games);
  } catch (error) {
    console.error("Error al obtener juegos de RAWG:", error);
    res.status(500).json({ error: 'Error al obtener juegos' });
  }
});

// LE PUSE UNA DURACION DE 5 DIAS, NO SE SI ES LO MAS ACONSEJABLE
const expiresIn = 60 * 60 * 24 * 5 * 1000;



// ENDPOINT 2
//ENDPOINT PARA EL LOGIN, ACA SE RECIBE EL TOKEN DESDE EL FRONT



app.post('/api/login', async (req, res) => {
  const idToken = req.body.idToken; 
  if (!idToken) {
    return res.status(400).send({ error: 'No se recibió idToken' });
  }
  try {
    await admin.auth().verifyIdToken(idToken);
   
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    
    const options = { maxAge: expiresIn, httpOnly: true, secure: false };
    

    res.cookie('session', sessionCookie, options);
    res.status(200).send({ status: 'success' });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(401).send({ error: 'UNAUTHORIZED REQUEST' });
  }
});


app.get('/api/protected', checkAuth, (req, res) => {
  res.status(200).send({ message: 'Acceso concedido', user: req.user });
});

// A CORRER EL SERVERRR
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
