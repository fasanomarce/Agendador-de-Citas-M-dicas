class PerfilPacienteView {
    constructor() {
        this.usuario = exigirSesion();
        if (!this.usuario) return;
        if (this.usuario.rol !== 'Paciente') {
            window.location.replace(perfilUrlPorRol(this.usuario.rol));
            return;
        }

        this.toast = document.getElementById('toast');
        this.form = document.getElementById('perfilForm');
        this.init();
    }

    init() {
        this.renderSidebar(this.usuario);
        this.cargarFormulario(this.usuario);
        this.refrescarDesdeApi();

        document.getElementById('btnCerrarSesion').addEventListener('click', () => {
            localStorage.removeItem('usuarioActivo');
            window.location.href = 'login.html';
        });

        this.form.addEventListener('submit', (e) => this.guardar(e));
    }

    renderSidebar(u) {
        document.getElementById('sideAvatar').src = u.fotoUrl || `https://ui-avatars.com/api/?name=${u.nombre}+${u.apellido}&background=28a745&color=fff`;
        document.getElementById('sideNombre').innerText = `${u.nombre} ${u.apellido}`;
        document.getElementById('sideCedula').innerText = u.id;
        document.getElementById('sideCorreo').innerText = u.correo;
    }

    cargarFormulario(u) {
        document.getElementById('inputID').value = u.id;
        document.getElementById('inputCorreo').value = u.correo;
        document.getElementById('inputTelefono').value = u.telefono || '';
        document.getElementById('inputFoto').value = u.fotoUrl || '';
        document.getElementById('inputBiografia').value = u.biografia || '';
    }

    refrescarDesdeApi() {
        fetch(`${API_BASE}/pacientes/${this.usuario.id}?solicitanteId=${this.usuario.id}&solicitanteRol=Paciente`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                this.usuario = guardarSesion(data);
                this.renderSidebar(data);
                this.cargarFormulario(data);
            })
            .catch(() => {});
    }

    guardar(e) {
        e.preventDefault();
        const payload = {
            modificadoPor: this.usuario.id,
            rolModificadoPor: 'Paciente',
            correo: document.getElementById('inputCorreo').value.trim(),
            telefono: document.getElementById('inputTelefono').value.trim(),
            fotoUrl: document.getElementById('inputFoto').value.trim(),
            biografia: document.getElementById('inputBiografia').value.trim()
        };

        fetch(`${API_BASE}/pacientes/${this.usuario.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json().then(body => ({ status: res.status, body })))
            .then(({ status, body }) => {
                if (status === 200) {
                    this.usuario = guardarSesion(body.usuario);
                    this.renderSidebar(this.usuario);
                    mostrarToast(this.toast, body.mensaje);
                } else {
                    mostrarToast(this.toast, body.error || 'Error al guardar.', true);
                }
            })
            .catch(() => mostrarToast(this.toast, 'Error de conexión con el servidor.', true));
    }
}

new PerfilPacienteView();
