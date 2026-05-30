const fs = require('fs');
const path = require('path');

const rutaNotificaciones = path.join(__dirname, '../json/notificaciones_horarios.json');

function leerNotificaciones() {
    try {
        const data = fs.readFileSync(rutaNotificaciones, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function guardarNotificaciones(notificaciones) {
    fs.writeFileSync(rutaNotificaciones, JSON.stringify(notificaciones, null, 2), 'utf8');
}

function registrarNotificacionHorario({ especialistaId, secretarioId, secretarioNombre, bloque }) {
    const notificaciones = leerNotificaciones();
    const diaEtiqueta = bloque.diaSemana || '—';

    const nueva = {
        id: notificaciones.length > 0
            ? Math.max(...notificaciones.map((n) => n.id || 0)) + 1
            : 1,
        especialistaId: Number(especialistaId),
        secretarioId: Number(secretarioId),
        secretarioNombre,
        bloqueId: bloque.id,
        mensaje:
            `Se asignó un bloque horario (${diaEtiqueta}, ${bloque.horaInicio}–${bloque.horaFin}) ` +
            `registrado por ${secretarioNombre} (ID ${secretarioId}).`,
        leida: false,
        fechaRegistro: new Date().toISOString()
    };

    notificaciones.push(nueva);
    guardarNotificaciones(notificaciones);
    return nueva;
}

function listarPorEspecialista(especialistaId) {
    return leerNotificaciones().filter(
        (n) => Number(n.especialistaId) === Number(especialistaId)
    );
}

function marcarComoLeida(notificacionId, especialistaId) {
    const notificaciones = leerNotificaciones();
    const indice = notificaciones.findIndex(
        (n) => Number(n.id) === Number(notificacionId) &&
            Number(n.especialistaId) === Number(especialistaId)
    );

    if (indice === -1) return null;

    notificaciones[indice].leida = true;
    guardarNotificaciones(notificaciones);
    return notificaciones[indice];
}

module.exports = {
    leerNotificaciones,
    guardarNotificaciones,
    registrarNotificacionHorario,
    listarPorEspecialista,
    marcarComoLeida
};
