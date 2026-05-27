const express = require('express');
const cors = require('cors');
const citaController = require('../Controller/CitaController');
const especialidadController = require('../Controller/EspecialidadController');
const usuarioController = require('../Controller/UsuarioController');

const app = express();
app.use(cors());
app.use(express.json());

// RUTAS DE CITAS
app.post('/api/citas', citaController.guardarCita);
app.get('/api/citas', citaController.cargarCitas);

// RUTAS DE ESPECIALIDAD (NUEVO)
app.get('/api/especialidades/:nombre', especialidadController.obtenerDetalles);

// RUTAS DE USUARIOS (NUEVO)
app.post('/api/usuarios/registro', usuarioController.registroUsuario);
app.post('/api/usuarios/login', usuarioController.loginUsuario);
app.get('/api/usuarios/pacientes', usuarioController.listarPacientes);
app.get('/api/usuarios/:id', usuarioController.obtenerUsuario);
app.put('/api/usuarios/:id', usuarioController.modificarUsuario);

app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));

