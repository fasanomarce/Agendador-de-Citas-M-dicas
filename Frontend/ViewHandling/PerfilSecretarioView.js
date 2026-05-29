const API_BASE = 'http://localhost:3000/api';

class PerfilSecretarioView {
    constructor() {
        this.usuarioActivo = null;
        this.idModificar = null;
        this.pacientesCache = [];
        this.init();
    }

    init() {
        const sesion = localStorage.getItem('usuarioActivo');
        if (!sesion) {
            window.location.href = 'login.html';
            return;
        }
        this.usuarioActivo = JSON.parse(sesion);
        if (!esSecretario(this.usuarioActivo)) {
            window.location.href = destinoInicioSesion(this.usuarioActivo);
            return;
        }

        document.getElementById('buscadorPaciente').addEventListener('input', () => this.filtrarPacientes());
        document.getElementById('formPaciente').addEventListener('submit', (e) => this.guardarPaciente(e));
        document.getElementById('formBloque').addEventListener('submit', (e) => this.asignarBloque(e));
        document.getElementById('selectEspecialista').addEventListener('change', (e) => {
            const opt = e.target.selectedOptions[0];
            if (opt && opt.dataset.especialidad) {
                document.getElementById('bloqueEspecialidad').value = opt.dataset.especialidad;
            }
        });

        this.cargarPacientes();
        this.cargarCitas();
        this.cargarEspecialistas();
        this.cargarBloques();
    }

    mostrarToast(msg, error = false) {
        const t = document.getElementById('toast');
        t.innerText = msg;
        t.className = error ? 'toast-notificacion error' : 'toast-notificacion';
        t.style.display = 'block';
        setTimeout(() => { t.style.display = 'none'; }, 5000);
    }

    cargarPacientes() {
        fetch(`${API_BASE}/secretario/pacientes`)
            .then(res => res.json())
            .then(data => {
                this.pacientesCache = data;
                this.renderPacientes(data);
            });
    }

    renderPacientes(lista) {
        const ul = document.getElementById('listaPacientes');
        ul.innerHTML = '';
        lista.forEach(p => {
            const li = document.createElement('li');
            li.className = 'pacientes-item' + (String(this.idModificar) === String(p.id) ? ' activo' : '');
            li.innerText = `${p.nombre} ${p.apellido} — ID ${p.id}`;
            li.addEventListener('click', () => this.seleccionarPaciente(p));
            ul.appendChild(li);
        });
    }

    filtrarPacientes() {
        const q = document.getElementById('buscadorPaciente').value.trim().toLowerCase();
        if (!q) return this.renderPacientes(this.pacientesCache);
        const f = this.pacientesCache.filter(p =>
            p.nombre.toLowerCase().includes(q) ||
            p.apellido.toLowerCase().includes(q) ||
            String(p.id).includes(q)
        );
        this.renderPacientes(f);
    }

    seleccionarPaciente(p) {
        this.idModificar = p.id;
        document.getElementById('tituloEdicion').innerText = `Editando: ${p.nombre} ${p.apellido}`;
        document.getElementById('inputNombre').value = p.nombre;
        document.getElementById('inputApellido').value = p.apellido;
        document.getElementById('inputCorreo').value = p.correo;
        document.getElementById('inputTelefono').value = p.telefono || '';
        document.getElementById('inputBiografia').value = p.biografia || '';
        this.filtrarPacientes();
    }

