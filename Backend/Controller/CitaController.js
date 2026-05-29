const CitaStore = require('../utils/CitaStore');
const UsuarioStore = require('../utils/UsuarioStore');

class CitaController {
    static guardarCita(req, res) {
        const nuevaCita = req.body;

        if (!nuevaCita.nombre || !nuevaCita.apellido || !nuevaCita.doctor || !nuevaCita.fecha || !nuevaCita.hora) {
            return res.status(400).json({ error: 'Datos de cita incompletos.' });
        }

        const citas = CitaStore.leerCitas();
        nuevaCita.id = Date.now();
        nuevaCita.estado = nuevaCita.estado || 'pendiente';
        nuevaCita.motivo = nuevaCita.motivo ? UsuarioStore.sanitizar(String(nuevaCita.motivo).trim()) : '';
        nuevaCita.nombre = UsuarioStore.sanitizar(String(nuevaCita.nombre).trim());
        nuevaCita.apellido = UsuarioStore.sanitizar(String(nuevaCita.apellido).trim());
        nuevaCita.doctor = UsuarioStore.sanitizar(String(nuevaCita.doctor).trim());

        citas.push(nuevaCita);
        CitaStore.guardarCitas(citas);

        res.status(201).json({ mensaje: 'Cita guardada correctamente.', cita: nuevaCita });
    }

    static cargarCitas(req, res) {
        res.json(CitaStore.leerCitas());
    }
}

module.exports = CitaController;
