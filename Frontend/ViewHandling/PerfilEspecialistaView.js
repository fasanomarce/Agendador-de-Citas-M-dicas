class PerfilEspecialistaView {
    constructor() {
        this.usuario = exigirSesion();
        if (!this.usuario) return;
        if (this.usuario.rol !== 'Especialista') {
            window.location.replace(perfilUrlPorRol(this.usuario.rol));
            return;
        }

        this.toast = document.getElementById('toast');
        this.init();
    }

    init() {
        document.getElementById('sideAvatar').src = this.usuario.fotoUrl || '';
        document.getElementById('sideNombre').innerText = `Dr/a. ${this.usuario.nombre} ${this.usuario.apellido}`;
        document.getElementById('sideEspecialidad').innerText = this.usuario.especialidad || '';

        document.getElementById('btnCerrarSesion').addEventListener('click', () => {
            localStorage.removeItem('usuarioActivo');
            window.location.href = 'login.html';
        });

        this.cargarCitas();
    }

    cargarCitas() {
        fetch(`${API_BASE}/especialistas/${this.usuario.id}/citas`)
            .then(res => res.json())
            .then(citas => this.renderCitas(citas))
            .catch(() => {
                document.getElementById('listaCitas').innerHTML = '<p>Error al cargar citas.</p>';
            });
    }

    renderCitas(citas) {
        const cont = document.getElementById('listaCitas');
        if (!citas.length) {
            cont.innerHTML = '<p>No tiene citas agendadas.</p>';
            return;
        }

        cont.innerHTML = '';
        citas.forEach(cita => {
            const card = document.createElement('div');
            card.className = 'cita-gestion-card';
            const estado = cita.estado || 'pendiente';
            card.innerHTML = `
                <p><strong>Paciente:</strong> ${cita.nombre} ${cita.apellido}</p>
                <p><strong>Fecha:</strong> ${cita.fecha} — <strong>Hora:</strong> ${cita.hora}</p>
                <p><strong>Motivo:</strong> ${cita.motivo || '—'}</p>
                <p><strong>Estado:</strong> <span id="estado-${cita.id}">${estado}</span></p>
            `;

            if (estado !== 'completada') {
                const btn = document.createElement('button');
                btn.innerText = 'Marcar como completada';
                btn.style.marginTop = '10px';
                btn.addEventListener('click', () => this.completar(cita.id));
                card.appendChild(btn);
            }

            cont.appendChild(card);
        });
    }

    completar(citaId) {
        fetch(`${API_BASE}/especialistas/${this.usuario.id}/citas/${citaId}/completar`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                solicitanteId: this.usuario.id,
                solicitanteRol: 'Especialista'
            })
        })
            .then(res => res.json().then(body => ({ status: res.status, body })))
            .then(({ status, body }) => {
                if (status === 200) {
                    mostrarToast(this.toast, body.mensaje);
                    this.cargarCitas();
                } else {
                    mostrarToast(this.toast, body.error || 'No se pudo completar la cita.', true);
                }
            })
            .catch(() => mostrarToast(this.toast, 'Error de conexión.', true));
    }
}

new PerfilEspecialistaView();
