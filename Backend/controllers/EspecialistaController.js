const store = require('../utils/usuarioStore');
const citaStore = require('../utils/citaStore');

class EspecialistaController {
    static _buscarEspecialista(id) {
        const personal = store.leerPersonal();
        return personal.especialistas.find(e => String(e.id) === String(id));
    }

    static obtenerPerfil(req, res) {
        const esp = EspecialistaController._buscarEspecialista(req.params.id);
        if (!esp) {
            return res.status(404).json({ error: 'Especialista no encontrado.' });
        }

        return res.json({
            id: esp.id,
            nombre: esp.nombre,
            apellido: esp.apellido,
            correo: esp.correo,
            rol: 'Especialista',
            rolClinico: esp.rol,
            especialidad: esp.especialidad,
            fotoUrl: esp.fotoUrl
        });
    }

    static listarCitasAgendadas(req, res) {
        const { especialistaId } = req.query;
        if (!especialistaId) {
            return res.status(400).json({ error: 'Debe indicar el especialistaId.' });
        }

        const esp = EspecialistaController._buscarEspecialista(especialistaId);
        if (!esp) {
            return res.status(404).json({ error: 'Especialista no encontrado.' });
        }

        const etiquetaDoctor = citaStore.nombreDoctorDesdeEspecialista(esp);
        const citas = citaStore
            .leerCitas()
            .map(citaStore.normalizarEstado)
            .filter(c => c.doctor === etiquetaDoctor || (c.doctor && c.doctor.includes(esp.apellido)));

        return res.json(citas);
    }

    static marcarCitaCompletada(req, res) {
        const { especialistaId } = req.body;
        const citaId = Number(req.params.id);

        if (!especialistaId) {
            return res.status(400).json({ error: 'Debe indicar el especialistaId.' });
        }

        const esp = EspecialistaController._buscarEspecialista(especialistaId);
        if (!esp) {
            return res.status(404).json({ error: 'Especialista no encontrado.' });
        }

        const citas = citaStore.leerCitas().map(citaStore.normalizarEstado);
        const indice = citas.findIndex(c => c.id === citaId);

        if (indice === -1) {
            return res.status(404).json({ error: 'Cita no encontrada.' });
        }

        const etiquetaDoctor = citaStore.nombreDoctorDesdeEspecialista(esp);
        const cita = citas[indice];
        if (cita.doctor !== etiquetaDoctor && !(cita.doctor && cita.doctor.includes(esp.apellido))) {
            return res.status(403).json({ error: 'No tiene permiso para modificar esta cita.' });
        }

        citas[indice].estado = 'completada';
        citaStore.guardarCitas(citas);

        return res.json({
            mensaje: 'Cita marcada como completada.',
            cita: citas[indice]
        });
    }

    static actualizarMiPerfil(req, res) {
        const id = String(req.params.id);
        const { modificadoPor, correo, fotoUrl } = req.body;

        if (!modificadoPor || String(modificadoPor) !== id) {
            return res.status(403).json({ error: 'Solo puede modificar su propio perfil.' });
        }

        const personal = store.leerPersonal();
        const indice = personal.especialistas.findIndex(e => String(e.id) === id);
        if (indice === -1) {
            return res.status(404).json({ error: 'Especialista no encontrado.' });
        }

        const esp = personal.especialistas[indice];
        const nuevoCorreo = correo ? store.sanitizar(String(correo).trim().toLowerCase()) : esp.correo;

        if (correo) {
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(nuevoCorreo)) {
                return res.status(400).json({ error: 'El correo electrónico tiene un formato inválido.' });
            }
            if (nuevoCorreo !== esp.correo && store.correoExisteGlobal(nuevoCorreo, id)) {
                return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
            }
        }

        esp.correo = nuevoCorreo;
        if (fotoUrl !== undefined && fotoUrl !== '') {
            esp.fotoUrl = String(fotoUrl).trim();
        }

        personal.especialistas[indice] = esp;
        store.guardarPersonal(personal);

        return res.json({
            mensaje: 'Datos de contacto actualizados de forma inmediata.',
            usuario: {
                id: esp.id,
                nombre: esp.nombre,
                apellido: esp.apellido,
                correo: esp.correo,
                rol: 'Especialista',
                rolClinico: esp.rol,
                especialidad: esp.especialidad,
                color: esp.color,
                fotoUrl: esp.fotoUrl
            }
        });
    }
}

module.exports = EspecialistaController;
