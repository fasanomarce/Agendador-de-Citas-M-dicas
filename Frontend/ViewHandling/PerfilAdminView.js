class PerfilAdminView {
    constructor() {
        this.usuario = exigirSesion();
        if (!this.usuario) return;
        if (this.usuario.rol !== 'Administrador') {
            window.location.replace(perfilUrlPorRol(this.usuario.rol));
            return;
        }

        this.toast = document.getElementById('toast');
        this.init();
    }

    init() {
        document.getElementById('sideAvatar').src = this.usuario.fotoUrl || '';
        document.getElementById('sideNombre').innerText = `${this.usuario.nombre} ${this.usuario.apellido}`;

        document.getElementById('btnCerrarSesion').addEventListener('click', () => {
            localStorage.removeItem('usuarioActivo');
            window.location.href = 'login.html';
        });

        document.getElementById('adminRol').addEventListener('change', () => this.toggleCamposRol());
        document.getElementById('adminRegForm').addEventListener('submit', (e) => this.registrarPersonal(e));
        document.getElementById('especialidadForm').addEventListener('submit', (e) => this.crearEspecialidad(e));

        this.cargarCatalogoEspecialidades();
    }

    cargarCatalogoEspecialidades() {
        fetch(`${API_BASE}/admin/especialidades`)
            .then(res => res.json())
            .then(nombres => {
                document.getElementById('listaEspecialidades').innerText = nombres.join(', ') || 'Ninguna';
                const opts = nombres.map(n => `<option value="${n}">${n}</option>`).join('');
                document.getElementById('adminEspecialidad').innerHTML = '<option value="">Seleccione...</option>' + opts;
                document.getElementById('adminArea').innerHTML = '<option value="">Seleccione...</option>' + opts;
            });
    }

    toggleCamposRol() {
        const rol = document.getElementById('adminRol').value;
        document.getElementById('adminCamposEspecialista').style.display = rol === 'Especialista' ? 'block' : 'none';
        document.getElementById('adminCamposSecretario').style.display = rol === 'Secretario' ? 'block' : 'none';
    }

    registrarPersonal(e) {
        e.preventDefault();
        const rol = document.getElementById('adminRol').value;
        const payload = {
            creadorId: this.usuario.id,
            creadorRol: 'Administrador',
            id: document.getElementById('adminCedula').value.trim(),
            nombre: document.getElementById('adminNombre').value.trim(),
            apellido: document.getElementById('adminApellido').value.trim(),
            correo: document.getElementById('adminCorreo').value.trim(),
            contrasena: document.getElementById('adminContrasena').value,
            rol
        };

        if (rol === 'Especialista') payload.especialidad = document.getElementById('adminEspecialidad').value;
        if (rol === 'Secretario') payload.areaAsignada = document.getElementById('adminArea').value;

        fetch(`${API_BASE}/admin/personal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json().then(body => ({ status: res.status, body })))
            .then(({ status, body }) => {
                if (status === 201) {
                    mostrarToast(this.toast, body.mensaje);
                    e.target.reset();
                    this.toggleCamposRol();
                } else {
                    mostrarToast(this.toast, body.error || 'Error al registrar.', true);
                }
            })
            .catch(() => mostrarToast(this.toast, 'Error de conexión.', true));
    }

    crearEspecialidad(e) {
        e.preventDefault();
        const payload = {
            creadorRol: 'Administrador',
            nombre: document.getElementById('espNombre').value.trim(),
            codigo: document.getElementById('espCodigo').value.trim(),
            ubicacion: document.getElementById('espUbicacion').value.trim(),
            horario: document.getElementById('espHorario').value.trim(),
            descripcion: document.getElementById('espDescripcion').value.trim()
        };

        fetch(`${API_BASE}/admin/especialidades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json().then(body => ({ status: res.status, body })))
            .then(({ status, body }) => {
                if (status === 201) {
                    mostrarToast(this.toast, body.mensaje);
                    e.target.reset();
                    this.cargarCatalogoEspecialidades();
                } else {
                    mostrarToast(this.toast, body.error || 'Error al crear especialidad.', true);
                }
            })
            .catch(() => mostrarToast(this.toast, 'Error de conexión.', true));
    }
}

new PerfilAdminView();
