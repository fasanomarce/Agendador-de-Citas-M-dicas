const API_BASE = 'http://localhost:3000/api';

class PerfilEspecialistaView {
    constructor() {
        this.usuarioActivo = null;
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
    }

    mostrarToast(msg, error = false) {
        const t = document.getElementById('toast');
        t.innerText = msg;
        t.className = error ? 'toast-notificacion error' : 'toast-notificacion';
        t.style.display = 'block';
        setTimeout(() => { t.style.display = 'none'; }, 5000);
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
