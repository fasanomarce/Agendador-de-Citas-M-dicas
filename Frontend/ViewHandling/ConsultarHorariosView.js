/**
 * Controlador de la vista Consultar Horarios (Administrador).
 * Carga personal en memoria, selectores en cascada y renderizado agrupado por día.
 */
class ConsultarHorariosView {
    constructor() {
        this.apiBase = 'http://localhost:3000';

        this.personalMemoria = [];
        this.horariosMemoria = [];

        this.modoVista = 'semana';
        this.diaFiltrado = '';

        this.ordenDias = [
            'lunes',
            'martes',
            'miercoles',
            'jueves',
            'viernes',
            'sabado',
            'domingo'
        ];

        this.etiquetasDia = {
            lunes: 'Lunes',
            martes: 'Martes',
            miercoles: 'Miércoles',
            jueves: 'Jueves',
            viernes: 'Viernes',
            sabado: 'Sábado',
            domingo: 'Domingo'
        };

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.asignarEventos();
            this.cargarPersonal();
        });
    }

    asignarEventos() {
        const selectEspecialidad = document.getElementById('filtroEspecialidad');
        const selectEspecialista = document.getElementById('filtroEspecialista');
        const selectDia = document.getElementById('filtroDia');
        const btnVerSemana = document.getElementById('btnVerSemana');
        const btnFiltrarDia = document.getElementById('btnFiltrarDia');

        if (selectEspecialidad) {
            selectEspecialidad.addEventListener('change', () => this.onEspecialidadChange());
        }

        if (selectEspecialista) {
            selectEspecialista.addEventListener('change', () => {
                const id = selectEspecialista.value;
                if (id) {
                    this.consultarHorarioEspecialista(id);
                } else {
                    this.horariosMemoria = [];
                    this.renderizarHorarios();
                }
            });
        }

        if (btnVerSemana) {
            btnVerSemana.addEventListener('click', () => this.activarVistaSemana());
        }

        if (btnFiltrarDia) {
            btnFiltrarDia.addEventListener('click', () => this.activarVistaPorDia());
        }

        if (selectDia) {
            selectDia.addEventListener('change', () => {
                this.diaFiltrado = selectDia.value;
                this.renderizarHorarios();
            });
        }
    }

    async cargarPersonal() {
        const selectEspecialidad = document.getElementById('filtroEspecialidad');
        if (!selectEspecialidad) return;

        try {
            const respuesta = await fetch(`${this.apiBase}/api/personal`);
            if (!respuesta.ok) {
                throw new Error(`Error al obtener personal (${respuesta.status})`);
            }

            const datos = await respuesta.json();
            this.personalMemoria = Array.isArray(datos.especialistas) ? datos.especialistas : [];

            const especialidadesUnicas = [
                ...new Set(
                    this.personalMemoria
                        .map((esp) => esp.especialidad)
                        .filter((nombre) => typeof nombre === 'string' && nombre.trim() !== '')
                )
            ].sort((a, b) => a.localeCompare(b, 'es'));

            selectEspecialidad.innerHTML = '<option value="">Seleccione una especialidad...</option>';

            if (especialidadesUnicas.length === 0) {
                selectEspecialidad.innerHTML +=
                    '<option value="" disabled>No hay especialidades registradas</option>';
                return;
            }

            especialidadesUnicas.forEach((especialidad) => {
                const opcion = document.createElement('option');
                opcion.value = especialidad;
                opcion.textContent = especialidad;
                selectEspecialidad.appendChild(opcion);
            });
        } catch (error) {
            console.error('Error en cargarPersonal:', error);
            selectEspecialidad.innerHTML =
                '<option value="">Error al cargar especialidades</option>';

            const contenedor = document.getElementById('contenedorHorarios');
            if (contenedor) {
                contenedor.innerHTML =
                    '<p class="mensaje-error">No se pudo conectar con el servidor. Verifique que el backend esté activo.</p>';
            }
        }
    }

    onEspecialidadChange() {
        const selectEspecialidad = document.getElementById('filtroEspecialidad');
        const selectEspecialista = document.getElementById('filtroEspecialista');
        if (!selectEspecialidad || !selectEspecialista) return;

        const especialidadSeleccionada = selectEspecialidad.value;

        this.horariosMemoria = [];
        this.renderizarHorarios();

        selectEspecialista.innerHTML = '<option value="">Seleccione un especialista...</option>';

        if (!especialidadSeleccionada) {
            selectEspecialista.disabled = true;
            return;
        }

        const medicosFiltrados = this.personalMemoria.filter(
            (esp) => esp.especialidad === especialidadSeleccionada
        );

        if (medicosFiltrados.length === 0) {
            selectEspecialista.disabled = true;
            selectEspecialista.innerHTML +=
                '<option value="" disabled>No hay especialistas en esta área</option>';
            return;
        }

        medicosFiltrados.forEach((medico) => {
            const opcion = document.createElement('option');
            opcion.value = String(medico.id);
            opcion.textContent = `Dr/a. ${medico.nombre} ${medico.apellido}`;
            selectEspecialista.appendChild(opcion);
        });

        selectEspecialista.disabled = false;
    }

    async consultarHorarioEspecialista(id) {
        try {
            const respuesta = await fetch(`${this.apiBase}/api/horarios/${id}`);
            if (!respuesta.ok) {
                throw new Error(`Error al consultar horarios (${respuesta.status})`);
            }

            const datos = await respuesta.json();
            this.horariosMemoria = Array.isArray(datos) ? datos : [];
            this.renderizarHorarios();
        } catch (error) {
            console.error('Error en consultarHorarioEspecialista:', error);
            this.horariosMemoria = [];

            const contenedor = document.getElementById('contenedorHorarios');
            if (contenedor) {
                contenedor.innerHTML =
                    '<p class="mensaje-error">No se pudieron cargar los horarios del especialista.</p>';
            }
        }
    }

    activarVistaSemana() {
        this.modoVista = 'semana';
        this.diaFiltrado = '';

        const selectDia = document.getElementById('filtroDia');
        if (selectDia) {
            selectDia.style.display = 'none';
            selectDia.value = '';
        }

        this.renderizarHorarios();
    }

    activarVistaPorDia() {
        this.modoVista = 'dia';

        const selectDia = document.getElementById('filtroDia');
        if (selectDia) {
            selectDia.style.display = 'block';
            this.diaFiltrado = selectDia.value;
        }

        this.renderizarHorarios();
    }

    obtenerHorariosFiltrados() {
        if (this.modoVista !== 'dia' || !this.diaFiltrado) {
            return [...this.horariosMemoria];
        }

        return this.horariosMemoria.filter(
            (bloque) => (bloque.diaSemana || '').toLowerCase() === this.diaFiltrado
        );
    }

    agruparPorDiaSemana(horarios) {
        const grupos = {};

        horarios.forEach((bloque) => {
            const dia = (bloque.diaSemana || 'sin-dia').toLowerCase();
            if (!grupos[dia]) {
                grupos[dia] = [];
            }
            grupos[dia].push(bloque);
        });

        return grupos;
    }

    formatearDuracion(bloque) {
        if (typeof bloque.duracionMinutos === 'number') {
            return bloque.duracionMinutos;
        }

        if (
            typeof bloque.inicioMinutos === 'number' &&
            typeof bloque.finMinutos === 'number'
        ) {
            return bloque.finMinutos - bloque.inicioMinutos;
        }

        return 'N/D';
    }

    crearTarjetaHorario(bloque) {
        const diaEtiqueta = this.etiquetasDia[(bloque.diaSemana || '').toLowerCase()] || bloque.diaSemana;
        const duracion = this.formatearDuracion(bloque);

        const tarjeta = document.createElement('div');
        tarjeta.className = 'cita-card';
        tarjeta.innerHTML = `
            <h3 class="cita-card-titulo">${diaEtiqueta}</h3>
            <p><strong>Hora inicio:</strong> ${bloque.horaInicio || '—'}</p>
            <p><strong>Hora fin:</strong> ${bloque.horaFin || '—'}</p>
            <p><strong>Duración:</strong> ${duracion} min</p>
        `;

        return tarjeta;
    }

    renderizarHorarios() {
        const contenedor = document.getElementById('contenedorHorarios');
        if (!contenedor) return;

        contenedor.innerHTML = '';

        const selectEspecialista = document.getElementById('filtroEspecialista');
        if (!selectEspecialista || !selectEspecialista.value) {
            contenedor.innerHTML =
                '<p class="mensaje-vacio">Seleccione una especialidad y un especialista para consultar horarios.</p>';
            return;
        }

        const horariosVisibles = this.obtenerHorariosFiltrados();

        if (this.modoVista === 'dia' && !this.diaFiltrado) {
            contenedor.innerHTML =
                '<p class="mensaje-vacio">Seleccione un día para filtrar los bloques horarios.</p>';
            return;
        }

        if (horariosVisibles.length === 0) {
            const mensaje = this.modoVista === 'dia'
                ? 'No hay bloques registrados para el día seleccionado.'
                : 'Este especialista no tiene bloques horarios registrados.';
            contenedor.innerHTML = `<p class="mensaje-vacio">${mensaje}</p>`;
            return;
        }

        const grupos = this.agruparPorDiaSemana(horariosVisibles);
        const diasOrdenados = this.ordenDias.filter((dia) => grupos[dia]);

        diasOrdenados.forEach((dia) => {
            const bloquesDelDia = grupos[dia].sort((a, b) => {
                const inicioA = a.inicioMinutos ?? 0;
                const inicioB = b.inicioMinutos ?? 0;
                return inicioA - inicioB;
            });

            bloquesDelDia.forEach((bloque) => {
                contenedor.appendChild(this.crearTarjetaHorario(bloque));
            });
        });

        Object.keys(grupos)
            .filter((dia) => !this.ordenDias.includes(dia))
            .forEach((dia) => {
                grupos[dia].forEach((bloque) => {
                    contenedor.appendChild(this.crearTarjetaHorario(bloque));
                });
            });
    }
}

new ConsultarHorariosView();
