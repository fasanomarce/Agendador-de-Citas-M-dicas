const fs = require('fs');
const path = require('path');
const UsuarioStore = require('../utils/UsuarioStore');
const CitaStore = require('../utils/CitaStore');

const rutaEspecialidades = path.join(__dirname, '../especialidades.json');

class SecretarioController {
    static listarPacientes(req, res) {
        const pacientes = UsuarioStore.leerPacientes().map(p => ({
            id: p.id,
            nombre: p.nombre,
            apellido: p.apellido,
            correo: p.correo,
            telefono: p.telefono || '',
            fotoUrl: p.fotoUrl,
            biografia: p.biografia || '',
            rol: p.rol
        }));
        return res.json(pacientes);
    }

    static obtenerPaciente(req, res) {
        const paciente = UsuarioStore.leerPacientes().find(p => String(p.id) === String(req.params.id));
        if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado.' });
        }
        return res.json(paciente);
    }

    static modificarPaciente(req, res) {
        const idModificar = String(req.params.id);
        const { modificadoPor, rolModificadoPor, telefono, correo, fotoUrl, biografia, nombre, apellido } = req.body;

        if (!modificadoPor || rolModificadoPor !== 'Secretario') {
            return res.status(403).json({ error: 'Acceso denegado. Solo secretarios pueden modificar pacientes.' });
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
        const nuevoNombre = nombre ? UsuarioStore.sanitizar(nombre.trim()) : original.nombre;
        const nuevoApellido = apellido ? UsuarioStore.sanitizar(apellido.trim()) : original.apellido;

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
        original.fotoUrl = nuevaFoto || original.fotoUrl;
        original.biografia = nuevaBio;
        original.nombre = nuevoNombre;
        original.apellido = nuevoApellido;
        pacientes[indice] = original;
        UsuarioStore.guardarPacientes(pacientes);

        return res.json({
            mensaje: 'Datos de contacto del paciente actualizados de forma inmediata.',
            usuario: original
        });
    }

    static listarCitas(req, res) {
        return res.json(CitaStore.leerCitas());
    }

    static modificarCita(req, res) {
        const citaId = Number(req.params.citaId);
        const { rolModificadoPor, fecha, hora, doctor, motivo, estado } = req.body;

        if (rolModificadoPor !== 'Secretario') {
            return res.status(403).json({ error: 'Acceso denegado. Solo secretarios pueden modificar citas.' });
        }

        const citas = CitaStore.leerCitas();
        const indice = citas.findIndex(c => c.id === citaId);
        if (indice === -1) {
            return res.status(404).json({ error: 'Cita no encontrada.' });
        }

        if (fecha) citas[indice].fecha = fecha;
        if (hora) citas[indice].hora = hora;
        if (doctor) citas[indice].doctor = UsuarioStore.sanitizar(doctor.trim());
        if (motivo) citas[indice].motivo = UsuarioStore.sanitizar(motivo.trim());
        if (estado && ['pendiente', 'completada', 'cancelada'].includes(estado)) {
            citas[indice].estado = estado;
        }

        CitaStore.guardarCitas(citas);
        return res.json({ mensaje: 'Cita actualizada correctamente.', cita: citas[indice] });
    }

    static asignarBloqueHorario(req, res) {
        const { rolModificadoPor, especialidad, especialistaId, bloques } = req.body;

        if (rolModificadoPor !== 'Secretario') {
            return res.status(403).json({ error: 'Acceso denegado.' });
        }

        if (!especialidad || !especialistaId || !Array.isArray(bloques) || bloques.length === 0) {
            return res.status(400).json({ error: 'Debe indicar especialidad, especialista y al menos un bloque horario.' });
        }

        const personal = UsuarioStore.leerPersonal();
        const especialista = personal.especialistas.find(e => String(e.id) === String(especialistaId));
        if (!especialista || especialista.especialidad !== especialidad) {
            return res.status(400).json({ error: 'El especialista no pertenece a la especialidad indicada.' });
        }

        let especialidades;
        try {
            especialidades = JSON.parse(fs.readFileSync(rutaEspecialidades, 'utf8'));
        } catch {
            return res.status(500).json({ error: 'No se pudo leer el catálogo de especialidades.' });
        }

        if (!especialidades[especialidad]) {
            return res.status(404).json({ error: 'Especialidad no configurada.' });
        }

        if (!especialidades[especialidad].bloquesHorarios) {
            especialidades[especialidad].bloquesHorarios = {};
        }

        especialidades[especialidad].bloquesHorarios[String(especialistaId)] = bloques.map(b => ({
            dia: UsuarioStore.sanitizar(String(b.dia || '').trim()),
            horaInicio: b.horaInicio,
            horaFin: b.horaFin
        }));

        fs.writeFileSync(rutaEspecialidades, JSON.stringify(especialidades, null, 2), 'utf8');

        return res.json({
            mensaje: 'Bloques horarios asignados al especialista.',
            bloques: especialidades[especialidad].bloquesHorarios[String(especialistaId)]
        });
    }

    static modificarPerfilPropio(req, res) {
        const idModificar = String(req.params.id);
        const { modificadoPor, rolModificadoPor, correo, fotoUrl } = req.body;

        if (!modificadoPor || rolModificadoPor !== 'Secretario' || String(modificadoPor) !== idModificar) {
            return res.status(403).json({ error: 'Acceso denegado.' });
        }

        const personal = UsuarioStore.leerPersonal();
        const indice = personal.secretarios.findIndex(s => String(s.id) === idModificar);
        if (indice === -1) {
            return res.status(404).json({ error: 'Secretario no encontrado.' });
        }

        const sec = personal.secretarios[indice];
        if (correo) {
            const nuevoCorreo = UsuarioStore.sanitizar(correo.trim().toLowerCase());
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(nuevoCorreo)) {
                return res.status(400).json({ error: 'El correo electrónico tiene un formato inválido.' });
            }
            sec.correo = nuevoCorreo;
        }
        if (fotoUrl) sec.fotoUrl = String(fotoUrl).trim();

        personal.secretarios[indice] = sec;
        UsuarioStore.guardarPersonal(personal);

        return res.json({
            mensaje: 'Datos de contacto actualizados de forma inmediata.',
            usuario: { ...sec, rol: 'Secretario' }
        });
    }
}

module.exports = SecretarioController;
