const API_BASE = 'http://localhost:3000/api';

class CitaView {
    constructor() {
        this.especialidad = null;
        this.doctoresPermitidos = [];
        this.horariosEspecialista = [];
        this.especialistaIdSeleccionado = null;

        this.nombresDiaSemana = [
            'domingo',
            'lunes',
            'martes',
            'miercoles',
            'jueves',
            'viernes',
            'sabado'
        ];

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            this.especialidad = urlParams.get('especialidad');

            if (!this.especialidad) {
                alert('Debe seleccionar un área médica desde el menú principal antes de agendar una cita.');
                window.location.href = 'MenuCitas.html';
                return;
            }

            this.inicializarSelectHoras();
            this.mostrarAreaSeleccionada();
            this.configurarFecha();
            this.asignarEventos();
            this.cargarEspecialistasDelArea();
            this.prellenarUsuarioSesion();
        });
    }

    inicializarSelectHoras() {
        const selectHora = document.getElementById('hora');
        if (!selectHora) return;

        selectHora.innerHTML = '<option value="">Seleccione un especialista primero...</option>';
        selectHora.disabled = true;
        selectHora.required = false;
    }

    mostrarAreaSeleccionada() {
        const titulo = document.getElementById('tituloArea');
        const hidden = document.getElementById('especialidad');
        if (titulo) titulo.innerText = `Área seleccionada: ${this.especialidad}`;
        if (hidden) hidden.value = this.especialidad;

        const legendPaso2 = document.querySelector('#paso2 legend');
        if (legendPaso2) {
            legendPaso2.innerText = `Paso 2: Especialistas de ${this.especialidad}`;
        }
    }

    prellenarUsuarioSesion() {
        const sesionJSON = localStorage.getItem('usuarioActivo');
        if (!sesionJSON) return;

        const usuario = JSON.parse(sesionJSON);
        const inputNombre = document.getElementById('nombre');
        const inputApellido = document.getElementById('apellido');

        if (inputNombre && usuario.nombre) inputNombre.value = usuario.nombre;
        if (inputApellido && usuario.apellido) inputApellido.value = usuario.apellido;
    }

    cargarEspecialistasDelArea() {
        const selectDoctor = document.getElementById('doctor');
        if (!selectDoctor) return;

        selectDoctor.disabled = true;
        selectDoctor.innerHTML = '<option value="">Cargando especialistas...</option>';

        fetch(`${API_BASE}/especialidades/${encodeURIComponent(this.especialidad)}`)
            .then(res => {
                if (!res.ok) throw new Error('Área no disponible');
                return res.json();
            })
            .then(datos => {
                const doctores = datos.doctores || [];
                this.doctoresPermitidos = doctores.map(doc => ({
                    id: String(doc.id),
                    etiqueta: `Dr/a. ${doc.nombre} ${doc.apellido}`
                }));

                selectDoctor.innerHTML = '<option value="">Seleccione un especialista...</option>';

                if (this.doctoresPermitidos.length === 0) {
                    selectDoctor.innerHTML = '<option value="">No hay especialistas en esta área</option>';
                    selectDoctor.disabled = true;
                    alert(`No hay especialistas disponibles en ${this.especialidad}. Elija otra área desde el menú.`);
                    return;
                }

                this.doctoresPermitidos.forEach(doc => {
                    const opt = document.createElement('option');
                    opt.value = doc.id;
                    opt.textContent = doc.etiqueta;
                    selectDoctor.appendChild(opt);
                });

                selectDoctor.disabled = false;
            })
            .catch(err => {
                console.error(err);
                selectDoctor.innerHTML = '<option value="">Error al cargar especialistas</option>';
                alert('No se pudo cargar los especialistas del área. Vuelva al menú e intente de nuevo.');
            });
    }

    asignarEventos() {
        const btnContinuar1 = document.getElementById('btnContinuar1');
        const btnContinuar2 = document.getElementById('btnContinuar2');
        const btnSalir = document.getElementById('btnSalir');
        const form = document.getElementById('registroCitaForm');
        const selectDoctor = document.getElementById('doctor');

        if (btnContinuar1) btnContinuar1.addEventListener('click', () => this.irAlPaso(2));
        if (btnContinuar2) btnContinuar2.addEventListener('click', () => this.irAlPaso(3));
        if (btnSalir) btnSalir.addEventListener('click', () => this.cancelarProceso());
        if (form) form.addEventListener('submit', this.guardarReservacion.bind(this));

        if (selectDoctor) {
            selectDoctor.addEventListener('change', () => this.onEspecialistaChange());
        }
    }

    onEspecialistaChange() {
        const selectDoctor = document.getElementById('doctor');
        const especialistaId = selectDoctor ? selectDoctor.value : '';

        this.horariosEspecialista = [];
        this.especialistaIdSeleccionado = especialistaId || null;

        if (!especialistaId) {
            this.inicializarSelectHoras();
            this.ocultarMensajeDisponibilidad();
            return;
        }

        fetch(`${API_BASE}/horarios/${especialistaId}`)
            .then(res => {
                if (!res.ok) throw new Error('No se pudieron obtener los horarios del especialista');
                return res.json();
            })
            .then(horarios => {
                this.horariosEspecialista = Array.isArray(horarios) ? horarios : [];
                this.actualizarSelectHoras();
            })
            .catch(err => {
                console.error('[CitaView] Error al cargar horarios:', err);
                this.horariosEspecialista = [];
                this.mostrarSinDisponibilidad('No se pudieron cargar los horarios del especialista.');
            });
    }

    configurarFecha() {
        const inputFecha = document.getElementById('fecha');
        if (!inputFecha) return;

        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 1);

        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        inputFecha.min = `${anio}-${mes}-${dia}`;

        inputFecha.addEventListener('change', (e) => {
            const valorFecha = e.target.value;
            if (!valorFecha) {
                this.actualizarSelectHoras();
                return;
            }

            const fechaElegida = new Date(`${valorFecha}T12:00:00`);
            const diaSemana = fechaElegida.getDay();

            if (diaSemana === 0 || diaSemana === 6) {
                alert('Lo sentimos, no atendemos los fines de semana. Por favor elija de lunes a viernes.');
                e.target.value = '';
                this.actualizarSelectHoras();
                return;
            }

            this.actualizarSelectHoras();
        });
    }

    convertirHoraAMinutos(hora) {
        if (!hora || typeof hora !== 'string') return NaN;
        const partes = hora.split(':');
        if (partes.length < 2) return NaN;
        const horas = Number(partes[0]);
        const minutos = Number(partes[1]);
        if (Number.isNaN(horas) || Number.isNaN(minutos)) return NaN;
        return horas * 60 + minutos;
    }

    minutosAHora(minutos) {
        if (typeof minutos !== 'number' || Number.isNaN(minutos)) return '';
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    obtenerMinutosDesdeBloque(bloque, extremo) {
        if (extremo === 'inicio') {
            if (typeof bloque.inicioMinutos === 'number') return bloque.inicioMinutos;
            return this.convertirHoraAMinutos(bloque.horaInicio);
        }
        if (typeof bloque.finMinutos === 'number') return bloque.finMinutos;
        return this.convertirHoraAMinutos(bloque.horaFin);
    }

    obtenerDiaSemanaDesdeFecha(fechaStr) {
        if (!fechaStr) return '';
        const fecha = new Date(`${fechaStr}T12:00:00`);
        return this.nombresDiaSemana[fecha.getDay()] || '';
    }

    formatearEtiquetaBloque(bloque) {
        const inicioMin = this.obtenerMinutosDesdeBloque(bloque, 'inicio');
        const finMin = this.obtenerMinutosDesdeBloque(bloque, 'fin');

        const horaInicio = bloque.horaInicio || this.minutosAHora(inicioMin);
        const horaFin = bloque.horaFin || this.minutosAHora(finMin);

        return `${horaInicio} – ${horaFin}`;
    }

    obtenerBloquesParaFecha(fechaStr) {
        const diaSemana = this.obtenerDiaSemanaDesdeFecha(fechaStr);
        if (!diaSemana) return [];

        return this.horariosEspecialista
            .filter(bloque => (bloque.diaSemana || '').toLowerCase() === diaSemana)
            .sort((a, b) => {
                const inicioA = this.obtenerMinutosDesdeBloque(a, 'inicio');
                const inicioB = this.obtenerMinutosDesdeBloque(b, 'inicio');
                return inicioA - inicioB;
            });
    }

    mostrarMensajeDisponibilidad(texto) {
        const mensaje = document.getElementById('mensajeDisponibilidadHoraria');
        if (!mensaje) return;
        mensaje.textContent = texto;
        mensaje.style.display = 'block';
    }

    ocultarMensajeDisponibilidad() {
        const mensaje = document.getElementById('mensajeDisponibilidadHoraria');
        if (!mensaje) return;
        mensaje.textContent = '';
        mensaje.style.display = 'none';
    }

    mostrarSinDisponibilidad(texto) {
        const selectHora = document.getElementById('hora');
        if (!selectHora) return;

        selectHora.innerHTML = `<option value="">${texto}</option>`;
        selectHora.disabled = true;
        selectHora.required = false;
        selectHora.value = '';
        this.mostrarMensajeDisponibilidad(texto);
    }

    actualizarSelectHoras() {
        const selectHora = document.getElementById('hora');
        const inputFecha = document.getElementById('fecha');
        if (!selectHora) return;

        this.ocultarMensajeDisponibilidad();

        if (!this.especialistaIdSeleccionado) {
            this.inicializarSelectHoras();
            return;
        }

        const fechaSeleccionada = inputFecha ? inputFecha.value : '';
        if (!fechaSeleccionada) {
            selectHora.innerHTML = '<option value="">Seleccione una fecha primero...</option>';
            selectHora.disabled = true;
            selectHora.required = false;
            selectHora.value = '';
            return;
        }

        const bloquesDelDia = this.obtenerBloquesParaFecha(fechaSeleccionada);

        if (bloquesDelDia.length === 0) {
            this.mostrarSinDisponibilidad('No hay disponibilidad para este día.');
            return;
        }

        selectHora.innerHTML = '<option value="">Seleccione un horario...</option>';

        bloquesDelDia.forEach(bloque => {
            const inicioMin = this.obtenerMinutosDesdeBloque(bloque, 'inicio');
            const horaInicio = bloque.horaInicio || this.minutosAHora(inicioMin);
            const etiqueta = this.formatearEtiquetaBloque(bloque);

            const opcion = document.createElement('option');
            opcion.value = horaInicio;
            opcion.textContent = etiqueta;
            selectHora.appendChild(opcion);
        });

        selectHora.disabled = false;
        selectHora.required = true;
    }

    validarEspecialistaSeleccionado() {
        const selectDoctor = document.getElementById('doctor');
        const idSeleccionado = selectDoctor?.value;

        if (!idSeleccionado) {
            alert('Debe seleccionar un especialista del área correspondiente.');
            selectDoctor?.focus();
            return null;
        }

        const doc = this.doctoresPermitidos.find(d => d.id === idSeleccionado);
        if (!doc) {
            alert('El especialista seleccionado no pertenece al área indicada.');
            return null;
        }

        return doc;
    }

    irAlPaso(numeroPaso) {
        if (numeroPaso === 2) {
            const nombre = document.getElementById('nombre');
            const apellido = document.getElementById('apellido');
            const motivo = document.getElementById('motivo');

            if (!nombre.checkValidity()) { nombre.reportValidity(); return; }
            if (!apellido.checkValidity()) { apellido.reportValidity(); return; }
            if (!motivo.checkValidity()) { motivo.reportValidity(); return; }

            if (this.doctoresPermitidos.length === 0) {
                alert('No hay especialistas disponibles en esta área. Regrese al menú y elija otra especialidad.');
                return;
            }

            document.getElementById('paso2').classList.add('activo');
            document.getElementById('btnContinuar1').style.display = 'none';
        } else if (numeroPaso === 3) {
            if (!this.validarEspecialistaSeleccionado()) return;

            document.getElementById('paso3').classList.add('activo');
            document.getElementById('btnContinuar2').style.display = 'none';
            this.actualizarSelectHoras();
        }
    }

    cancelarProceso() {
        if (confirm('¿Desea salir y cancelar el proceso de reservación?')) {
            window.location.href = 'MenuCitas.html';
        }
    }

    guardarReservacion(evento) {
        evento.preventDefault();

        const doc = this.validarEspecialistaSeleccionado();
        if (!doc) return;

        const selectHora = document.getElementById('hora');
        if (!selectHora || !selectHora.value || selectHora.disabled) {
            alert('Seleccione un horario disponible para la fecha elegida.');
            return;
        }

        const citaNueva = new Cita(
            document.getElementById('nombre').value,
            document.getElementById('apellido').value,
            document.getElementById('motivo').value,
            doc.etiqueta,
            document.getElementById('fecha').value,
            selectHora.value
        );

        citaNueva.especialidad = this.especialidad;
        citaNueva.especialistaId = doc.id;

        const sesionJSON = localStorage.getItem('usuarioActivo');
        if (sesionJSON) {
            const usuario = JSON.parse(sesionJSON);
            if (usuario.id) citaNueva.pacienteId = String(usuario.id);
        }

        fetch(`${API_BASE}/citas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(citaNueva)
        })
            .then(async respuesta => {
                const datos = await respuesta.json();
                if (!respuesta.ok) throw new Error(datos.error || 'Error al guardar la cita');
                return datos;
            })
            .then(() => {
                window.location.href = 'ConsultarCitas.html';
            })
            .catch(error => {
                console.error('[CitaView] Error:', error);
                alert(error.message);
            });
    }
}

new CitaView();
