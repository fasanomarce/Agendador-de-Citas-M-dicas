const API_BASE = 'http://localhost:3000/api';

class PerfilAdminView {
    constructor() {
        this.usuarioActivo = null;
        this.adminRegForm = document.getElementById('adminRegForm');
        this.especialidadForm = document.getElementById('especialidadForm');
        this.toast = document.getElementById('toast');
        this.init();
    }

    init() {
        const sesion = localStorage.getItem('usuarioActivo');
        if (!sesion) {
            window.location.href = 'login.html';
            return;
        }
        this.usuarioActivo = JSON.parse(sesion);
        if (this.usuarioActivo.rol !== 'Administrador') {
            window.location.href = destinoInicioSesion(this.usuarioActivo);
            return;
        }

        this.cargarEspecialidadesEnSelects();
        document.getElementById('adminRol').addEventListener('change', () => this.toggleCampos());
        this.adminRegForm.addEventListener('submit', (e) => this.registrarPersonal(e));
        this.especialidadForm.addEventListener('submit', (e) => this.registrarEspecialidad(e));
    }

    cargarEspecialidadesEnSelects() {
        fetch(`${API_BASE}/admin/especialidades`)
            .then(res => res.json())
            .then(lista => {
                const opts = '<option value="">Seleccione...</option>' +
                    lista.map(n => `<option value="${n}">${n}</option>`).join('');
                document.getElementById('adminEspecialidad').innerHTML = opts;
                document.getElementById('adminArea').innerHTML = opts;
            })
            .catch(() => {});
    }

    toggleCampos() {
        const rol = document.getElementById('adminRol').value;
        document.getElementById('adminCamposEspecialista').style.display = rol === 'Especialista' ? 'block' : 'none';
        document.getElementById('adminCamposSecretario').style.display = rol === 'Secretario' ? 'block' : 'none';
    }

    mostrarToast(msg, error = false) {
        this.toast.innerText = msg;
        this.toast.className = error ? 'toast-notificacion error' : 'toast-notificacion';
        this.toast.style.display = 'block';
        setTimeout(() => { this.toast.style.display = 'none'; }, 5000);
    }

    registrarPersonal(e) {
        e.preventDefault();
        const rol = document.getElementById('adminRol').value;
        const payload = {
            creadorId: this.usuarioActivo.id,
            creadorRol: 'Administrador',
            id: document.getElementById('adminCedula').value.trim(),
            nombre: document.getElementById('adminNombre').value.trim(),
            apellido: document.getElementById('adminApellido').value.trim(),
            correo: document.getElementById('adminCorreo').value.trim(),
            contrasena: document.getElementById('adminContrasena').value,
            rol
        };

        if (rol === 'Especialista') {
            payload.especialidad = document.getElementById('adminEspecialidad').value;
            payload.rolDetalle = document.getElementById('adminRolClinico').value.trim();
        } else if (rol === 'Secretario') {
            payload.areaAsignada = document.getElementById('adminArea').value;
            payload.rolDetalle = document.getElementById('adminRolAdmin').value.trim();
        }

        fetch(`${API_BASE}/admin/personal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json().then(b => ({ status: res.status, body: b })))
            .then(r => {
                if (r.status === 201) {
                    this.mostrarToast(r.body.mensaje);
                    this.adminRegForm.reset();
                    this.toggleCampos();
                } else {
                    this.mostrarToast(r.body.error || 'Error al registrar.', true);
                }
            })
            .catch(() => this.mostrarToast('Error de conexión.', true));
    }
    cargarDoctoresEnSelect() {
        fetch(`${API_BASE}/admin/doctores`)
            .then(res => res.json())
            .then(lista => {
                const opts = '<option value="">Seleccione...</option>' +
                    lista.map(d => `<option value="${d.id}">Dr/a. ${d.nombre} ${d.apellido} (${d.especialidad})</option>`).join('');
                document.getElementById('espDoctorAsignado').innerHTML = opts;
            })  
            .catch(() => {
                document.getElementById('espDoctorAsignado').innerHTML = '<option value="">Error cargando doctores</option>';
            }
        );
    }

    registrarEspecialidad(e) {
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
            .then(res => res.json().then(b => ({ status: res.status, body: b })))
            .then(r => {
                if (r.status === 201) {
                    this.mostrarToast(r.body.mensaje);
                    this.especialidadForm.reset();
                    this.cargarEspecialidadesEnSelects();
                } else {
                    this.mostrarToast(r.body.error || 'Error.', true);
                }
            })
            .catch(() => this.mostrarToast('Error de conexión.', true));
    }

    cerrarSesion() {
        localStorage.removeItem('usuarioActivo');
        window.location.href = 'login.html';
    }
}

const perfilAdminView = new PerfilAdminView();
