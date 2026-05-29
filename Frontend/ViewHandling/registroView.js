class RegistroView {
    constructor() {
        this.form = document.getElementById('registroForm');
        this.cedula = document.getElementById('cedula');
        this.nombre = document.getElementById('nombre');
        this.apellido = document.getElementById('apellido');
        this.correo = document.getElementById('correo');
        this.contrasena = document.getElementById('contrasena');
        this.loader = document.getElementById('loader');
        this.exitoModal = document.getElementById('exitoModal');
        this.tiempoDesempeño = document.getElementById('tiempoDesempeño');
        this.toast = document.getElementById('toast');

        this.init();
    }

    init() {
        // Enlazar eventos de validación en tiempo real (inline validations)
        this.cedula.addEventListener('input', () => this.validarCedula());
        this.nombre.addEventListener('input', () => this.validarCampoVacio(this.nombre, 'nombreFeedback', 'El nombre es obligatorio.'));
        this.apellido.addEventListener('input', () => this.validarCampoVacio(this.apellido, 'apellidoFeedback', 'El apellido es obligatorio.'));
        this.correo.addEventListener('input', () => this.validarCorreo());
        this.contrasena.addEventListener('input', () => this.validarCampoVacio(this.contrasena, 'contrasenaFeedback', 'La contraseña es obligatoria y debe ser segura (mínimo 4 caracteres).', 4));

        // Enlazar evento de envío del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Validación Cédula
    validarCedula() {
        const valor = this.cedula.value.trim();
        const feedback = document.getElementById('cedulaFeedback');
        const regex = /^\d{8,}$/;

        if (!valor) {
            this.marcarInvalido(this.cedula, feedback, 'La cédula/ID es obligatoria.');
            return false;
        } else if (!/^\d+$/.test(valor)) {
            this.marcarInvalido(this.cedula, feedback, 'La cédula/ID debe contener únicamente números.');
            return false;
        } else if (!regex.test(valor)) {
            this.marcarInvalido(this.cedula, feedback, 'La cédula/ID debe tener al menos 8 dígitos.');
            return false;
        } else {
            this.marcarValido(this.cedula, feedback, 'Cédula con formato válido.');
            return true;
        }
    }

    // Validación Genérica Vacio / Mínima longitud
    validarCampoVacio(input, feedbackId, mensajeError, minLength = 1) {
        const valor = input.value.trim();
        const feedback = document.getElementById(feedbackId);

        if (!valor) {
            this.marcarInvalido(input, feedback, mensajeError);
            return false;
        } else if (valor.length < minLength) {
            this.marcarInvalido(input, feedback, `Debe ingresar al menos ${minLength} caracteres.`);
            return false;
        } else {
            this.marcarValido(input, feedback);
            return true;
        }
    }

    // Validación Correo Electrónico
    validarCorreo() {
        const valor = this.correo.value.trim();
        const feedback = document.getElementById('correoFeedback');
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!valor) {
            this.marcarInvalido(this.correo, feedback, 'El correo electrónico es obligatorio.');
            return false;
        } else if (!regex.test(valor)) {
            this.marcarInvalido(this.correo, feedback, 'Ingrese un formato de correo electrónico válido (ej. usuario@dominio.com).');
            return false;
        } else {
            this.marcarValido(this.correo, feedback, 'Correo con formato válido.');
            return true;
        }
    }

    // Helpers visuales
    marcarInvalido(input, feedback, mensaje) {
        input.classList.remove('input-success');
        input.classList.add('input-error');
        feedback.innerText = mensaje;
        feedback.className = 'feedback error';
    }

    marcarValido(input, feedback, mensaje = 'Válido') {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        feedback.innerText = mensaje;
        feedback.className = 'feedback success';
    }

    // Mostrar Toast flotante de error
    mostrarToast(mensaje, esError = true) {
        this.toast.innerText = mensaje;
        this.toast.className = esError ? 'toast-notificacion error' : 'toast-notificacion';
        this.toast.style.display = 'flex';

        setTimeout(() => {
            this.toast.style.display = 'none';
        }, 5000);
    }

    // Procesar Envío
    handleSubmit(e) {
        e.preventDefault();

        // Ejecutar todas las validaciones
        const esCedulaValida = this.validarCedula();
        const esNombreValido = this.validarCampoVacio(this.nombre, 'nombreFeedback', 'El nombre es obligatorio.');
        const esApellidoValido = this.validarCampoVacio(this.apellido, 'apellidoFeedback', 'El apellido es obligatorio.');
        const esCorreoValido = this.validarCorreo();
        const esContraValida = this.validarCampoVacio(this.contrasena, 'contrasenaFeedback', 'La contraseña es obligatoria.', 4);

        if (!esCedulaValida || !esNombreValido || !esApellidoValido || !esCorreoValido || !esContraValida) {
            this.mostrarToast("Por favor corrija los campos marcados en rojo antes de continuar.");
            
            // Focusear el primer campo inválido
            if (!esCedulaValida) this.cedula.focus();
            else if (!esNombreValido) this.nombre.focus();
            else if (!esApellidoValido) this.apellido.focus();
            else if (!esCorreoValido) this.correo.focus();
            else if (!esContraValida) this.contrasena.focus();
            
            return;
        }

        // Si es válido, enviar
        this.loader.style.display = 'inline-block';
        const btn = document.getElementById('btnRegistrarse');
        btn.disabled = true;

        const datos = {
            id: this.cedula.value.trim(),
            nombre: this.nombre.value.trim(),
            apellido: this.apellido.value.trim(),
            correo: this.correo.value.trim().toLowerCase(),
            contrasena: this.contrasena.value
        };

        const tInicio = Date.now();

        fetch('http://localhost:3000/api/auth/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(res => {
            this.loader.style.display = 'none';
            btn.disabled = false;
            return res.json().then(data => ({ status: res.status, body: data }));
        })
        .then(result => {
            const tFin = Date.now();
            const tiempoMs = tFin - tInicio;
            
            if (result.status === 201) {
                // Registro Exitoso
                this.tiempoDesempeño.innerText = `${(tiempoMs / 1000).toFixed(2)} segundos`;
                this.exitoModal.style.display = 'flex';
                this.form.reset();
                
                // Limpiar clases de éxito
                [this.cedula, this.nombre, this.apellido, this.correo, this.contrasena].forEach(el => {
                    el.classList.remove('input-success');
                    const feedback = document.getElementById(`${el.id}Feedback`);
                    if (feedback) feedback.style.display = 'none';
                });
            } else {
                // Error devuelto por Backend (Duplicado, etc.)
                this.mostrarToast(result.body.error || "Ocurrió un error inesperado al registrar.");
                
                if (result.body.error && result.body.error.includes("correo")) {
                    this.marcarInvalido(this.correo, document.getElementById('correoFeedback'), result.body.error);
                    this.correo.focus();
                } else if (result.body.error && result.body.error.includes("cédula")) {
                    this.marcarInvalido(this.cedula, document.getElementById('cedulaFeedback'), result.body.error);
                    this.cedula.focus();
                }
            }
        })
        .catch(err => {
            this.loader.style.display = 'none';
            btn.disabled = false;
            console.error(err);
            this.mostrarToast("No se pudo establecer conexión con el servidor de la clínica. ¿Está encendido?");
        });
    }
}

// Instanciamos a nivel global para que el script corra automáticamente
const registroView = new RegistroView();
