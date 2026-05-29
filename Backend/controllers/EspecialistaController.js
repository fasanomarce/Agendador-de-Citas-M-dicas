const UsuarioStore = require('../utils/UsuarioStore');
const CitaStore = require('../utils/CitaStore');

class EspecialistaController {
    static _obtenerEspecialista(id) {
        const personal = UsuarioStore.leerPersonal();
        return personal.especialistas.find(e => String(e.id) === String(id));
    }

    static listarCitasAgendadas(req, res) {
        const especialistaId = String(req.params.id);
        const especialista = EspecialistaController._obtenerEspecialista(especialistaId);

        if (!especialista) {
            return res.status(404).json({ error: 'Especialista no encontrado.' });
        }

        const citas = CitaStore.leerCitas().filter(c => CitaStore.coincideConEspecialista(c, especialista));
        return res.json(citas);
    }

    static marcarCitaCompletada(req, res) {
        const especialistaId = String(req.params.id);
        const citaId = Number(req.params.citaId);
        const { solicitanteId, solicitanteRol } = req.body;

        if (solicitanteRol !== 'Especialista' || String(solicitanteId) !== especialistaId) {
            return res.status(403).json({ error: 'Acceso denegado. Solo el especialista asignado puede completar la cita.' });
        }

        const especialista = EspecialistaController._obtenerEspecialista(especialistaId);
        if (!especialista) {
            return res.status(404).json({ error: 'Especialista no encontrado.' });
        }

        const citas = CitaStore.leerCitas();
        const indice = citas.findIndex(c => c.id === citaId);
        if (indice === -1) {
            return res.status(404).json({ error: 'Cita no encontrada.' });
        }

        if (!CitaStore.coincideConEspecialista(citas[indice], especialista)) {
            return res.status(403).json({ error: 'La cita no pertenece a este especialista.' });
        }

        citas[indice].estado = 'completada';
        CitaStore.guardarCitas(citas);

        return res.json({
            mensaje: 'Cita marcada como completada.',
            cita: citas[indice]
        });
    }

    static obtenerPerfil(req, res) {
        const resultado = UsuarioStore.buscarPorId(req.params.id);
        if (!resultado || resultado.tipo !== 'especialista') {
            return res.status(404).json({ error: 'Especialista no encontrado.' });
        }
        return res.json(resultado.usuario);
    }
}

module.exports = EspecialistaController;
