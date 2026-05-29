const API_BASE = 'http://localhost:3000/api';

class PerfilView {
    constructor() {
        this.usuarioActivo = null;
        this.rolCanonico = null;

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
        this.grupoTelefono = document.getElementById('grupoTelefono');
        this.grupoBiografia = document.getElementById('grupoBiografia');
        this.grupoFoto = document.getElementById('grupoFoto');
        this.campoExtraRol = document.getElementById('campoExtraRol');
        this.labelExtraRol = document.getElementById('labelExtraRol');
        this.inputExtraRol = document.getElementById('inputExtraRol');
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
        this.rolCanonico = obtenerRolCanonico(this.usuarioActivo);

        if (this.rolCanonico === 'Especialista' && this.usuarioActivo.rol !== 'Especialista') {
            this.usuarioActivo.rol = 'Especialista';
            localStorage.setItem('usuarioActivo', JSON.stringify(this.usuarioActivo));
        }

        this.configurarNavegacion();
        this.configurarEtiquetasRol();
        this.configurarCamposPorRol();
        this.renderizarBarraLateral(this.usuarioActivo);
        this.cargarDatosFormulario(this.usuarioActivo);
        this.obtenerDatosFrescos(this.usuarioActivo.id);

        this.inputCorreo.addEventListener('input', () => this.validarCorreo());
        if (this.grupoTelefono && this.grupoTelefono.style.display !== 'none') {
            this.inputTelefono.addEventListener('input', () => this.validarTelefono());
        }
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    configurarNavegacion() {
        const nav = document.getElementById('mainNav')?.querySelector('.nav__list');
        if (!nav) return;

        const activo = 'style="background-color: rgba(255,255,255,0.3);"';
        const enlaces = {
            Paciente: `
                <li class="nav__item"><a href="MenuCitas.html" class="nav__link">Menú Principal</a></li>
                <li class="nav__item"><a href="ConsultarCitas.html" class="nav__link">Consultar Citas</a></li>
                <li class="nav__item"><a href="Perfil.html" class="nav__link" ${activo}>Mi Perfil</a></li>`,
            Secretario: `
                <li class="nav__item"><a href="PerfilSecretario.html" class="nav__link">Operaciones</a></li>
                <li class="nav__item"><a href="ConsultarCitas.html" class="nav__link">Consultar Citas</a></li>
                <li class="nav__item"><a href="Perfil.html" class="nav__link" ${activo}>Mi Perfil</a></li>`,
            Especialista: `
                <li class="nav__item"><a href="PerfilEspecialista.html" class="nav__link">Mis Citas</a></li>
                <li class="nav__item"><a href="Perfil.html" class="nav__link" ${activo}>Mi Perfil</a></li>`,
            Administrador: `
                <li class="nav__item"><a href="PerfilAdmin.html" class="nav__link">Administración</a></li>
                <li class="nav__item"><a href="Perfil.html" class="nav__link" ${activo}>Mi Perfil</a></li>`
        };

        nav.innerHTML = enlaces[this.rolCanonico] || enlaces.Paciente;
    }

    configurarEtiquetasRol() {
        const etiquetas = {
            Paciente: { texto: 'Paciente', clase: 'rol-tag paciente' },
            Secretario: { texto: 'Secretario', clase: 'rol-tag secretario' },
            Especialista: { texto: 'Especialista', clase: 'rol-tag' },
            Administrador: { texto: 'Administrador', clase: 'rol-tag' }
        };
        const info = etiquetas[this.rolCanonico] || etiquetas.Paciente;
        this.sideRol.innerText = info.texto;
        this.sideRol.className = info.clase;
        if (this.rolCanonico === 'Administrador') {
            this.sideRol.style.backgroundColor = '#0056b3';
            this.sideRol.style.color = 'white';
        }
    }

    configurarCamposPorRol() {
        const esPaciente = this.rolCanonico === 'Paciente';

        if (this.grupoTelefono) {
            this.grupoTelefono.style.display = esPaciente ? 'block' : 'none';
            this.inputTelefono.required = esPaciente;
        }
        if (this.grupoBiografia) {
            this.grupoBiografia.style.display = esPaciente ? 'block' : 'none';
        }
        if (this.grupoFoto) {
            this.grupoFoto.style.display = this.rolCanonico === 'Administrador' ? 'none' : 'block';
        }

        if (this.campoExtraRol) {
            if (this.rolCanonico === 'Especialista') {
                this.campoExtraRol.style.display = 'block';
                this.labelExtraRol.innerText = 'Especialidad médica';
            } else if (this.rolCanonico === 'Secretario') {
                this.campoExtraRol.style.display = 'block';
                this.labelExtraRol.innerText = 'Área asignada';
            } else {
                this.campoExtraRol.style.display = 'none';
            }
        }
    }

    urlObtenerPerfil(id) {
        const map = {
            Paciente: `${API_BASE}/pacientes/${id}`,
            Secretario: `${API_BASE}/secretario/perfil/${id}`,
            Especialista: `${API_BASE}/especialista/perfil/${id}`,
            Administrador: `${API_BASE}/admin/perfil/${id}`
        };
        return map[this.rolCanonico] || map.Paciente;
    }

    urlActualizarPerfil(id) {
        return this.urlObtenerPerfil(id);
    }

    renderizarBarraLateral(usuario) {
        const bg = this.rolCanonico === 'Paciente' ? '28a745' : '0056b3';
        this.sideAvatar.src = usuario.fotoUrl ||
            `https://ui-avatars.com/api/?name=${usuario.nombre}+${usuario.apellido}&background=${bg}&color=fff`;
        this.sideNombre.innerText = `${usuario.nombre} ${usuario.apellido}`;
        this.sideCedula.innerText = usuario.id;
        this.sideCorreo.innerText = usuario.correo;
    }

    cargarDatosFormulario(usuario) {
        this.inputID.value = usuario.id;
        this.inputRol.value = this.rolCanonico;
        this.inputNombre.value = usuario.nombre;
        this.inputApellido.value = usuario.apellido;
        this.inputCorreo.value = usuario.correo;
        this.inputTelefono.value = usuario.telefono || '';
        this.inputFoto.value = usuario.fotoUrl || '';
        this.inputBiografia.value = usuario.biografia || '';

        if (this.inputExtraRol) {
            if (this.rolCanonico === 'Especialista') {
                this.inputExtraRol.value = usuario.especialidad || '';
            } else if (this.rolCanonico === 'Secretario') {
                this.inputExtraRol.value = usuario.areaAsignada || '';
            }
        }
    }

    obtenerDatosFrescos(id) {
        fetch(this.urlObtenerPerfil(id))
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => {
                if (this.rolCanonico === 'Especialista') data.rol = 'Especialista';
                if (this.rolCanonico === 'Secretario') data.rol = 'Secretario';
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
        if (this.rolCanonico !== 'Paciente') return true;
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
            rolModificadoPor: this.rolCanonico,
            correo: this.inputCorreo.value.trim()
        };

        if (this.rolCanonico === 'Paciente') {
            payload.telefono = this.inputTelefono.value.trim();
            payload.fotoUrl = this.inputFoto.value.trim();
            payload.biografia = this.inputBiografia.value.trim();
        } else if (this.rolCanonico !== 'Administrador') {
            payload.fotoUrl = this.inputFoto.value.trim();
        }

        fetch(this.urlActualizarPerfil(this.usuarioActivo.id), {
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
                    const actualizado = result.body.usuario || result.body;
                    if (this.rolCanonico === 'Especialista') actualizado.rol = 'Especialista';
                    if (this.rolCanonico === 'Secretario') actualizado.rol = 'Secretario';
                    this.usuarioActivo = actualizado;
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
