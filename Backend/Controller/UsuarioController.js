/**
 * @deprecated Usar controllers/AuthController, PacienteController, etc.
 * Se mantiene solo como referencia; las rutas activas están en app/index.js
 */
const authController = require('../controllers/AuthController');
const pacienteController = require('../controllers/PacienteController');
const secretarioController = require('../controllers/SecretarioController');
const adminController = require('../controllers/AdminController');

module.exports = {
    registroUsuario: authController.registro,
    loginUsuario: authController.login,
    obtenerUsuario: pacienteController.obtenerPerfil,
    modificarUsuario: (req, res) => {
        const rol = req.body.rolModificadoPor;
        if (rol === 'Secretario') return secretarioController.actualizarPaciente(req, res);
        return pacienteController.actualizarPerfil(req, res);
    },
    listarPacientes: secretarioController.listarPacientes,
    registroPersonal: adminController.registrarPersonal
};
