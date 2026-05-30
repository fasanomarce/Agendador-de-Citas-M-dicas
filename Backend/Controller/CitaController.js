const store = require('../utils/UsuarioStore');

function etiquetaDoctor(esp) {
    return `Dr/a. ${esp.nombre} ${esp.apellido}`;
}

class CitaController {
    static fs = require('fs');
    static path = require('path');
    static rutaJson = CitaController.path.join(__dirname, '../json/citas.json');

    static validarEspecialistaEnArea(especialidad, especialistaId, doctorTexto) {
        const especialidades = store.leerEspecialidades();
        if (!especialidad || !especialidades[especialidad]) {
            return { error: 'El área médica indicada no es válida. Selecciónela desde el menú de especialidades.' };
        }

        const personal = store.leerPersonal();
        const doctoresArea = personal.especialistas.filter(e => e.especialidad === especialidad);

        if (doctoresArea.length === 0) {
            return { error: `No hay especialistas disponibles en ${especialidad}.` };
        }

        let esp = null;
        if (especialistaId != null && especialistaId !== '') {
            esp = doctoresArea.find(e => String(e.id) === String(especialistaId));
        }
        if (!esp && doctorTexto) {
            const texto = String(doctorTexto).trim();
            esp = doctoresArea.find(e => etiquetaDoctor(e) === texto);
        }

        if (!esp) {
            return { error: 'Debe agendar con un especialista asignado al área correspondiente.' };
        }

        return { especialista: esp };
    }

    static guardarCita(req, res) {
        const nuevaCita = { ...req.body };
        const { especialidad, especialistaId, doctor } = nuevaCita;

        const validacion = CitaController.validarEspecialistaEnArea(especialidad, especialistaId, doctor);
        if (validacion.error) {
            return res.status(400).json({ error: validacion.error });
        }

        const esp = validacion.especialista;
        nuevaCita.doctor = etiquetaDoctor(esp);
        nuevaCita.especialidad = especialidad;
        nuevaCita.especialistaId = esp.id;

        CitaController.fs.readFile(CitaController.rutaJson, 'utf8', (err, data) => {
            if (err) return res.status(500).json({ error: 'Error leyendo archivo' });

            let citas = [];
            if (data) {
                try {
                    citas = JSON.parse(data);
                } catch {
                    citas = [];
                }
            }

            if (nuevaCita.pacienteId) {
                const pacienteIdStr = String(nuevaCita.pacienteId);
                const tieneCitaActiva = citas.some(cita => String(cita.pacienteId) === pacienteIdStr);
                if (tieneCitaActiva) {
                    return res.status(400).json({ error: 'El usuario ya tiene una cita registrada.' });
                }
            }

            nuevaCita.id = Date.now();
            if (!nuevaCita.estado) nuevaCita.estado = 'pendiente';
            if (nuevaCita.pacienteId != null) {
                nuevaCita.pacienteId = String(nuevaCita.pacienteId);
            }

            citas.push(nuevaCita);

            CitaController.fs.writeFile(CitaController.rutaJson, JSON.stringify(citas, null, 2), (errWrite) => {
                if (errWrite) return res.status(500).json({ error: 'Error guardando la cita en el archivo.' });
                res.status(201).json({ mensaje: 'Cita guardada correctamente.' });
            });
        });
    }

    // Consulta general restringida: usar endpoints por rol
    static cargarCitas(req, res) {
        return res.status(403).json({
            error: 'Use el endpoint de citas de su rol: /api/pacientes/:id/citas o /api/secretario/citas.'
        });
    }
}

module.exports = CitaController;