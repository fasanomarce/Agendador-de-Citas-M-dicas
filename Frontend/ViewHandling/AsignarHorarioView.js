/**
 * Controlador de la vista Asignar Horario.
 * Implementa el diagrama de actividades alineado con el ERS: validación, auditoría y control por área.
 */
class AsignarHorarioView {
    constructor() {
        this.apiBase = 'http://localhost:3000';
        this.especialidadesCatalogo = ['Cardiología'];

        this.DURACION_MINIMA_MINUTOS = 60;
        this.DURACION_MAXIMA_MINUTOS = 300;

        this.sesionSecretario = {
            id: 3,
            nombre: 'Carlos',
            apellido: 'Ruiz',
            nombreCompleto: 'Carlos Ruiz',
            areaAsignada: 'Cardiología'
        };

        this.horariosMedicosActuales = [];
        this.bloqueSeleccionadoTemporal = null;
        this.listaEspecialistasMemoria = [];

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.asignarEventos();
            this.cargarEspecialistas();
        });
    }

    asignarEventos() {
        const selectEspecialista = document.getElementById('especialista');
        const btnContinuar = document.getElementById('btnContinuarEspecialista');
        const formulario = document.getElementById('formularioBloquesHorario');
        const btnConfirmar = document.getElementById('btnConfirmarAsignacion');
        const btnModificarSinBloques = document.getElementById('btnModificarHorarioSinBloques');
        const btnRealizarModificaciones = document.getElementById('btnRealizarModificaciones');
        const btnFinalizar = document.getElementById('btnFinalizarAsignacion');

        if (selectEspecialista) {
            selectEspecialista.addEventListener('change', () => this.onEspecialistaChange());
        }

        if (btnContinuar) {
            btnContinuar.addEventListener('click', () => this.onContinuarEspecialista());
        }

        if (formulario) {
            formulario.addEventListener('submit', (evento) => this.enviarHorario(evento));
        }

        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', () => this.confirmarGuardado());
        }

        if (btnModificarSinBloques) {
            btnModificarSinBloques.addEventListener('click', () => this.onModificarHorarioDesdeSinBloques());
        }

        if (btnRealizarModificaciones) {
            btnRealizarModificaciones.addEventListener('click', () => this.onRealizarModificaciones());
        }

        if (btnFinalizar) {
            btnFinalizar.addEventListener('click', () => this.onFinalizarAsignacion());
        }

        document.querySelectorAll('[data-cerrar-modal]').forEach((boton) => {
            boton.addEventListener('click', () => {
                const idModal = boton.getAttribute('data-cerrar-modal');
                if (idModal) {
                    this.mostrarModal(idModal, false);
                }
            });
        });

        document.querySelectorAll('.modal-overlay').forEach((overlay) => {
            overlay.addEventListener('click', (evento) => {
                if (evento.target === overlay) {
                    this.mostrarModal(overlay.id, false);
                }
            });
        });
    }

    /**
     * Carga especialistas desde personal.json vía API y los guarda en memoria.
     * El filtrado por área del secretario se aplica al poblar el select.
     */
    async cargarEspecialistas() {
        const select = document.getElementById('especialista');
        if (!select) return;

        try {
            const respuestaPersonal = await fetch(`${this.apiBase}/api/personal`);
            if (respuestaPersonal.ok) {
                const datos = await respuestaPersonal.json();
                this.listaEspecialistasMemoria = Array.isArray(datos.especialistas)
                    ? datos.especialistas
                    : [];
            } else {
                await this.cargarEspecialistasDesdeEspecialidades();
            }
        } catch (error) {
            console.error('Fallo al cargar /api/personal, usando especialidades:', error);
            await this.cargarEspecialistasDesdeEspecialidades();
        }

        this.poblarSelectEspecialistas(select);
    }

    /**
     * Respaldo: carga únicamente la especialidad bajo el área del secretario en sesión.
     */
    async cargarEspecialistasDesdeEspecialidades() {
        const acumulado = [];
        const areaSecretario = this.sesionSecretario.areaAsignada;

        try {
            const respuesta = await fetch(
                `${this.apiBase}/api/especialidades/${encodeURIComponent(areaSecretario)}`
            );
            if (!respuesta.ok) {
                this.listaEspecialistasMemoria = acumulado;
                return;
            }

            const datos = await respuesta.json();
            if (!Array.isArray(datos.doctores)) {
                this.listaEspecialistasMemoria = acumulado;
                return;
            }

            datos.doctores.forEach((doc) => {
                acumulado.push({
                    id: doc.id,
                    nombre: doc.nombre,
                    apellido: doc.apellido,
                    especialidad: doc.especialidad || areaSecretario,
                    rol: doc.rol
                });
            });
        } catch (error) {
            console.error(`Error cargando especialidad ${areaSecretario}:`, error);
        }

        this.listaEspecialistasMemoria = acumulado;
    }

    /**
     * Puebla el select solo con especialistas del área asignada al secretario en sesión.
     */
    poblarSelectEspecialistas(select) {
        select.innerHTML = '<option value="">Seleccione un especialista...</option>';

        const areaSecretario = this.sesionSecretario.areaAsignada;
        const especialistasAutorizados = this.listaEspecialistasMemoria.filter(
            (esp) => esp.especialidad === areaSecretario
        );

        if (especialistasAutorizados.length === 0) {
            const opcionVacia = document.createElement('option');
            opcionVacia.value = '';
            opcionVacia.textContent = `No hay especialistas en ${areaSecretario}`;
            opcionVacia.disabled = true;
            select.appendChild(opcionVacia);
            return;
        }

        especialistasAutorizados.forEach((esp) => {
            const opcion = document.createElement('option');
            opcion.value = String(esp.id);
            opcion.textContent = `Dr/a. ${esp.nombre} ${esp.apellido} — ${esp.especialidad}`;
            select.appendChild(opcion);
        });
    }

    async onEspecialistaChange() {
        const select = document.getElementById('especialista');
        const especialistaId = select ? select.value : '';

        this.horariosMedicosActuales = [];
        this.bloqueSeleccionadoTemporal = null;

        if (!especialistaId) return;

        try {
            const respuesta = await fetch(`${this.apiBase}/api/horarios/${especialistaId}`);
            if (!respuesta.ok) {
                throw new Error(`No se pudieron obtener horarios (${respuesta.status})`);
            }

            const datos = await respuesta.json();
            this.horariosMedicosActuales = Array.isArray(datos)
                ? datos
                : (Array.isArray(datos.horarios) ? datos.horarios : []);
        } catch (error) {
            console.error('Error al consultar horarios del especialista:', error);
            this.horariosMedicosActuales = [];
            return;
        }

        if (this.horariosMedicosActuales.length === 0) {
            return;
        }

        if (this.especialistaAlcanzoCapacidadMaxima(this.horariosMedicosActuales)) {
            this.mostrarModal('modalSinBloques', true);
            return;
        }

        this.mostrarModal('modalAlertaOcupado', true);
    }

    onContinuarEspecialista() {
        const select = document.getElementById('especialista');
        if (!select || !select.value) {
            select.reportValidity();
            return;
        }

        this.mostrarSeccion('seccionFormularioBloques');
    }

    onModificarHorarioDesdeSinBloques() {
        this.mostrarModal('modalSinBloques', false);
        this.mostrarSeccion('seccionFormularioBloques');
    }

    onRealizarModificaciones() {
        this.mostrarModal('modalExitoModificar', false);
        this.mostrarSeccion('seccionFormularioBloques');
        const formulario = document.getElementById('formularioBloquesHorario');
        if (formulario) formulario.reset();
    }

    onFinalizarAsignacion() {
        this.mostrarModal('modalExitoModificar', false);
        window.location.href = 'MenuCitas.html';
    }

    calcularMinutosAcumuladosPlantilla(horarios) {
        return horarios.reduce((acumulado, bloque) => {
            if (typeof bloque.duracionMinutos === 'number') {
                return acumulado + bloque.duracionMinutos;
            }

            const inicio = this.obtenerMinutosDesdeBloque(bloque, 'inicio');
            const fin = this.obtenerMinutosDesdeBloque(bloque, 'fin');

            if (Number.isNaN(inicio) || Number.isNaN(fin) || fin <= inicio) {
                return acumulado;
            }

            return acumulado + (fin - inicio);
        }, 0);
    }

    obtenerLimiteMinutosPlantilla() {
        // TODO: Conectar dinámicamente con la base de datos de políticas de la clínica
        // (cupo semanal por especialidad, consultorio y plantilla médica autorizada).
        const horasSemanalesPermitidas = 40;
        return horasSemanalesPermitidas * 60;
    }

    /**
     * Evalúa si la plantilla horaria del especialista alcanzó el cupo de minutos permitido.
     */
    especialistaAlcanzoCapacidadMaxima(horarios) {
        const minutosAcumulados = this.calcularMinutosAcumuladosPlantilla(horarios);
        const limiteMinutosPlantilla = this.obtenerLimiteMinutosPlantilla();
        return minutosAcumulados >= limiteMinutosPlantilla;
    }

    obtenerEspecialistaPorId(especialistaId) {
        const idNumerico = Number(especialistaId);
        const areaSecretario = this.sesionSecretario.areaAsignada;

        return this.listaEspecialistasMemoria.find(
            (esp) => Number(esp.id) === idNumerico && esp.especialidad === areaSecretario
        ) || null;
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

    obtenerMinutosDesdeBloque(bloque, extremo) {
        if (extremo === 'inicio') {
            if (typeof bloque.inicioMinutos === 'number') return bloque.inicioMinutos;
            return this.convertirHoraAMinutos(bloque.horaInicio);
        }
        if (typeof bloque.finMinutos === 'number') return bloque.finMinutos;
        return this.convertirHoraAMinutos(bloque.horaFin);
    }

    validarDuracionBloque(inicio, fin) {
        const inicioMinutos = this.convertirHoraAMinutos(inicio);
        const finMinutos = this.convertirHoraAMinutos(fin);

        if (Number.isNaN(inicioMinutos) || Number.isNaN(finMinutos)) {
            return { valido: false, minutos: 0, mensaje: 'Las horas ingresadas no son válidas.' };
        }

        const duracion = finMinutos - inicioMinutos;

        if (duracion <= 0) {
            return {
                valido: false,
                minutos: duracion,
                mensaje: 'La hora de fin debe ser posterior a la hora de inicio.'
            };
        }

        if (duracion < this.DURACION_MINIMA_MINUTOS) {
            return {
                valido: false,
                minutos: duracion,
                mensaje: `La duración del bloque debe ser de al menos ${this.DURACION_MINIMA_MINUTOS} minutos (1 hora). El ERS no permite bloques menores a una hora.`
            };
        }

        if (duracion > this.DURACION_MAXIMA_MINUTOS) {
            return {
                valido: false,
                minutos: duracion,
                mensaje: `La duración del bloque no puede exceder ${this.DURACION_MAXIMA_MINUTOS} minutos (5 horas).`
            };
        }

        return { valido: true, minutos: duracion, mensaje: '' };
    }

    existeColisionHorario(bloqueNuevo, bloqueExistente) {
        const diaNuevo = (bloqueNuevo.diaSemana || '').toLowerCase();
        const diaExistente = (bloqueExistente.diaSemana || '').toLowerCase();

        if (diaNuevo !== diaExistente) return false;

        const inicioNuevo = bloqueNuevo.inicioMinutos;
        const finNuevo = bloqueNuevo.finMinutos;
        const inicioExistente = this.obtenerMinutosDesdeBloque(bloqueExistente, 'inicio');
        const finExistente = this.obtenerMinutosDesdeBloque(bloqueExistente, 'fin');

        const hayInterseccion = inicioNuevo < finExistente && finNuevo > inicioExistente;
        if (!hayInterseccion) return false;

        const especialidadNueva = bloqueNuevo.especialidad;
        const especialidadExistente = bloqueExistente.especialidad;
        const mismaEspecialidad = especialidadNueva === especialidadExistente;
        const violacionDobleConsultorio =
            especialidadNueva !== especialidadExistente &&
            inicioNuevo < finExistente &&
            finNuevo > inicioExistente;

        return mismaEspecialidad || violacionDobleConsultorio;
    }

    detectarColisionConRegistrados(bloqueNuevo) {
        return this.horariosMedicosActuales.some((bloque) =>
            this.existeColisionHorario(bloqueNuevo, bloque)
        );
    }

    obtenerDatosSecretarioSesion() {
        return {
            secretarioId: this.sesionSecretario.id,
            secretarioNombre: this.sesionSecretario.nombreCompleto
        };
    }

    enviarHorario(evento) {
        evento.preventDefault();

        const selectEspecialista = document.getElementById('especialista');
        const inputInicio = document.getElementById('horaInicio');
        const inputFin = document.getElementById('horaFin');
        const selectDia = document.getElementById('diaSemana');

        if (!selectEspecialista || !inputInicio || !inputFin || !selectDia) return;

        if (!selectEspecialista.value) {
            alert('Debe seleccionar un especialista de su área asignada antes de registrar un horario.');
            this.mostrarSeccion('seccionEspecialista');
            return;
        }

        if (!inputInicio.checkValidity()) {
            inputInicio.reportValidity();
            return;
        }
        if (!inputFin.checkValidity()) {
            inputFin.reportValidity();
            return;
        }
        if (!selectDia.checkValidity()) {
            selectDia.reportValidity();
            return;
        }

        const horaInicio = inputInicio.value;
        const horaFin = inputFin.value;
        const diaSemana = selectDia.value;
        const especialistaId = Number(selectEspecialista.value);

        const especialista = this.obtenerEspecialistaPorId(especialistaId);
        if (!especialista) {
            alert(
                'Acceso denegado: el especialista seleccionado no pertenece a su área asignada (' +
                `${this.sesionSecretario.areaAsignada}).`
            );
            return;
        }

        const especialidad = especialista.especialidad;
        const validacionDuracion = this.validarDuracionBloque(horaInicio, horaFin);

        if (!validacionDuracion.valido) {
            alert(validacionDuracion.mensaje);
            return;
        }

        const inicioMinutos = this.convertirHoraAMinutos(horaInicio);
        const finMinutos = this.convertirHoraAMinutos(horaFin);
        const datosSecretario = this.obtenerDatosSecretarioSesion();

        const bloqueNuevo = {
            especialistaId,
            diaSemana,
            horaInicio,
            horaFin,
            especialidad,
            duracionMinutos: validacionDuracion.minutos,
            inicioMinutos,
            finMinutos,
            secretarioId: datosSecretario.secretarioId,
            secretarioNombre: datosSecretario.secretarioNombre
        };

        if (this.detectarColisionConRegistrados(bloqueNuevo)) {
            this.mostrarModal('modalConflictoHorario', true);
            return;
        }

        this.bloqueSeleccionadoTemporal = bloqueNuevo;
        this.actualizarResumenConfirmacion(bloqueNuevo);
        this.mostrarModal('modalConfirmacion', true);
    }

    actualizarResumenConfirmacion(bloque) {
        const resumen = document.getElementById('modalConfirmacionResumen');
        if (!resumen) return;

        const especialista = this.obtenerEspecialistaPorId(bloque.especialistaId);
        const nombreCompleto = especialista
            ? `Dr/a. ${especialista.nombre} ${especialista.apellido}`
            : `ID ${bloque.especialistaId}`;

        resumen.textContent =
            `${nombreCompleto} · ${bloque.especialidad} · ${bloque.diaSemana} · ` +
            `${bloque.horaInicio} a ${bloque.horaFin} (${bloque.duracionMinutos} min) · ` +
            `Registrado por: ${bloque.secretarioNombre}.`;
    }

    async confirmarGuardado() {
        if (!this.bloqueSeleccionadoTemporal) {
            alert('No hay un bloque pendiente de confirmación.');
            return;
        }

        try {
            const respuesta = await fetch(`${this.apiBase}/api/horarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.bloqueSeleccionadoTemporal)
            });

            if (respuesta.status === 201) {
                this.mostrarModal('modalConfirmacion', false);
                this.mostrarModal('modalExitoModificar', true);

                const bloqueGuardado = await respuesta.json();
                if (bloqueGuardado && bloqueGuardado.id) {
                    this.horariosMedicosActuales.push(bloqueGuardado);
                } else {
                    this.horariosMedicosActuales.push({ ...this.bloqueSeleccionadoTemporal });
                }

                this.bloqueSeleccionadoTemporal = null;
                const formulario = document.getElementById('formularioBloquesHorario');
                if (formulario) formulario.reset();
                return;
            }

            if (respuesta.status === 409) {
                this.mostrarModal('modalConfirmacion', false);
                this.mostrarModal('modalConflictoHorario', true);
                return;
            }

            if (respuesta.status === 400) {
                const errorValidacion = await respuesta.json().catch(() => ({}));
                alert(errorValidacion.mensaje || 'Los datos del horario no cumplen las reglas del ERS.');
                return;
            }

            const errorServidor = await respuesta.json().catch(() => ({}));
            alert(errorServidor.mensaje || 'No se pudo guardar el horario. Intente nuevamente.');
        } catch (error) {
            console.error('Error en confirmarGuardado:', error);
            alert('No se pudo conectar con el servidor. Verifique que el backend esté activo.');
        }
    }

    mostrarSeccion(idSeccion) {
        const seccionEspecialista = document.getElementById('seccionEspecialista');
        const seccionFormulario = document.getElementById('seccionFormularioBloques');

        if (idSeccion === 'seccionFormularioBloques') {
            if (seccionEspecialista) seccionEspecialista.classList.add('activo');
            if (seccionFormulario) seccionFormulario.classList.add('activo');
            return;
        }

        if (idSeccion === 'seccionEspecialista') {
            if (seccionEspecialista) seccionEspecialista.classList.add('activo');
            if (seccionFormulario) seccionFormulario.classList.remove('activo');
        }
    }

    mostrarModal(idModal, visible) {
        const modal = document.getElementById(idModal);
        if (!modal) return;

        modal.style.display = visible ? 'flex' : 'none';
        modal.setAttribute('aria-hidden', visible ? 'false' : 'true');
    }
}

const asignarHorarioView = new AsignarHorarioView();
