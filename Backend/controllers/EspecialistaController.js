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
}

module.exports = EspecialistaController;
