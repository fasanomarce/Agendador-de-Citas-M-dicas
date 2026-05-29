const store = require('../utils/usuarioStore');
const citaStore = require('../utils/citaStore');

class PacienteController {
    static obtenerPerfil(req, res) {
        const id = String(req.params.id);
        const pacientes = store.leerPacientes();
        const paciente = pacientes.find(p => String(p.id) === id);

        if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado.' });
        }

        return res.json({
            id: paciente.id,
            nombre: paciente.nombre,
            apellido: paciente.apellido,
            correo: paciente.correo,
            telefono: paciente.telefono || '',
            fotoUrl: paciente.fotoUrl,
            biografia: paciente.biografia || '',
            rol: paciente.rol
        });
    }

    static actualizarPerfil(req, res) {
        const idModificar = String(req.params.id);
        const { modificadoPor, rolModificadoPor, telefono, correo, fotoUrl, biografia } = req.body;

        if (!modificadoPor || rolModificadoPor !== 'Paciente') {
            return res.status(403).json({ error: 'Acceso denegado. Solo el paciente puede modificar su perfil.' });
        }
        if (String(modificadoPor) !== idModificar) {
            return res.status(403).json({ error: 'Acceso denegado. No tiene autorización.' });
        }

        const pacientes = store.leerPacientes();
        const indice = pacientes.findIndex(p => String(p.id) === idModificar);
        if (indice === -1) {
            return res.status(404).json({ error: 'Paciente no encontrado.' });
        }

        const original = pacientes[indice];
        const nuevoTelefono = telefono ? store.sanitizar(String(telefono).trim()) : original.telefono;
        let nuevoCorreo = correo ? store.sanitizar(String(correo).trim().toLowerCase()) : original.correo;
        const nuevaFoto = fotoUrl ? String(fotoUrl).trim() : original.fotoUrl;
        const nuevaBio = biografia !== undefined ? store.sanitizar(String(biografia).trim()) : original.biografia;

        if (correo) {
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(nuevoCorreo)) {
                return res.status(400).json({ error: 'El correo electrónico tiene un formato inválido.' });
            }
        }

        if (telefono) {
            const limpio = nuevoTelefono.replace(/[\s-+()]/g, '');
            if (!/^\d{7,15}$/.test(limpio)) {
                return res.status(400).json({ error: 'El número telefónico debe contener únicamente dígitos válidos.' });
            }
        }

        if (nuevoCorreo !== original.correo && store.correoExisteGlobal(nuevoCorreo, idModificar)) {
            return res.status(400).json({ error: 'El nuevo correo electrónico ya está registrado por otro usuario.' });
        }

        original.telefono = nuevoTelefono;
        original.correo = nuevoCorreo;
        original.fotoUrl = nuevaFoto || `https://ui-avatars.com/api/?name=${original.nombre}+${original.apellido}&background=28a745&color=fff`;
        original.biografia = nuevaBio;
        pacientes[indice] = original;
        store.guardarPacientes(pacientes);

        return res.json({
            mensaje: 'Datos actualizados exitosamente de forma inmediata.',
            usuario: {
                id: original.id,
                nombre: original.nombre,
                apellido: original.apellido,
                correo: original.correo,
                telefono: original.telefono,
                fotoUrl: original.fotoUrl,
                biografia: original.biografia,
                rol: original.rol
            }
        });
    }

    static historialCitas(req, res) {
        const id = String(req.params.id);
        const pacientes = store.leerPacientes();
        const paciente = pacientes.find(p => String(p.id) === id);

        if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado.' });
        }

        const citas = citaStore.leerCitas().map(citaStore.normalizarEstado);
        const historial = citas.filter(
            c => String(c.pacienteId) === id ||
                (c.nombre === paciente.nombre && c.apellido === paciente.apellido)
        );

        return res.json(historial);
    }
}

module.exports = PacienteController;
