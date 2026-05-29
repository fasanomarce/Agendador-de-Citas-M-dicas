const express = require('express');
const cors = require('cors');

const citaController = require('../Controller/CitaController');
const especialidadController = require('../Controller/EspecialidadController');
<<<<<<< Updated upstream
=======

const authController = require('../controllers/AuthController');
const pacienteController = require('../controllers/PacienteController');
const especialistaController = require('../controllers/EspecialistaController');
const secretarioController = require('../controllers/SecretarioController');
const adminController = require('../controllers/AdminController');
>>>>>>> Stashed changes

const app = express();
app.use(cors());
app.use(express.json());

// --- Autenticación (HU-01) ---
app.post('/api/auth/registro', authController.registro);
app.post('/api/auth/login', authController.login);

// --- Paciente (rutas fijas antes de :id) ---
app.post('/api/pacientes/citas', pacienteController.registrarCita);
app.get('/api/pacientes/:id/citas', pacienteController.listarMisCitas);
app.get('/api/pacientes/:id', pacienteController.obtenerPerfil);
app.put('/api/pacientes/:id', pacienteController.modificarPerfil);

// --- Especialista ---
app.get('/api/especialistas/:id', especialistaController.obtenerPerfil);
app.get('/api/especialistas/:id/citas', especialistaController.listarCitasAgendadas);
app.patch('/api/especialistas/:id/citas/:citaId/completar', especialistaController.marcarCitaCompletada);

// --- Secretario ---
app.get('/api/secretarios/pacientes', secretarioController.listarPacientes);
app.get('/api/secretarios/pacientes/:id', secretarioController.obtenerPaciente);
app.put('/api/secretarios/pacientes/:id', secretarioController.modificarPaciente);
app.put('/api/secretarios/perfil/:id', secretarioController.modificarPerfilPropio);
app.get('/api/secretarios/citas', secretarioController.listarCitas);
app.put('/api/secretarios/citas/:citaId', secretarioController.modificarCita);
app.post('/api/secretarios/bloques-horarios', secretarioController.asignarBloqueHorario);

// --- Administrador ---
app.post('/api/admin/personal', adminController.registroPersonal);
app.get('/api/admin/especialidades', adminController.listarEspecialidades);
app.post('/api/admin/especialidades', adminController.crearEspecialidad);
app.put('/api/admin/perfil/:id', adminController.modificarPerfilPropio);

// --- Citas (compatibilidad general) ---
app.post('/api/citas', citaController.guardarCita);
app.get('/api/citas', citaController.cargarCitas);

// --- Especialidades ---
app.get('/api/especialidades/:nombre', especialidadController.obtenerDetalles);

<<<<<<< Updated upstream
=======
// --- Rutas legadas (deprecación gradual) ---
const auth = authController;
const pac = pacienteController;
const sec = secretarioController;
const adm = adminController;
app.post('/api/usuarios/registro', auth.registro);
app.post('/api/usuarios/login', auth.login);
app.post('/api/usuarios/registro-personal', adm.registroPersonal);
app.get('/api/usuarios/pacientes', sec.listarPacientes);
app.get('/api/usuarios/:id', (req, res) => {
    const resultado = require('../utils/UsuarioStore').buscarPorId(req.params.id);
    if (!resultado) return res.status(404).json({ error: 'Usuario no encontrado.' });
    return res.json(resultado.usuario);
});
app.put('/api/usuarios/:id', (req, res) => {
    const { rolModificadoPor } = req.body;
    if (rolModificadoPor === 'Paciente') return pac.modificarPerfil(req, res);
    if (rolModificadoPor === 'Secretario') return sec.modificarPaciente(req, res);
    if (rolModificadoPor === 'Administrador') return adm.modificarPerfilPropio(req, res);
    return res.status(403).json({ error: 'Rol no autorizado para esta ruta.' });
});

>>>>>>> Stashed changes
app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));
