class CitaView {
    constructor() {
        this.init();
    }

    // Inicializa la configuración de la vista y asigna los eventos
    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.configurarFecha();
            this.asignarEventos();
            this.cargarEspecialistasDesdeURL();
            this.prellenarUsuarioSesion();
        });
    }

    prellenarUsuarioSesion() {
        const sesionJSON = localStorage.getItem('usuarioActivo');
        if (sesionJSON) {
            const usuario = JSON.parse(sesionJSON);
            const inputNombre = document.getElementById('nombre');
            const inputApellido = document.getElementById('apellido');
            
            if (inputNombre && usuario.nombre) {
                inputNombre.value = usuario.nombre;
            }
            if (inputApellido && usuario.apellido) {
                inputApellido.value = usuario.apellido;
            }
        }
    }

    cargarEspecialistasDesdeURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const especialidad = urlParams.get('especialidad');

        if (especialidad) {
            // Ajustamos el título del Paso 2 para dar feedback
            const legendPaso2 = document.querySelector('#paso2 legend');
            if(legendPaso2) {
                legendPaso2.innerText = `Paso 2: Lista de Especialistas - ${especialidad}`;
            }

            fetch(`http://localhost:3000/api/especialidades/${encodeURIComponent(especialidad)}`)
                .then(res => {
                    if(!res.ok) throw new Error("Error al obtener la especialidad");
                    return res.json();
                })
                .then(datos => {
                    const datalist = document.getElementById('lista-doctores');
                    if (datalist && datos.doctores) {
                        datalist.innerHTML = ''; // Limpiamos hardcoded values
                        
                        if (datos.doctores.length === 0) {
                            alert("No hay doctores disponibles para esta especialidad actualmente.");
                        } else {
                            datos.doctores.forEach(doc => {
                                datalist.innerHTML += `<option value="Dr/a. ${doc.nombre} ${doc.apellido}"></option>`;
                            });
                        }
                    }
                })
                .catch(err => {
                    console.error("No se pudo cargar especialistas de la URL", err);
                });
        }
    }

    // Asocia las interacciones de los botones a métodos de esta clase
    asignarEventos() {
        const btnContinuar1 = document.getElementById('btnContinuar1');
        const btnContinuar2 = document.getElementById('btnContinuar2');
        const btnSalir = document.getElementById('btnSalir');
        const form = document.getElementById('registroCitaForm');

        if (btnContinuar1) btnContinuar1.addEventListener('click', () => this.irAlPaso(2));
        if (btnContinuar2) btnContinuar2.addEventListener('click', () => this.irAlPaso(3));
        if (btnSalir) btnSalir.addEventListener('click', () => this.cancelarProceso());
        if (form) form.addEventListener('submit', this.guardarReservacion.bind(this));
    }

    configurarFecha() {
        const inputFecha = document.getElementById("fecha");
        if (!inputFecha) return;

        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 1); 
        
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        const fechaMinima = `${anio}-${mes}-${dia}`;
        
        inputFecha.min = fechaMinima;

        inputFecha.addEventListener("change", (e) => {
            const fechaElegida = new Date(e.target.value);
            const diaSemana = fechaElegida.getUTCDay(); 

            if (diaSemana === 0 || diaSemana === 6) {
                alert("Lo sentimos, no atendemos los fines de semana. Por favor elija de Lunes a Viernes.");
                e.target.value = ""; 
            }
        });
    }

    irAlPaso(numeroPaso) {
        if (numeroPaso === 2) {
            const nombre = document.getElementById('nombre');
            const apellido = document.getElementById('apellido');
            const motivo = document.getElementById('motivo'); 
            
            if (!nombre.checkValidity()) { nombre.reportValidity(); return; }
            if (!apellido.checkValidity()) { apellido.reportValidity(); return; }
            if (!motivo.checkValidity()) { motivo.reportValidity(); return; }
            
            document.getElementById('paso2').classList.add('activo');
            document.getElementById('btnContinuar1').style.display = 'none';
        } 
        else if (numeroPaso === 3) {
            const doctor = document.getElementById('doctor');
            
            if (!doctor.checkValidity()) { 
                doctor.reportValidity(); 
                return; 
            }

            document.getElementById('paso3').classList.add('activo');
            document.getElementById('btnContinuar2').style.display = 'none';
        }
    }

    cancelarProceso() {
        const confirmacion = confirm("¿Desea salir y cancelar el proceso de reservación?");
        if (confirmacion) {
            window.location.href = "menuCitas.html";
        }
    }

    guardarReservacion(evento) {
        evento.preventDefault();
        
        const citaNueva = new Cita(
            document.getElementById('nombre').value,
            document.getElementById('apellido').value,
            document.getElementById('motivo').value,
            document.getElementById('doctor').value,
            document.getElementById('fecha').value,
            document.getElementById('hora').value
        );

        // envia datos a node.js
        fetch('http://localhost:3000/api/citas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(citaNueva) // convierte la cita a JSON
        })
        .then(respuesta => respuesta.json()) // promesa: cuando el servidor termine de procesar, traduce la respuesta a json
        .then(datos => {
            alert("Cita guardada en el servidor exitosamente");
            window.location.href = "MenuCitas.html";
        })
        .catch(error => console.error('Error:', error));
    }
}

// Instanciar el controlador para que comience a ejecutarse
new CitaView();