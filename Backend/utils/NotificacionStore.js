const fs = require('fs');
const path = require('path');

class NotificacionStore {
    constructor() {
        this.rutaNotificaciones = path.join(__dirname, '../json/notificaciones_horarios.json');
    }

    leerNotificaciones() {
        try {
            const data = fs.readFileSync(this.rutaNotificaciones, 'utf8');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    guardarNotificaciones(notificaciones) {
        fs.writeFileSync(this.rutaNotificaciones, JSON.stringify(notificaciones, null, 2), 'utf8');
    }

    registrarNotificacionHorario({ especialistaId, secretarioId, secretarioNombre, bloque }) {
        const notificaciones = this.leerNotificaciones();
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
        this.guardarNotificaciones(notificaciones);
        return nueva;
    }

    listarPorEspecialista(especialistaId) {
        return this.leerNotificaciones().filter(
            (n) => Number(n.especialistaId) === Number(especialistaId)
        );
    }

    marcarComoLeida(notificacionId, especialistaId) {
        const notificaciones = this.leerNotificaciones();
        const indice = notificaciones.findIndex(
            (n) => Number(n.id) === Number(notificacionId) &&
                Number(n.especialistaId) === Number(especialistaId)
        );

        if (indice === -1) return null;

        notificaciones[indice].leida = true;
        this.guardarNotificaciones(notificaciones);
        return notificaciones[indice];
    }
}

module.exports = new NotificacionStore();
