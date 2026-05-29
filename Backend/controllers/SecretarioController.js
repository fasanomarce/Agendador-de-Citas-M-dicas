const store = require('../utils/usuarioStore');
const citaStore = require('../utils/citaStore');

class SecretarioController {
    static listarPacientes(req, res) {
        const pacientes = store.leerPacientes();
        const lista = pacientes.map(p => ({
            id: p.id,
            nombre: p.nombre,
            apellido: p.apellido,
            correo: p.correo,
            telefono: p.telefono || '',
            fotoUrl: p.fotoUrl,
            biografia: p.biografia || '',
            rol: p.rol
        }));
        return res.json(lista);
    }

    static actualizarPaciente(req, res) {
        const idModificar = String(req.params.id);
        const { modificadoPor, rolModificadoPor, telefono, correo, fotoUrl, biografia, nombre, apellido } = req.body;

        if (!modificadoPor || rolModificadoPor !== 'Secretario') {
            return res.status(403).json({ error: 'Acceso denegado. Solo secretarios autorizados.' });
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
        const nuevoNombre = nombre ? store.sanitizar(nombre.trim()) : original.nombre;
        const nuevoApellido = apellido ? store.sanitizar(apellido.trim()) : original.apellido;

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
        original.fotoUrl = nuevaFoto || `https://ui-avatars.com/api/?name=${nuevoNombre}+${nuevoApellido}&background=28a745&color=fff`;
        original.biografia = nuevaBio;
        original.nombre = nuevoNombre;
        original.apellido = nuevoApellido;
        pacientes[indice] = original;
        store.guardarPacientes(pacientes);

        return res.json({
            mensaje: 'Datos del paciente actualizados de forma inmediata.',
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

    static listarCitas(req, res) {
        const citas = citaStore.leerCitas().map(citaStore.normalizarEstado);
        return res.json(citas);
    }

    static actualizarCita(req, res) {
        const { modificadoPor, rolModificadoPor, fecha, hora, doctor, motivo } = req.body;
        const citaId = Number(req.params.id);

        if (!modificadoPor || rolModificadoPor !== 'Secretario') {
            return res.status(403).json({ error: 'Acceso denegado. Solo secretarios autorizados.' });
        }

        const citas = citaStore.leerCitas().map(citaStore.normalizarEstado);
        const indice = citas.findIndex(c => c.id === citaId);
        if (indice === -1) {
            return res.status(404).json({ error: 'Cita no encontrada.' });
        }

        if (fecha) citas[indice].fecha = fecha;
        if (hora) citas[indice].hora = hora;
        if (doctor) citas[indice].doctor = store.sanitizar(String(doctor).trim());
        if (motivo !== undefined) citas[indice].motivo = store.sanitizar(String(motivo).trim());

        citaStore.guardarCitas(citas);
        return res.json({ mensaje: 'Cita actualizada correctamente.', cita: citas[indice] });
    }

    static listarBloques(req, res) {
        return res.json(citaStore.leerBloques());
    }

    static asignarBloque(req, res) {
        const { modificadoPor, rolModificadoPor, especialistaId, especialidad, fecha, horaInicio, horaFin } = req.body;

        if (!modificadoPor || rolModificadoPor !== 'Secretario') {
            return res.status(403).json({ error: 'Acceso denegado. Solo secretarios autorizados.' });
        }

        if (!especialistaId || !especialidad || !fecha || !horaInicio || !horaFin) {
            return res.status(400).json({ error: 'Complete especialista, especialidad, fecha y rango horario.' });
        }

        const personal = store.leerPersonal();
        const esp = personal.especialistas.find(e => String(e.id) === String(especialistaId));
        if (!esp) {
            return res.status(404).json({ error: 'Especialista no encontrado.' });
        }

        const bloques = citaStore.leerBloques();
        const nuevoBloque = {
            id: Date.now(),
            especialistaId: Number(especialistaId),
            especialistaNombre: `${esp.nombre} ${esp.apellido}`,
            especialidad: store.sanitizar(especialidad.trim()),
            fecha,
            horaInicio,
            horaFin,
            creadoPor: modificadoPor
        };

        bloques.push(nuevoBloque);
        citaStore.guardarBloques(bloques);

        return res.status(201).json({
            mensaje: 'Bloque horario asignado al médico.',
            bloque: nuevoBloque
        });
    }

    static listarEspecialistas(req, res) {
        const personal = store.leerPersonal();
        const lista = personal.especialistas.map(e => ({
            id: e.id,
            nombre: e.nombre,
            apellido: e.apellido,
            especialidad: e.especialidad
        }));
        return res.json(lista);
    }

    static obtenerMiPerfil(req, res) {
        const id = String(req.params.id);
        const personal = store.leerPersonal();
        const sec = personal.secretarios.find(s => String(s.id) === id);
        if (!sec) {
            return res.status(404).json({ error: 'Secretario no encontrado.' });
        }
        return res.json({
            id: sec.id,
            nombre: sec.nombre,
            apellido: sec.apellido,
            correo: sec.correo,
            rol: 'Secretario',
            rolOriginal: sec.rol,
            areaAsignada: sec.areaAsignada,
            fotoUrl: sec.fotoUrl
        });
    }

    static actualizarMiPerfil(req, res) {
        const id = String(req.params.id);
        const { modificadoPor, correo, fotoUrl } = req.body;

        if (!modificadoPor || String(modificadoPor) !== id) {
            return res.status(403).json({ error: 'Solo puede modificar su propio perfil.' });
        }

        const personal = store.leerPersonal();
        const indice = personal.secretarios.findIndex(s => String(s.id) === id);
        if (indice === -1) {
            return res.status(404).json({ error: 'Secretario no encontrado.' });
        }

        const sec = personal.secretarios[indice];
        const nuevoCorreo = correo ? store.sanitizar(String(correo).trim().toLowerCase()) : sec.correo;

        if (correo) {
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(nuevoCorreo)) {
                return res.status(400).json({ error: 'El correo electrónico tiene un formato inválido.' });
            }
            if (nuevoCorreo !== sec.correo && store.correoExisteGlobal(nuevoCorreo, id)) {
                return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
            }
        }

        sec.correo = nuevoCorreo;
        if (fotoUrl !== undefined && fotoUrl !== '') {
            sec.fotoUrl = String(fotoUrl).trim();
        }

        personal.secretarios[indice] = sec;
        store.guardarPersonal(personal);

        return res.json({
            mensaje: 'Datos de contacto actualizados de forma inmediata.',
            usuario: {
                id: sec.id,
                nombre: sec.nombre,
                apellido: sec.apellido,
                correo: sec.correo,
                rol: 'Secretario',
                rolOriginal: sec.rol,
                areaAsignada: sec.areaAsignada,
                fotoUrl: sec.fotoUrl
            }
        });
    }
}

module.exports = SecretarioController;