    guardarPaciente(e) {
        e.preventDefault();
        if (!this.idModificar) {
            this.mostrarToast('Seleccione un paciente primero.', true);
            return;
        }
        const payload = {
            modificadoPor: this.usuarioActivo.id,
            rolModificadoPor: 'Secretario',
            nombre: document.getElementById('inputNombre').value.trim(),
            apellido: document.getElementById('inputApellido').value.trim(),
            correo: document.getElementById('inputCorreo').value.trim(),
            telefono: document.getElementById('inputTelefono').value.trim(),
            biografia: document.getElementById('inputBiografia').value.trim()
        };

        fetch(`${API_BASE}/secretario/pacientes/${this.idModificar}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json().then(b => ({ status: res.status, body: b })))
            .then(r => {
                if (r.status === 200) {
                    this.mostrarToast(r.body.mensaje);
                    this.cargarPacientes();
                } else {
                    this.mostrarToast(r.body.error || 'Error.', true);
                }
            });
    }

    cargarCitas() {
        fetch(`${API_BASE}/secretario/citas`)
            .then(res => res.json())
            .then(citas => {
                const cont = document.getElementById('listaCitas');
                cont.innerHTML = '';
                citas.forEach(c => {
                    const div = document.createElement('div');
                    div.className = 'cita-card';
                    div.innerHTML = `
                        <p><strong>${c.nombre} ${c.apellido}</strong> — ${c.doctor}</p>
                        <p>${c.fecha} ${c.hora} | Estado: ${c.estado || 'pendiente'}</p>
                        <label>Fecha <input type="date" class="cita-fecha" value="${c.fecha}"></label>
                        <label>Hora <input type="time" class="cita-hora" value="${c.hora}"></label>
                        <button type="button" class="btn-guardar-cita">Guardar cambios</button>
                    `;
                    div.querySelector('.btn-guardar-cita').addEventListener('click', () => {
                        const fecha = div.querySelector('.cita-fecha').value;
                        const hora = div.querySelector('.cita-hora').value;
                        this.actualizarCita(c.id, fecha, hora);
                    });
                    cont.appendChild(div);
                });
            });
    }

    actualizarCita(id, fecha, hora) {
        fetch(`${API_BASE}/secretario/citas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                modificadoPor: this.usuarioActivo.id,
                rolModificadoPor: 'Secretario',
                fecha,
                hora
            })
        })
            .then(res => res.json().then(b => ({ status: res.status, body: b })))
            .then(r => {
                if (r.status === 200) {
                    this.mostrarToast('Cita actualizada.');
                    this.cargarCitas();
                } else {
                    this.mostrarToast(r.body.error || 'Error.', true);
                }
            });
    }

    cargarEspecialistas() {
        fetch(`${API_BASE}/secretario/especialistas`)
            .then(res => res.json())
            .then(lista => {
                const sel = document.getElementById('selectEspecialista');
                sel.innerHTML = '<option value="">Seleccione médico...</option>';
                lista.forEach(e => {
                    const opt = document.createElement('option');
                    opt.value = e.id;
                    opt.dataset.especialidad = e.especialidad;
                    opt.innerText = `Dr/a. ${e.nombre} ${e.apellido} (${e.especialidad})`;
                    sel.appendChild(opt);
                });
            });
    }

    asignarBloque(e) {
        e.preventDefault();
        const payload = {
            modificadoPor: this.usuarioActivo.id,
            rolModificadoPor: 'Secretario',
            especialistaId: document.getElementById('selectEspecialista').value,
            especialidad: document.getElementById('bloqueEspecialidad').value,
            fecha: document.getElementById('bloqueFecha').value,
            horaInicio: document.getElementById('bloqueInicio').value,
            horaFin: document.getElementById('bloqueFin').value
        };

        fetch(`${API_BASE}/secretario/bloques`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json().then(b => ({ status: res.status, body: b })))
            .then(r => {
                if (r.status === 201) {
                    this.mostrarToast(r.body.mensaje);
                    document.getElementById('formBloque').reset();
                    this.cargarBloques();
                } else {
                    this.mostrarToast(r.body.error || 'Error.', true);
                }
            });
    }

    cargarBloques() {
        fetch(`${API_BASE}/secretario/bloques`)
            .then(res => res.json())
            .then(bloques => {
                const ul = document.getElementById('listaBloques');
                ul.innerHTML = bloques.map(b =>
                    `<li style="padding:8px 0;border-bottom:1px solid #eee">${b.especialistaNombre} — ${b.especialidad} | ${b.fecha} ${b.horaInicio}-${b.horaFin}</li>`
                ).join('') || '<li>Sin bloques asignados.</li>';
            });
    }

    cerrarSesion() {
        localStorage.removeItem('usuarioActivo');
        window.location.href = 'login.html';
    }
}

const perfilSecretarioView = new PerfilSecretarioView();
