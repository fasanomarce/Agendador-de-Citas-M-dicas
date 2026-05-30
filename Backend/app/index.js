const express = require('express');
const cors = require('cors');
const usuarioStore = require('../utils/usuarioStore');

const authController = require('../controllers/AuthController');
const pacienteController = require('../controllers/PacienteController');
const especialistaController = require('../controllers/EspecialistaController');
const secretarioController = require('../controllers/SecretarioController');
const adminController = require('../controllers/AdminController');
const citaController = require('../controllers/CitaController');
const especialidadController = require('../controllers/EspecialidadController');
const horarioController = require('../controllers/HorarioController');

const app = express();
app.use(cors());
app.use(express.json());

// Citas (paciente / general)
app.post('/api/citas', citaController.guardarCita);
app.get('/api/citas', citaController.cargarCitas);

// Especialidades (menú público)
app.get('/api/especialidades', especialidadController.obtenerTodas);
app.get('/api/especialidades/:nombre', especialidadController.obtenerDetalles);

// Autenticación
app.post('/api/auth/registro', authController.registro);
app.post('/api/auth/login', authController.login);

// Personal y horarios (SSOT: horarios.json vía HorarioController)
app.get('/api/personal', horarioController.obtenerPersonal);
app.get('/api/horarios/:id', horarioController.obtenerHorariosPorEspecialista);
app.post('/api/horarios', horarioController.guardarHorario);

// Paciente
app.get('/api/pacientes/:id', pacienteController.obtenerPerfil);
app.put('/api/pacientes/:id', pacienteController.actualizarPerfil);
app.get('/api/pacientes/:id/citas', pacienteController.historialCitas);

// Especialista
app.get('/api/especialista/perfil/:id', especialistaController.obtenerPerfil);
app.put('/api/especialista/perfil/:id', especialistaController.actualizarMiPerfil);
app.get('/api/especialista/citas', especialistaController.listarCitasAgendadas);
app.get('/api/especialista/notificaciones-horario', especialistaController.listarNotificacionesHorario);
app.patch('/api/especialista/notificaciones-horario/:id/leida', especialistaController.marcarNotificacionHorarioLeida);
app.patch('/api/especialista/citas/:id/completar', especialistaController.marcarCitaCompletada);

// Secretario
app.get('/api/secretario/perfil/:id', secretarioController.obtenerMiPerfil);
app.put('/api/secretario/perfil/:id', secretarioController.actualizarMiPerfil);
app.get('/api/secretario/pacientes', secretarioController.listarPacientes);
app.put('/api/secretario/pacientes/:id', secretarioController.actualizarPaciente);
app.get('/api/secretario/citas', secretarioController.listarCitas);
app.put('/api/secretario/citas/:id', secretarioController.actualizarCita);
app.get('/api/secretario/especialistas', secretarioController.listarEspecialistas);

// Administrador
app.get('/api/admin/perfil/:id', adminController.obtenerMiPerfil);
app.put('/api/admin/perfil/:id', adminController.actualizarMiPerfil);
app.post('/api/admin/personal', adminController.registrarPersonal);
app.get('/api/admin/especialidades', adminController.listarEspecialidades);
app.get('/api/admin/doctores', adminController.listarDoctores);
app.post('/api/admin/especialidades', adminController.agregarEspecialidad);
app.get('/api/admin/citas', adminController.listarCitas);

// Compatibilidad temporal con rutas anteriores
function resolverUsuarioLegacy(req, res) {
    const pacientes = usuarioStore.leerPacientes();
    if (pacientes.some(p => String(p.id) === String(req.params.id))) {
        return pacienteController.obtenerPerfil(req, res);
    }

    const personal = usuarioStore.leerPersonal();
    if (personal.especialistas.some(e => String(e.id) === String(req.params.id))) {
        return especialistaController.obtenerPerfil(req, res);
    }
    if (personal.secretarios.some(s => String(s.id) === String(req.params.id))) {
        return secretarioController.obtenerMiPerfil(req, res);
    }

    const admins = usuarioStore.leerAdmins();
    if (admins.some(a => String(a.id) === String(req.params.id))) {
        return adminController.obtenerMiPerfil(req, res);
    }

    return res.status(404).json({ error: 'Usuario no encontrado.' });
}

function actualizarUsuarioLegacy(req, res) {
    const rol = req.body.rolModificadoPor;
    if (rol === 'Secretario') return secretarioController.actualizarPaciente(req, res);
    if (rol === 'Paciente') return pacienteController.actualizarPerfil(req, res);
    return res.status(403).json({ error: 'Ruta deprecada: use el endpoint de su rol.' });
}

app.post('/api/usuarios/registro', authController.registro);
app.post('/api/usuarios/login', authController.login);
app.get('/api/usuarios/pacientes', secretarioController.listarPacientes);
app.get('/api/usuarios/:id', resolverUsuarioLegacy);
app.put('/api/usuarios/:id', actualizarUsuarioLegacy);
app.post('/api/usuarios/registro-personal', adminController.registrarPersonal);

app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));
