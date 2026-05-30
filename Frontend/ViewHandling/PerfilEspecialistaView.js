const API_BASE = 'http://localhost:3000/api';

class PerfilEspecialistaView {
    constructor() {
        this.usuarioActivo = null;
        this.notificacionesMemoria = [];
        this.init();
    }

    init() {
        const sesion = localStorage.getItem('usuarioActivo');
        if (!sesion) {
            window.location.href = 'login.html';
            return;
        }
        this.usuarioActivo = JSON.parse(sesion);
        if (!esEspecialista(this.usuarioActivo)) {
            window.location.href = typeof destinoInicioSesion === 'function'
                ? destinoInicioSesion(this.usuarioActivo)
                : 'login.html';
            return;
        }
        if (this.usuarioActivo.rol !== 'Especialista') {
            this.usuarioActivo.rol = 'Especialista';
            localStorage.setItem('usuarioActivo', JSON.stringify(this.usuarioActivo));
        }

        document.getElementById('tituloBienvenida').innerText =
            `Dr/a. ${this.usuarioActivo.nombre} ${this.usuarioActivo.apellido} — ${this.usuarioActivo.especialidad || ''}`;
        this.cargarCitas();
        this.cargarNotificacionesHorario();
    }

    mostrarToast(msg, error = false) {
        const t = document.getElementById('toast');
        t.innerText = msg;
        t.className = error ? 'toast-notificacion error' : 'toast-notificacion';
        t.style.display = 'block';
        t.style.opacity = '1';
        t.style.transition = 'opacity 0.5s ease';

        if (t._hideTimeout) clearTimeout(t._hideTimeout);
        if (t._removeTimeout) clearTimeout(t._removeTimeout);

        t._hideTimeout = setTimeout(() => {
            t.style.opacity = '0';
            t._removeTimeout = setTimeout(() => { t.style.display = 'none'; }, 600);
        }, 3000);
    }

    cargarCitas() {
        fetch(`${API_BASE}/especialista/citas?especialistaId=${this.usuarioActivo.id}`)
            .then(res => res.json())
            .then(citas => this.renderCitas(citas))
            .catch(() => {
                document.getElementById('listaCitasEsp').innerHTML =
                    '<p style="color:#dc3545">Error al cargar citas.</p>';
            });
    }

    cargarNotificacionesHorario() {
        fetch(`${API_BASE}/especialista/notificaciones-horario?especialistaId=${this.usuarioActivo.id}`)
            .then(res => res.json())
            .then(notificaciones => {
                this.notificacionesMemoria = Array.isArray(notificaciones) ? notificaciones : [];
                this.renderNotificacionesHorario(this.notificacionesMemoria);
            })
            .catch(() => {
                document.getElementById('listaNotificacionesHorario').innerHTML =
                    '<p style="color:#dc3545">Error al cargar la bandeja de horarios.</p>';
            });
    }

    actualizarBadgeNotificaciones(pendientes) {
        const badge = document.getElementById('badgeNotificacionesPendientes');
        if (!badge) return;

        const total = pendientes.length;
        badge.textContent = String(total);
        badge.className = total > 0 ? 'inbox-badge' : 'inbox-badge vacio';
        badge.setAttribute('aria-label', `${total} notificaciones pendientes`);
    }

    renderNotificacionesHorario(notificaciones) {
        const cont = document.getElementById('listaNotificacionesHorario');
        const pendientes = (notificaciones || []).filter((n) => !n.leida);
        const ordenadas = [...(notificaciones || [])].sort(
            (a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro)
        );

        this.actualizarBadgeNotificaciones(pendientes);

        if (!ordenadas.length) {
            cont.innerHTML = '<p class="mensaje-vacio">Su bandeja está vacía. Aún no recibe asignaciones de horario.</p>';
            return;
        }

        cont.innerHTML = '';
        ordenadas.forEach((n) => {
            const div = document.createElement('div');
            div.className = 'cita-card notificacion-card' + (n.leida ? ' leida' : '');

            const fechaLegible = new Date(n.fechaRegistro).toLocaleString('es-ES');
            div.innerHTML = `
                ${n.leida ? '' : '<span class="estado-pill pill-nueva">Nueva</span>'}
                <h3 class="cita-card-titulo">Asignación de bloque horario</h3>
                <p>${n.mensaje}</p>
                <p><strong>Secretario responsable:</strong> ${n.secretarioNombre} (ID ${n.secretarioId})</p>
                <p><small>Recibida: ${fechaLegible}</small></p>
            `;

            if (!n.leida) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-leida';
                btn.textContent = 'Marcar como leída';
                btn.addEventListener('click', () => this.marcarNotificacionLeida(n.id));
                div.appendChild(btn);
            }

            cont.appendChild(div);
        });
    }

    marcarNotificacionLeida(notificacionId) {
        fetch(`${API_BASE}/especialista/notificaciones-horario/${notificacionId}/leida`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ especialistaId: this.usuarioActivo.id })
        })
            .then(res => res.json().then(body => ({ status: res.status, body })))
            .then(({ status, body }) => {
                if (status === 200) {
                    this.mostrarToast('Notificación archivada en bandeja.');
                    this.cargarNotificacionesHorario();
                    return;
                }
                this.mostrarToast(body.error || 'No se pudo marcar la notificación.', true);
            })
            .catch(() => this.mostrarToast('Error de conexión al actualizar la bandeja.', true));
    }

    renderCitas(citas) {
        const cont = document.getElementById('listaCitasEsp');
        if (!citas.length) {
            cont.innerHTML = '<p>No tiene citas agendadas con pacientes.</p>';
            return;
        }

        cont.innerHTML = '';
        citas.forEach(c => {
            const completada = c.estado === 'completada';
            const div = document.createElement('div');
            div.className = 'cita-card' + (completada ? ' completada' : '');
            div.innerHTML = `
                <span class="estado-pill estado-${completada ? 'completada' : 'pendiente'}">${completada ? 'Completada' : 'Pendiente'}</span>
                <h3 style="margin:10px 0 5px">${c.nombre} ${c.apellido}</h3>
                <p><strong>Fecha:</strong> ${c.fecha} — <strong>Hora:</strong> ${c.hora}</p>
                <p><strong>Motivo:</strong> ${c.motivo || '—'}</p>
            `;
            if (!completada) {
                const btn = document.createElement('button');
                btn.innerText = 'Marcar como completada';
                btn.style.marginTop = '10px';
                btn.addEventListener('click', () => this.completarCita(c.id));
                div.appendChild(btn);
            }
            cont.appendChild(div);
        });
    }

    completarCita(citaId) {
        fetch(`${API_BASE}/especialista/citas/${citaId}/completar`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ especialistaId: this.usuarioActivo.id })
        })
            .then(res => res.json().then(b => ({ status: res.status, body: b })))
            .then(r => {
                if (r.status === 200) {
                    this.mostrarToast(r.body.mensaje);
                    this.cargarCitas();
                } else {
                    this.mostrarToast(r.body.error || 'No se pudo completar la cita.', true);
                }
            })
            .catch(() => this.mostrarToast('Error de conexión.', true));
    }

    cerrarSesion() {
        localStorage.removeItem('usuarioActivo');
        window.location.href = 'login.html';
    }
}

const perfilEspecialistaView = new PerfilEspecialistaView();
