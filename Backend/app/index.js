const express = require('express');
const cors = require('cors');
const citaController = require('../Controller/CitaController');

const app = express();
app.use(cors());
app.use(express.json());

// cuando el frontend pida guardar una cita
app.post('/api/citas', citaController.guardarCita);

// cuando el frontend pida leer las citas
app.get('/api/citas', citaController.obtenerCitas);

app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));

