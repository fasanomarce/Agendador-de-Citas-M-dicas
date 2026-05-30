const fs = require('fs');
const path = require('path');

const horariosRuta = path.join(__dirname, '../horarios.json');
const personalRuta = path.join(__dirname, '../personal.json');

const DURACION_MINIMA_MINUTOS = 60;
const DURACION_MAXIMA_MINUTOS = 300;

function leerHorarios() {
    const contenido = fs.readFileSync(horariosRuta, 'utf-8');
    const json = JSON.parse(contenido);
    return Array.isArray(json.horarios) ? json.horarios : [];
}

function guardarHorarios(horarios) {
    fs.writeFileSync(horariosRuta, JSON.stringify({ horarios }, null, 2), 'utf-8');
}

function convertirHoraAMinutos(hora) {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

function validarRangoDuracion(duracion) {
    if (duracion <= 0) {
        return {
            valido: false,
            mensaje: 'La hora de fin debe ser posterior a la hora de inicio.'
        };
    }

    if (duracion < DURACION_MINIMA_MINUTOS) {
        return {
            valido: false,
            mensaje: `La duración del bloque debe ser de al menos ${DURACION_MINIMA_MINUTOS} minutos (1 hora).`
        };
    }

    if (duracion > DURACION_MAXIMA_MINUTOS) {
        return {
            valido: false,
            mensaje: `La duración del bloque no puede exceder ${DURACION_MAXIMA_MINUTOS} minutos (5 horas).`
        };
    }

    return { valido: true, mensaje: '' };
}

function existeColisionServidor(bloqueNuevo, bloqueExistente) {
    if (bloqueNuevo.diaSemana !== bloqueExistente.diaSemana) return false;

    const inicioNuevo = bloqueNuevo.inicioMinutos;
    const finNuevo = bloqueNuevo.finMinutos;
    const inicioExistente = bloqueExistente.inicioMinutos;
    const finExistente = bloqueExistente.finMinutos;

    const hayInterseccion = inicioNuevo < finExistente && finNuevo > inicioExistente;
    if (!hayInterseccion) return false;

    const mismaEspecialidad = bloqueNuevo.especialidad === bloqueExistente.especialidad;
    const violacionDobleConsultorio = bloqueNuevo.especialidad !== bloqueExistente.especialidad;

    return mismaEspecialidad || violacionDobleConsultorio;
}

class HorarioController {
    static obtenerPersonal(req, res) {
        try {
            const personal = JSON.parse(fs.readFileSync(personalRuta, 'utf-8'));
            res.json({ especialistas: personal.especialistas || [] });
        } catch (error) {
            res.status(500).json({ mensaje: 'No se pudo leer personal.json' });
        }
    }

    static obtenerHorariosPorEspecialista(req, res) {
        const especialistaId = Number(req.params.id);
        const horarios = leerHorarios().filter(
            (h) => Number(h.especialistaId) === especialistaId
        );
        res.json(horarios);
    }

    static guardarHorario(req, res) {
        const cuerpo = req.body;

        if (
            !cuerpo ||
            !cuerpo.especialistaId ||
            !cuerpo.diaSemana ||
            !cuerpo.horaInicio ||
            !cuerpo.horaFin ||
            !cuerpo.especialidad ||
            !cuerpo.secretarioId ||
            !cuerpo.secretarioNombre
        ) {
            return res.status(400).json({
                mensaje: 'Payload incompleto. Se requiere especialista, horario, especialidad y datos del secretario.'
            });
        }

        const inicioMinutos = cuerpo.inicioMinutos ?? convertirHoraAMinutos(cuerpo.horaInicio);
        const finMinutos = cuerpo.finMinutos ?? convertirHoraAMinutos(cuerpo.horaFin);
        const duracion = finMinutos - inicioMinutos;

        const validacionDuracion = validarRangoDuracion(duracion);
        if (!validacionDuracion.valido) {
            return res.status(400).json({ mensaje: validacionDuracion.mensaje });
        }

        const bloqueNuevo = {
            especialistaId: Number(cuerpo.especialistaId),
            diaSemana: cuerpo.diaSemana,
            horaInicio: cuerpo.horaInicio,
            horaFin: cuerpo.horaFin,
            especialidad: cuerpo.especialidad,
            duracionMinutos: cuerpo.duracionMinutos ?? duracion,
            inicioMinutos,
            finMinutos,
            secretarioId: Number(cuerpo.secretarioId),
            secretarioNombre: cuerpo.secretarioNombre
        };

        const horarios = leerHorarios();
        const colision = horarios.some((existente) =>
            Number(existente.especialistaId) === bloqueNuevo.especialistaId &&
            existeColisionServidor(bloqueNuevo, existente)
        );

        if (colision) {
            return res.status(409).json({ mensaje: 'Conflicto de horarios detectado en el servidor.' });
        }

        const nuevoRegistro = {
            id: horarios.length > 0 ? Math.max(...horarios.map((h) => h.id || 0)) + 1 : 1,
            ...bloqueNuevo
        };

        horarios.push(nuevoRegistro);
        guardarHorarios(horarios);

        res.status(201).json(nuevoRegistro);
    }
}

module.exports = HorarioController;
