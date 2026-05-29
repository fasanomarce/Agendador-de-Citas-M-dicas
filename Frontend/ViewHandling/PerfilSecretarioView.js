class PerfilSecretarioView {
    constructor() {
        this.usuario = exigirSesion();
        if (!this.usuario) return;
        if (this.usuario.rol !== 'Secretario') {
            window.location.replace(perfilUrlPorRol(this.usuario.rol));
            return;
        }

        this.idModificar = null;
        this.cachePacientes = [];
        this.toast = document.getElementById('toast');
        this.init();
    }

    init() {
        document.getElementById('sideAvatar').src = this.usuario.fotoUrl || '';
        document.getElementById('sideNombre').innerText = `${this.usuario.nombre} ${this.usuario.apellido}`;
        document.getElementById('sideArea').innerText = this.usuario.areaAsignada || '';

        document.getElementById('btnCerrarSesion').addEventListener('click', () => {
            localStorage.removeItem('usuarioActivo');
            window.location.href = 'login.html';
        });

        document.getElementById('buscadorPaciente').addEventListener('input', () => this.filtrar());
        document.getElementById('perfilForm').addEventListener('submit', (e) => this.guardarPaciente(e));
        document.getElementById('bloquesForm').addEventListener('submit', (e) => this.asignarBloque(e));

        this.cargarPacientes();
    }

    cargarPacientes() {
        fetch(`${API_BASE}/secretarios/pacientes`)
            .then(res => res.json())
            .then(data => {
                this.cachePacientes = data;
                this.renderLista(data);
            });
    }

    renderLista(lista) {
        const ul = document.getElementById('listaPacientes');
        ul.innerHTML = '';
        if (!lista.length) {
            ul.innerHTML = '<li style="padding:15px;color:#aaa;">Sin resultados.</li>';
            return;
        }
        lista.forEach(p => {
            const li = document.createElement('li');
            li.className = 'pacientes-item';
            if (String(this.idModificar) === String(p.id)) li.classList.add('activo');
            li.innerHTML = `<strong>${p.nombre} ${p.apellido}</strong> — ID ${p.id}`;
            li.addEventListener('click', () => this.seleccionar(p));
            ul.appendChild(li);
        });
    }

    filtrar() {
        const q = document.getElementById('buscadorPaciente').value.trim().toLowerCase();
        if (!q) return this.renderLista(this.cachePacientes);
        const filtrados = this.cachePacientes.filter(p =>
            p.nombre.toLowerCase().includes(q) ||
            p.apellido.toLowerCase().includes(q) ||
            String(p.id).includes(q)
        );
        this.renderLista(filtrados);
    }

    seleccionar(p) {
        this.idModificar = p.id;
        document.getElementById('tituloFormulario').innerText = `Editando: ${p.nombre} ${p.apellido}`;
        document.getElementById('inputNombre').value = p.nombre;
        document.getElementById('inputApellido').value = p.apellido;
        document.getElementById('inputCorreo').value = p.correo;
        document.getElementById('inputTelefono').value = p.telefono || '';
        document.getElementById('inputBiografia').value = p.biografia || '';
        this.filtrar();
    }

    guardarPaciente(e) {
        e.preventDefault();
        if (!this.idModificar) {
            mostrarToast(this.toast, 'Seleccione un paciente de la lista.', true);
            return;
        }

        const payload = {
            modificadoPor: this.usuario.id,
            rolModificadoPor: 'Secretario',
            nombre: document.getElementById('inputNombre').value.trim(),
            apellido: document.getElementById('inputApellido').value.trim(),
            correo: document.getElementById('inputCorreo').value.trim(),
            telefono: document.getElementById('inputTelefono').value.trim(),
            biografia: document.getElementById('inputBiografia').value.trim()
        };

        fetch(`${API_BASE}/secretarios/pacientes/${this.idModificar}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json().then(body => ({ status: res.status, body })))
            .then(({ status, body }) => {
                if (status === 200) {
                    mostrarToast(this.toast, body.mensaje);
                    this.cargarPacientes();
                } else {
                    mostrarToast(this.toast, body.error || 'Error al guardar.', true);
                }
            })
            .catch(() => mostrarToast(this.toast, 'Error de conexión.', true));
    }

    asignarBloque(e) {
        e.preventDefault();
        const payload = {
            rolModificadoPor: 'Secretario',
            especialidad: document.getElementById('bloqueEspecialidad').value,
            especialistaId: document.getElementById('bloqueEspecialistaId').value,
            bloques: [{
                dia: document.getElementById('bloqueDia').value.trim(),
                horaInicio: document.getElementById('bloqueInicio').value,
                horaFin: document.getElementById('bloqueFin').value
            }]
        };

        fetch(`${API_BASE}/secretarios/bloques-horarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json().then(body => ({ status: res.status, body })))
            .then(({ status, body }) => {
                if (status === 200) {
                    mostrarToast(this.toast, body.mensaje);
                    e.target.reset();
                } else {
                    mostrarToast(this.toast, body.error || 'No se pudo asignar el bloque.', true);
                }
            })
            .catch(() => mostrarToast(this.toast, 'Error de conexión.', true));
    }
}

new PerfilSecretarioView();
