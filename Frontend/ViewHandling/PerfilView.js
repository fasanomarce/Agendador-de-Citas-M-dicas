class PerfilView {
    constructor() {
        this.usuarioActivo = null;
        this.idModificar = null; // ID del usuario que se está editando actualmente
        this.listaPacientesCache = []; // Caché de pacientes para búsqueda local

        // Elementos de la Barra Lateral
        this.sideAvatar = document.getElementById('sideAvatar');
        this.sideNombre = document.getElementById('sideNombre');
        this.sideRol = document.getElementById('sideRol');
        this.sideCedula = document.getElementById('sideCedula');
        this.sideCorreo = document.getElementById('sideCorreo');

        // Elementos del Formulario
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

        // Paneles específicos de Secretario
        this.panelSecretario = document.getElementById('panelSecretario');
        this.buscadorPaciente = document.getElementById('buscadorPaciente');
        this.listaPacientes = document.getElementById('listaPacientes');
        this.tituloFormulario = document.getElementById('tituloFormulario');
        this.subtituloFormulario = document.getElementById('subtituloFormulario');

        // Panel específico de Administrador (NUEVO)
        this.panelAdministrador = document.getElementById('panelAdministrador');
        this.adminRegForm = document.getElementById('adminRegForm');
        this.adminRol = document.getElementById('adminRol');
        this.adminCedula = document.getElementById('adminCedula');
        this.adminNombre = document.getElementById('adminNombre');
        this.adminApellido = document.getElementById('adminApellido');
        this.adminCorreo = document.getElementById('adminCorreo');
        this.adminContrasena = document.getElementById('adminContrasena');
        this.adminCamposEspecialista = document.getElementById('adminCamposEspecialista');
        this.adminEspecialidad = document.getElementById('adminEspecialidad');
        this.adminRolClinico = document.getElementById('adminRolClinico');
        this.adminCamposSecretario = document.getElementById('adminCamposSecretario');
        this.adminArea = document.getElementById('adminArea');
        this.adminRolAdmin = document.getElementById('adminRolAdmin');

        this.init();
    }

    init() {
        // 1. Control de Acceso: Validar sesión activa en cliente
        const sesionJSON = localStorage.getItem('usuarioActivo');
        if (!sesionJSON) {
            window.location.href = 'login.html';
            return;
        }

        this.usuarioActivo = JSON.parse(sesionJSON);
        this.idModificar = this.usuarioActivo.id; // Por defecto se edita a sí mismo

        // 2. Cargar barra lateral
        this.renderizarBarraLateral(this.usuarioActivo);

        // 3. Cargar formulario con datos iniciales
        this.cargarDatosFormulario(this.usuarioActivo);

        // 4. Lógica basada en Roles
        if (this.usuarioActivo.rol === 'Secretario' || this.usuarioActivo.rol === 'Recepción Dpto.') {
            // Configurar vistas de Secretario
            this.sideRol.innerText = 'Secretario';
            this.sideRol.className = 'rol-tag secretario';
            this.inputRol.value = 'Secretario';
            
            // Mostrar panel de buscador clínico
            this.panelSecretario.style.display = 'block';
            this.cargarListaPacientes();

            // Configurar eventos del buscador
            this.buscadorPaciente.addEventListener('input', () => this.filtrarPacientes());
        } else if (this.usuarioActivo.rol === 'Administrador') {
            // Configurar vistas de Administrador (NUEVO)
            this.sideRol.innerText = 'Administrador';
            this.sideRol.style.backgroundColor = '#0056b3';
            this.sideRol.style.color = 'white';
            this.inputRol.value = 'Administrador';
            
            // Ocultar edición de perfiles ajenos (solo se edita a sí mismo en el formulario base)
            this.panelSecretario.style.display = 'none';

            // Mostrar el panel de administración
            this.panelAdministrador.style.display = 'block';
            
            // Asignar eventos de rol dinámicos en alta de personal
            this.adminRol.addEventListener('change', () => this.toggleCamposAdminRegistro());
            this.adminRegForm.addEventListener('submit', (e) => this.handleAdminSubmit(e));
        } else {
            // Configurar vistas de Paciente
            this.sideRol.innerText = 'Paciente';
            this.sideRol.className = 'rol-tag paciente';
            this.inputRol.value = 'Paciente';
            
            // Cargar los datos más frescos del paciente desde la API
            this.obtenerDatosFrescos(this.usuarioActivo.id);
        }

        // 5. Enlazar eventos de validación inline para formulario común
        this.inputCorreo.addEventListener('input', () => this.validarCorreo());
        this.inputTelefono.addEventListener('input', () => this.validarTelefono());
        
        if (this.usuarioActivo.rol === 'Secretario') {
            this.inputNombre.addEventListener('input', () => this.validarCampoVacio(this.inputNombre, 'nombreFeedback'));
            this.inputApellido.addEventListener('input', () => this.validarCampoVacio(this.inputApellido, 'apellidoFeedback'));
        }

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Renderizar datos del perfil en la barra lateral
    renderizarBarraLateral(usuario) {
        this.sideAvatar.src = usuario.fotoUrl || `https://ui-avatars.com/api/?name=${usuario.nombre}+${usuario.apellido}&background=0056b3&color=fff`;
        this.sideNombre.innerText = `${usuario.nombre} ${usuario.apellido}`;
        this.sideCedula.innerText = usuario.id;
        this.sideCorreo.innerText = usuario.correo;
    }

    // Cargar los datos en los inputs del formulario
    cargarDatosFormulario(usuario) {
        this.inputID.value = usuario.id;
        this.inputRol.value = usuario.rol || 'Paciente';
        this.inputNombre.value = usuario.nombre;
        this.inputApellido.value = usuario.apellido;
        this.inputCorreo.value = usuario.correo;
        this.inputTelefono.value = usuario.telefono || '';
        this.inputFoto.value = usuario.fotoUrl || '';
        this.inputBiografia.value = usuario.biografia || '';

        // Limpiar clases de validación previas
        [this.inputCorreo, this.inputTelefono, this.inputNombre, this.inputApellido].forEach(el => {
            if (el) {
                el.classList.remove('input-success', 'input-error');
                const fb = document.getElementById(`${el.id}Feedback`);
                if (fb) fb.style.display = 'none';
            }
        });
    }

    // Obtener los datos actualizados del Backend
    obtenerDatosFrescos(id) {
        fetch(`http://localhost:3000/api/usuarios/${id}`)
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
            .catch(err => console.error("No se pudo refrescar los datos del servidor."));
    }

    // Cargar pacientes para Secretario
    cargarListaPacientes() {
        fetch('http://localhost:3000/api/usuarios/pacientes')
            .then(res => res.json())
            .then(data => {
                this.listaPacientesCache = data;
                this.renderizarPacientes(data);
            })
            .catch(err => {
                console.error(err);
                this.listaPacientes.innerHTML = '<li style="padding:15px; color:#dc3545; font-size:14px;">Error al cargar lista de pacientes.</li>';
            });
    }

    // Renderizar pacientes en el buscador
    renderizarPacientes(lista) {
        this.listaPacientes.innerHTML = '';
        if (lista.length === 0) {
            this.listaPacientes.innerHTML = '<li style="padding:15px; color:#aaa; font-size:14px;">No se encontraron pacientes.</li>';
            return;
        }

        lista.forEach(p => {
            const item = document.createElement('li');
            item.className = 'pacientes-item';
            if (String(this.idModificar) === String(p.id)) {
                item.classList.add('activo');
            }

            item.innerHTML = `
                <img src="${p.fotoUrl || 'https://ui-avatars.com/api/?name=' + p.nombre + '+' + p.apellido}" alt="Avatar">
                <div>
                    <span style="font-weight: 600; font-size: 14px; color: #333;">${p.nombre} ${p.apellido}</span><br>
                    <span style="font-size: 12px; color: #777;">ID: ${p.id} | ${p.correo}</span>
                </div>
            `;

            item.addEventListener('click', () => this.seleccionarPaciente(p));
            this.listaPacientes.appendChild(item);
        });
    }

    // Buscar y filtrar pacientes en cliente
    filtrarPacientes() {
        const query = this.buscadorPaciente.value.trim().toLowerCase();
        if (!query) {
            this.renderizarPacientes(this.listaPacientesCache);
            return;
        }

        const filtrados = this.listaPacientesCache.filter(p => 
            p.nombre.toLowerCase().includes(query) || 
            p.apellido.toLowerCase().includes(query) || 
            String(p.id).includes(query) ||
            p.correo.toLowerCase().includes(query)
        );
        this.renderizarPacientes(filtrados);
    }

    // Seleccionar paciente del buscador (Secretario)
    seleccionarPaciente(paciente) {
        this.idModificar = paciente.id;
        
        // Configurar títulos de edición
        this.tituloFormulario.innerText = `Modificar Perfil de Paciente: ${paciente.nombre} ${paciente.apellido}`;
        this.subtituloFormulario.innerText = "Modificando datos de contacto en rol de Secretario.";
        
        // Habilitar campos Nombre y Apellido (Remover readonly para Secretario)
        this.inputNombre.readOnly = false;
        this.inputNombre.classList.remove('input-disabled');
        this.inputApellido.readOnly = false;
        this.inputApellido.classList.remove('input-disabled');

        // Cargar datos
        this.cargarDatosFormulario(paciente);

        // Actualizar item activo en lista
        const items = this.listaPacientes.querySelectorAll('.pacientes-item');
        items.forEach(it => it.classList.remove('activo'));
        
        // Volver a renderizar para marcar activo correcto
        this.filtrarPacientes();
    }

    // Mostrar/ocultar campos dinámicos en el alta de personal del Administrador
    toggleCamposAdminRegistro() {
        const rol = this.adminRol.value;

        if (rol === 'Especialista') {
            this.adminCamposEspecialista.style.display = 'grid';
            this.adminCamposSecretario.style.display = 'none';
            this.adminEspecialidad.required = true;
        } else if (rol === 'Secretario') {
            this.adminCamposSecretario.style.display = 'grid';
            this.adminCamposEspecialista.style.display = 'none';
            this.adminArea.required = true;
        } else {
            this.adminCamposEspecialista.style.display = 'none';
            this.adminCamposSecretario.style.display = 'none';
            this.adminEspecialidad.required = false;
            this.adminArea.required = false;
        }
    }

    // Procesar alta de personal (Submit del Administrador)
    handleAdminSubmit(e) {
        e.preventDefault();

        // Validaciones del alta administrativa
        const rol = this.adminRol.value;
        const cedula = this.adminCedula.value.trim();
        const nombre = this.adminNombre.value.trim();
        const apellido = this.adminApellido.value.trim();
        const correo = this.adminCorreo.value.trim();
        const contrasena = this.adminContrasena.value;

        if (!rol || !cedula || !nombre || !apellido || !correo || !contrasena) {
            this.mostrarToast("Por favor complete todos los campos obligatorios del alta.", true);
            return;
        }

        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(correo)) {
            this.mostrarToast("Formato de correo inválido para el nuevo usuario.", true);
            return;
        }

        const regexCedula = /^\d{8,}$/;
        if (!regexCedula.test(cedula)) {
            this.mostrarToast("La cédula/ID debe contener únicamente números y tener al menos 8 dígitos.", true);
            return;
        }

        const payload = {
            creadorId: this.usuarioActivo.id,
            creadorRol: 'Administrador',
            id: cedula,
            nombre: nombre,
            apellido: apellido,
            correo: correo,
            contrasena: contrasena,
            rol: rol
        };

        if (rol === 'Especialista') {
            const espec = this.adminEspecialidad.value;
            if (!espec) {
                this.mostrarToast("Debe asignar una especialidad para el doctor.", true);
                return;
            }
            payload.especialidad = espec;
            payload.rolDetalle = this.adminRolClinico.value.trim();
        } else if (rol === 'Secretario') {
            const area = this.adminArea.value;
            if (!area) {
                this.mostrarToast("Debe asignar un área para el secretario.", true);
                return;
            }
            payload.areaAsignada = area;
            payload.rolDetalle = this.adminRolAdmin.value.trim();
        }

        this.loader.style.display = 'inline-block';
        const btnReg = document.getElementById('btnAdminRegistrar');
        btnReg.disabled = true;

        fetch('http://localhost:3000/api/usuarios/registro-personal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(res => {
            this.loader.style.display = 'none';
            btnReg.disabled = false;
            return res.json().then(data => ({ status: res.status, body: data }));
        })
        .then(result => {
            if (result.status === 201) {
                this.mostrarToast(result.body.mensaje || "Personal registrado con éxito.");
                this.adminRegForm.reset();
                this.toggleCamposAdminRegistro();
            } else {
                this.mostrarToast(result.body.error || "Ocurrió un error al registrar.", true);
            }
        })
        .catch(err => {
            this.loader.style.display = 'none';
            btnReg.disabled = false;
            console.error(err);
            this.mostrarToast("Error de conexión al dar de alta el personal.", true);
        });
    }

    // Validaciones inline
    validarCorreo() {
        const val = this.inputCorreo.value.trim();
        const fb = document.getElementById('correoFeedback');
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!val) {
            this.marcarInvalido(this.inputCorreo, fb, "El correo electrónico es obligatorio.");
            return false;
        } else if (!regex.test(val)) {
            this.marcarInvalido(this.inputCorreo, fb, "Formato de correo inválido (ejemplo@correo.com).");
            return false;
        } else {
            this.marcarValido(this.inputCorreo, fb);
            return true;
        }
    }

    validarTelefono() {
        const val = this.inputTelefono.value.trim();
        const fb = document.getElementById('telefonoFeedback');
        const regex = /^\d{7,15}$/;

        if (val) {
            const limpio = val.replace(/[\s-+()]/g, '');
            if (!regex.test(limpio)) {
                this.marcarInvalido(this.inputTelefono, fb, "El teléfono debe contener entre 7 y 15 dígitos numéricos.");
                return false;
            }
        }
        this.marcarValido(this.inputTelefono, fb);
        return true;
    }

    validarCampoVacio(input, feedbackId) {
        const fb = document.getElementById(feedbackId);
        if (!input.value.trim()) {
            this.marcarInvalido(input, fb, "Este campo es requerido.");
            return false;
        }
        this.marcarValido(input, fb);
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

        setTimeout(() => {
            this.toast.style.display = 'none';
        }, 5000);
    }

    // Guardar cambios (PUT)
    handleSubmit(e) {
        e.preventDefault();

        // Validar
        const esCorreoVal = this.validarCorreo();
        const esTelfVal = this.validarTelefono();
        let esNombreVal = true;
        let esApellidoVal = true;

        if (this.usuarioActivo.rol === 'Secretario' && String(this.idModificar) !== String(this.usuarioActivo.id)) {
            esNombreVal = this.validarCampoVacio(this.inputNombre, 'nombreFeedback');
            esApellidoVal = this.validarCampoVacio(this.inputApellido, 'apellidoFeedback');
        }

        if (!esCorreoVal || !esTelfVal || !esNombreVal || !esApellidoVal) {
            this.mostrarToast("Corrija los campos marcados en rojo antes de guardar.", true);
            return;
        }

        this.loader.style.display = 'inline-block';
        this.btnGuardar.disabled = true;

        // Construir Payload
        const payload = {
            modificadoPor: this.usuarioActivo.id,
            rolModificadoPor: this.usuarioActivo.rol === 'Secretario' || this.usuarioActivo.rol === 'Recepción Dpto.' ? 'Secretario' : (this.usuarioActivo.rol === 'Administrador' ? 'Administrador' : 'Paciente'),
            correo: this.inputCorreo.value.trim(),
            telefono: this.inputTelefono.value.trim(),
            fotoUrl: this.inputFoto.value.trim(),
            biografia: this.inputBiografia.value.trim()
        };

        // Si es secretario o admin modificando paciente, adjunta nombres
        if (payload.rolModificadoPor === 'Secretario' || payload.rolModificadoPor === 'Administrador') {
            payload.nombre = this.inputNombre.value.trim();
            payload.apellido = this.inputApellido.value.trim();
        }

        fetch(`http://localhost:3000/api/usuarios/${this.idModificar}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(res => {
            this.loader.style.display = 'none';
            this.btnGuardar.disabled = false;
            return res.json().then(data => ({ status: res.status, body: data }));
        })
        .then(result => {
            if (result.status === 200) {
                this.mostrarToast(result.body.mensaje || "Datos de contacto actualizados de forma inmediata.");
                
                // Si el usuario se modificó a sí mismo, actualizar barra lateral y localStorage
                if (String(this.idModificar) === String(this.usuarioActivo.id)) {
                    this.usuarioActivo = result.body.usuario;
                    localStorage.setItem('usuarioActivo', JSON.stringify(this.usuarioActivo));
                    this.renderizarBarraLateral(this.usuarioActivo);
                    this.cargarDatosFormulario(this.usuarioActivo);
                } else {
                    // Si el Secretario modificó a un paciente, recargar lista del buscador
                    this.cargarListaPacientes();
                }
            } else {
                this.mostrarToast(result.body.error || "Ocurrió un error al actualizar.", true);
            }
        })
        .catch(err => {
            this.loader.style.display = 'none';
            this.btnGuardar.disabled = false;
            console.error(err);
            this.mostrarToast("No se pudo conectar con el servidor para guardar los cambios.", true);
        });
    }

    cerrarSesion() {
        localStorage.removeItem('usuarioActivo');
        window.location.href = 'login.html';
    }
}

// Instanciar
const perfilView = new PerfilView();
