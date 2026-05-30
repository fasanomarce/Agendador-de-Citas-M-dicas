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
        this.cargarDoctoresEnSelect(); // Cargar médicos disponibles en el select antes de registrar la especialidad
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
        try {
            console.log('[PerfilAdminView] mostrarToast:', msg, 'error=', error);
        } catch (e) {}

        this.toast.innerText = msg;
        this.toast.className = error ? 'toast-notificacion error' : 'toast-notificacion';

        // Ensure any inline display:none is removed so visibility via opacity works
        this.toast.style.removeProperty('display');
        const displayType = 'block';
        this.toast.style.display = displayType;
        // Force reflow to ensure transition applies
        // eslint-disable-next-line no-unused-expressions
        void this.toast.offsetWidth;

        this.toast.style.transition = 'opacity 0.5s ease';
        this.toast.style.opacity = '1';

        // clear previous timers
        if (this.toast._hideTimeout) clearTimeout(this.toast._hideTimeout);
        if (this.toast._removeTimeout) clearTimeout(this.toast._removeTimeout);

        // remember the current message so a stale timer doesn't hide a new one
        this.toast._lastMsg = msg;

        this.toast._hideTimeout = setTimeout(() => {
            // only hide if message hasn't changed
            if (this.toast._lastMsg === msg) {
                this.toast.style.opacity = '0';
                this.toast._removeTimeout = setTimeout(() => { this.toast.style.display = 'none'; }, 600);
            }
        }, 3000);
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
        const selectedDoctor = document.getElementById('espDoctorAsignado').value.trim();
        const nombre = document.getElementById('espNombre').value.trim();
        const ubicacion = document.getElementById('espUbicacion').value.trim();
        const descripcion = document.getElementById('espDescripcion').value.trim();

        // Debug: mostrar valores recopilados antes de validar
        console.log('[PerfilAdminView] valores formulario especialidad:', {
            nombre, ubicacion, descripcion, selectedDoctor
        });

        // Validación en cliente para evitar peticiones innecesarias
        if (!nombre || !ubicacion || !descripcion) {
            this.mostrarToast('Complete todos los campos de la especialidad.', true);
            return;
        }
        if (!selectedDoctor) {
            this.mostrarToast('Seleccione al menos un doctor asignado.', true);
            return;
        }

        const payload = {
            creadorRol: 'Administrador',
            nombre,
            ubicacion,
            descripcion,
            doctoresAsignados: [selectedDoctor]
        };

        console.log('Enviando payload especialidad:', payload);

        fetch(`${API_BASE}/admin/especialidades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(async res => {
                let body = null;
                try { body = await res.json(); } catch(e) { /* ignore parse errors */ }
                console.log('Respuesta /admin/especialidades', res.status, body);
                return { status: res.status, body };
            })
            .then(r => {
                if (r.status === 201) {
                    this.mostrarToast(r.body.mensaje || 'Especialidad registrada con éxito');
                    this.especialidadForm.reset();
                    this.cargarEspecialidadesEnSelects();
                } else {
                    const msg = r.body && (r.body.error || r.body.mensaje) ? (r.body.error || r.body.mensaje) : 'Error.';
                    this.mostrarToast(msg, true);
                }
            })
            .catch((err) => {
                console.error('Error petición especialidades:', err);
                this.mostrarToast('Error de conexión.', true);
            });
    }

    cerrarSesion() {
        localStorage.removeItem('usuarioActivo');
        window.location.href = 'login.html';
    }
}

const perfilAdminView = new PerfilAdminView();
