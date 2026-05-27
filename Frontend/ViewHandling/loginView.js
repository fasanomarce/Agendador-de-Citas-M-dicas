class LoginView {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.correo = document.getElementById('correo');
        this.contrasena = document.getElementById('contrasena');
        this.loader = document.getElementById('loader');
        this.toast = document.getElementById('toast');

        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    mostrarToast(mensaje) {
        this.toast.innerText = mensaje;
        this.toast.style.display = 'flex';

        setTimeout(() => {
            this.toast.style.display = 'none';
        }, 5000);
    }

    handleSubmit(e) {
        e.preventDefault();

        const correoVal = this.correo.value.trim();
        const contraVal = this.contrasena.value;

        if (!correoVal || !contraVal) {
            this.mostrarToast("Por favor complete todos los campos.");
            return;
        }

        this.loader.style.display = 'inline-block';
        const btn = document.getElementById('btnIngresar');
        btn.disabled = true;

        fetch('http://localhost:3000/api/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo: correoVal, contrasena: contraVal })
        })
        .then(res => {
            this.loader.style.display = 'none';
            btn.disabled = false;
            return res.json().then(data => ({ status: res.status, body: data }));
        })
        .then(result => {
            if (result.status === 200) {
                // Almacenar sesión en localStorage
                localStorage.setItem('usuarioActivo', JSON.stringify(result.body));
                
                // Redirigir al Menú Principal de Especialidades
                window.location.href = 'MenuCitas.html';
            } else {
                this.mostrarToast(result.body.error || "Credenciales incorrectas.");
            }
        })
        .catch(err => {
            this.loader.style.display = 'none';
            btn.disabled = false;
            console.error(err);
            this.mostrarToast("No se pudo conectar con el servidor de la clínica. ¿Está encendido?");
        });
    }
}

const loginView = new LoginView();
