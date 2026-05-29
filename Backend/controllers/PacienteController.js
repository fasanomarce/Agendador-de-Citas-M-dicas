const Paciente = require('../Model/Paciente');
const UsuarioStore = require('../utils/UsuarioStore');
const CitaStore = require('../utils/CitaStore');

class PacienteController {
    static obtenerPerfil(req, res) {
        const { solicitanteId, solicitanteRol } = req.query;
        const id = String(req.params.id);

        if (solicitanteRol === 'Paciente' && String(solicitanteId) !== id) {
            return res.status(403).json({ error: 'Acceso denegado. No tiene autorización.' });
        }

        const pacientes = UsuarioStore.leerPacientes();
        const paciente = pacientes.find(p => String(p.id) === id);
        if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado.' });
        }

        return res.json(paciente);
    }

    static modificarPerfil(req, res) {
        const idModificar = String(req.params.id);
        const { modificadoPor, rolModificadoPor, telefono, correo, fotoUrl, biografia } = req.body;

        if (!modificadoPor || rolModificadoPor !== 'Paciente') {
            return res.status(403).json({ error: 'Acceso denegado. Información de autorización faltante.' });
        }

        if (String(modificadoPor) !== idModificar) {
            return res.status(403).json({ error: 'Acceso denegado. No tiene autorización.' });
        }

        const pacientes = UsuarioStore.leerPacientes();
        const indice = pacientes.findIndex(p => String(p.id) === idModificar);
        if (indice === -1) {
            return res.status(404).json({ error: 'Paciente no encontrado.' });
        }

        const original = pacientes[indice];
        const nuevoTelefono = telefono ? UsuarioStore.sanitizar(String(telefono).trim()) : original.telefono;
        let nuevoCorreo = correo ? UsuarioStore.sanitizar(String(correo).trim().toLowerCase()) : original.correo;
        const nuevaFoto = fotoUrl ? String(fotoUrl).trim() : original.fotoUrl;
        const nuevaBio = biografia !== undefined ? UsuarioStore.sanitizar(String(biografia).trim()) : original.biografia;

        if (correo) {
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(nuevoCorreo)) {
                return res.status(400).json({ error: 'El correo electrónico tiene un formato inválido.' });
            }
        }

        if (telefono) {
            const regexTelefono = /^\d{7,15}$/;
            if (!regexTelefono.test(nuevoTelefono.replace(/[\s-+()]/g, ''))) {
                return res.status(400).json({ error: 'El número telefónico debe contener únicamente dígitos válidos.' });
            }
        }

        if (nuevoCorreo !== original.correo && UsuarioStore.correoExisteGlobal(nuevoCorreo, idModificar)) {
            return res.status(400).json({ error: 'El nuevo correo electrónico ya está registrado por otro usuario.' });
        }

        original.telefono = nuevoTelefono;
        original.correo = nuevoCorreo;
        original.fotoUrl = nuevaFoto || `https://ui-avatars.com/api/?name=${original.nombre}+${original.apellido}&background=28a745&color=fff`;
        original.biografia = nuevaBio;
        pacientes[indice] = original;
        UsuarioStore.guardarPacientes(pacientes);

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

    static listarMisCitas(req, res) {
        const pacienteId = String(req.params.id);
        const pacientes = UsuarioStore.leerPacientes();
        const paciente = pacientes.find(p => String(p.id) === pacienteId);

        if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado.' });
        }

        const citas = CitaStore.leerCitas().filter(c => CitaStore.coincideConPaciente(c, paciente));
        return res.json(citas);
    }

    static registrarCita(req, res) {
        const { pacienteId, nombre, apellido, motivo, doctor, fecha, hora, especialistaId } = req.body;

        if (!nombre || !apellido || !motivo || !doctor || !fecha || !hora) {
            return res.status(400).json({ error: 'Todos los campos de la cita son obligatorios.' });
        }

        if (pacienteId) {
            const paciente = UsuarioStore.leerPacientes().find(p => String(p.id) === String(pacienteId));
            if (!paciente) {
                return res.status(404).json({ error: 'Paciente no encontrado.' });
            }
        }

        const citas = CitaStore.leerCitas();
        const nuevaCita = {
            id: Date.now(),
            pacienteId: pacienteId || null,
            especialistaId: especialistaId || null,
            nombre: UsuarioStore.sanitizar(nombre.trim()),
            apellido: UsuarioStore.sanitizar(apellido.trim()),
            motivo: UsuarioStore.sanitizar(motivo.trim()),
            doctor: UsuarioStore.sanitizar(doctor.trim()),
            fecha,
            hora,
            estado: 'pendiente'
        };

        citas.push(nuevaCita);
        CitaStore.guardarCitas(citas);

        return res.status(201).json({ mensaje: 'Cita registrada correctamente.', cita: nuevaCita });
    }
}

module.exports = PacienteController;
