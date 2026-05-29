const API_BASE = 'http://localhost:3000/api';

class PerfilView {
    constructor() {
        this.usuarioActivo = null;

        this.sideAvatar = document.getElementById('sideAvatar');
        this.sideNombre = document.getElementById('sideNombre');
        this.sideRol = document.getElementById('sideRol');
        this.sideCedula = document.getElementById('sideCedula');
        this.sideCorreo = document.getElementById('sideCorreo');

        this.form = document.getElementById('perfilForm');
        this.inputID = document.getElementById('inputID');
        this.inputRol = document.getElementById('inputRol');
        this.inputNombre = document.getElementById('inputNombre');
        this.inputApellido = document.getElementById('inputApellido');
        this.inputCorreo = document.getElementById('inputCorreo');
        this.inputTelefono = document.getElementById('inputTelefono');
        this.inputFoto = document.getElementById('inputFoto');
        this.inputBiografia = document.getElementById('inputBiografia');
        this.btnGuardar = document.getElementById('btnGuardarPerfil');
        this.loader = document.getElementById('loader');
        this.toast = document.getElementById('toast');

        this.init();
    }

    init() {
        const sesionJSON = localStorage.getItem('usuarioActivo');
        if (!sesionJSON) {
            window.location.href = 'login.html';
            return;
        }

        this.usuarioActivo = JSON.parse(sesionJSON);

        if (this.usuarioActivo.rol !== 'Paciente') {
            this.redirigirPorRol();
            return;
        }

        this.sideRol.innerText = 'Paciente';
        this.sideRol.className = 'rol-tag paciente';
        this.renderizarBarraLateral(this.usuarioActivo);
        this.cargarDatosFormulario(this.usuarioActivo);
        this.obtenerDatosFrescos(this.usuarioActivo.id);

        this.inputCorreo.addEventListener('input', () => this.validarCorreo());
        this.inputTelefono.addEventListener('input', () => this.validarTelefono());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    redirigirPorRol() {
        window.location.href = destinoInicioSesion(this.usuarioActivo);
    }

    renderizarBarraLateral(usuario) {
        this.sideAvatar.src = usuario.fotoUrl || `https://ui-avatars.com/api/?name=${usuario.nombre}+${usuario.apellido}&background=28a745&color=fff`;
        this.sideNombre.innerText = `${usuario.nombre} ${usuario.apellido}`;
        this.sideCedula.innerText = usuario.id;
        this.sideCorreo.innerText = usuario.correo;
    }

    cargarDatosFormulario(usuario) {
        this.inputID.value = usuario.id;
        this.inputRol.value = 'Paciente';
        this.inputNombre.value = usuario.nombre;
        this.inputApellido.value = usuario.apellido;
        this.inputCorreo.value = usuario.correo;
        this.inputTelefono.value = usuario.telefono || '';
        this.inputFoto.value = usuario.fotoUrl || '';
        this.inputBiografia.value = usuario.biografia || '';
    }

    obtenerDatosFrescos(id) {
        fetch(`${API_BASE}/pacientes/${id}`)
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => {
                this.usuarioActivo = data;
                localStorage.setItem('usuarioActivo', JSON.stringify(data));
                this.renderizarBarraLateral(data);
                this.cargarDatosFormulario(data);
            })
            .catch(() => console.error('No se pudo refrescar los datos del servidor.'));
    }

    validarCorreo() {
        const val = this.inputCorreo.value.trim();
        const fb = document.getElementById('correoFeedback');
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!val) {
            this.marcarInvalido(this.inputCorreo, fb, 'El correo electrónico es obligatorio.');
            return false;
        }
        if (!regex.test(val)) {
            this.marcarInvalido(this.inputCorreo, fb, 'Formato de correo inválido.');
            return false;
        }
        this.marcarValido(this.inputCorreo, fb);
        return true;
    }

    validarTelefono() {
        const val = this.inputTelefono.value.trim();
        const fb = document.getElementById('telefonoFeedback');
        if (val) {
            const limpio = val.replace(/[\s-+()]/g, '');
            if (!/^\d{7,15}$/.test(limpio)) {
                this.marcarInvalido(this.inputTelefono, fb, 'El teléfono debe contener entre 7 y 15 dígitos.');
                return false;
            }
        }
        this.marcarValido(this.inputTelefono, fb);
        return true;
    }

    marcarInvalido(input, feedback, mensaje) {
        input.classList.remove('input-success');
        input.classList.add('input-error');
        if (feedback) {
            feedback.innerText = mensaje;
            feedback.className = 'feedback error';
        }
    }

    marcarValido(input, feedback) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        if (feedback) {
            feedback.innerText = 'Correcto';
            feedback.className = 'feedback success';
        }
    }

    mostrarToast(mensaje, esError = false) {
        this.toast.innerText = mensaje;
        this.toast.className = esError ? 'toast-notificacion error' : 'toast-notificacion';
        this.toast.style.display = 'flex';
        setTimeout(() => { this.toast.style.display = 'none'; }, 5000);
    }

    handleSubmit(e) {
        e.preventDefault();
        if (!this.validarCorreo() || !this.validarTelefono()) {
            this.mostrarToast('Corrija los campos marcados en rojo antes de guardar.', true);
            return;
        }

        this.loader.style.display = 'inline-block';
        this.btnGuardar.disabled = true;

        const payload = {
            modificadoPor: this.usuarioActivo.id,
            rolModificadoPor: 'Paciente',
            correo: this.inputCorreo.value.trim(),
            telefono: this.inputTelefono.value.trim(),
            fotoUrl: this.inputFoto.value.trim(),
            biografia: this.inputBiografia.value.trim()
        };

        fetch(`${API_BASE}/pacientes/${this.usuarioActivo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json().then(data => ({ status: res.status, body: data })))
            .then(result => {
                this.loader.style.display = 'none';
                this.btnGuardar.disabled = false;
                if (result.status === 200) {
                    this.mostrarToast(result.body.mensaje || 'Datos actualizados.');
                    this.usuarioActivo = result.body.usuario;
                    localStorage.setItem('usuarioActivo', JSON.stringify(this.usuarioActivo));
                    this.renderizarBarraLateral(this.usuarioActivo);
                    this.cargarDatosFormulario(this.usuarioActivo);
                } else {
                    this.mostrarToast(result.body.error || 'Error al actualizar.', true);
                }
            })
            .catch(() => {
                this.loader.style.display = 'none';
                this.btnGuardar.disabled = false;
                this.mostrarToast('No se pudo conectar con el servidor.', true);
            });
    }

    cerrarSesion() {
        localStorage.removeItem('usuarioActivo');
        window.location.href = 'login.html';
    }
}

const perfilView = new PerfilView();
