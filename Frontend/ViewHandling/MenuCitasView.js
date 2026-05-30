class MenuCitasView {
    constructor() {
        this.init();
    }

    init() {
        // Cargar dinámicamente las especialidades en el tablero
        this.cargarTableroEspecialidades();

        // Asignamos el evento general para cerrar el modal si hacen click fuera de él
        document.addEventListener("DOMContentLoaded", () => {
            const modal = document.getElementById('especialidadModal');
            window.onclick = (event) => {
                if (event.target == modal) {
                    this.cerrarModal();
                }
            };
        });
    }

    cargarTableroEspecialidades() {
        fetch('http://localhost:3000/api/especialidades')
            .then(res => res.json())
            .then(especialidades => {
                const contenedor = document.getElementById('contenedorMenuEspecialidades');
                if (!contenedor) return;

                contenedor.innerHTML = '';
                
                // Arreglo de colores para las tarjetas
                const colores = ['#2F4F4F', '#B22222', '#008000', '#4682B4', '#696969', '#8B4513', '#4B0082', '#008080'];
                let indexColor = 0;

                for (const [nombreEspecialidad, datosEspecialidad] of Object.entries(especialidades)) {
                    const color = colores[indexColor % colores.length];
                    indexColor++;

                    contenedor.innerHTML += `
                        <div class="dashboard-card">
                            <a href="#" class="card-link-wrapper" onclick="menuCitasView.abrirModal('${nombreEspecialidad}')">
                                <div class="card-top" style="background-color: ${color};">
                                    <div class="card-menu-icon">⋮</div>
                                </div>
                                <div class="card-body">
                                    <h3 class="card-title" style="color: ${color};">${nombreEspecialidad}</h3>
                                    ${datosEspecialidad.horario ? `<p class="card-subtext">${datosEspecialidad.horario}</p>` : ''}
                                </div>
                            </a>
                        </div>
                    `;
                }
            })
            .catch(err => console.error("Error cargando especialidades:", err));
    }

    abrirModal(nombreEspecialidad) {
        // Mostramos un efecto de carga mientras consultamos a la API
        document.getElementById('modalTitulo').innerText = "Cargando " + nombreEspecialidad + "...";
        document.getElementById('especialidadModal').style.display = 'flex';

        // Ocultamos un momento la sección de personal mientras carga
        document.getElementById('contenedorDoctores').innerHTML = '<p style="color:#aaa;">Cargando doctores...</p>';
        document.getElementById('contenedorSecretarios').innerHTML = '<p style="color:#aaa;">Cargando secretarios...</p>';

        // Realizamos la solicitud al Backend
        fetch(`http://localhost:3000/api/especialidades/${nombreEspecialidad}`)
            .then(respuesta => {
                if (!respuesta.ok) throw new Error("No se pudo obtener datos del servidor");
                return respuesta.json();
            })
            .then(datos => {
                this.renderizarModal(nombreEspecialidad, datos);
            })
            .catch(error => {
                console.error(error);
                document.getElementById('modalTitulo').innerText = "Área en mantenimiento / No disponible";
                document.getElementById('modalDescripcion').innerText = "No se pudo conectar con el servidor (¿Está encendido el Backend?) o esta área aún no tiene personal asignado.";
                document.getElementById('contenedorDoctores').innerHTML = '<p style="color:#aaa; font-size:13px;">No disponible.</p>';
                document.getElementById('contenedorSecretarios').innerHTML = '<p style="color:#aaa; font-size:13px;">No disponible.</p>';
                
                const btnAgendar = document.getElementById('btnAgendarCita');
                if (btnAgendar) {
                    btnAgendar.href = '#';
                    btnAgendar.style.pointerEvents = 'none';
                    btnAgendar.style.opacity = '0.5';
                }
            });
    }

    renderizarModal(nombreEspecialidad, datos) {
        // Título e info principal
        document.getElementById('modalTitulo').innerText = nombreEspecialidad;
        document.getElementById('modalDescripcion').innerText = datos.descripcion;

        const btnAgendar = document.getElementById('btnAgendarCita');
        if (btnAgendar) {
            btnAgendar.href = `RegistrarCita.html?especialidad=${encodeURIComponent(nombreEspecialidad)}`;
            btnAgendar.style.pointerEvents = 'auto';
            btnAgendar.style.opacity = '1';
            btnAgendar.innerText = '➜ Agendar cita para esta área';

            // Comprobar si el paciente ya tiene una cita activa
            const sesionStr = localStorage.getItem('usuarioActivo');
            if (sesionStr) {
                const usuario = JSON.parse(sesionStr);
                if (usuario.rol === 'Paciente') {
                    fetch(`http://localhost:3000/api/pacientes/${usuario.id}/citas`)
                        .then(res => res.json())
                        .then(citasUsuario => {
                            if (Array.isArray(citasUsuario)) {
                                // Verifica si hay CUALQUIER cita registrada previamente por este usuario
                                const tieneActiva = citasUsuario.length > 0;
                                if (tieneActiva) {
                                    btnAgendar.href = '#';
                                    btnAgendar.style.pointerEvents = 'none';
                                    btnAgendar.style.opacity = '0.5';
                                    btnAgendar.innerText = 'Ya tienes una cita registrada';
                                    btnAgendar.title = 'Solo puedes consultar tu cita actual. No puedes registrar más de una.';
                                }
                            }
                        })
                        .catch(err => console.error("Error comprobando citas activas:", err));
                }
            }
        }

        // Limpiamos los contenedores de perfiles
        const contDoctores = document.getElementById('contenedorDoctores');
        const contSecretarios = document.getElementById('contenedorSecretarios');
        contDoctores.innerHTML = '';
        contSecretarios.innerHTML = '';

        // Renderizado Dinámico Orientado a Objetos: Doctores
        if (datos.doctores && datos.doctores.length > 0) {
            datos.doctores.forEach(doc => {
                contDoctores.innerHTML += `
                    <div class="perfil-card">
                        <img src="${doc.fotoUrl}" alt="Doctor" class="perfil-img">
                        <div class="perfil-info">
                            <a href="perfil.html?id=${doc.id}" class="perfil-link">Dr/a. ${doc.nombre} ${doc.apellido}</a>
                            <span class="perfil-rol">${doc.rol}</span>
                        </div>
                    </div>`;
            });
        } else {
            contDoctores.innerHTML = '<p style="color:#aaa; font-size:13px;">No hay especialistas asignados.</p>';
        }

        // Renderizado Dinámico Orientado a Objetos: Secretarios
        if (datos.secretarios && datos.secretarios.length > 0) {
            datos.secretarios.forEach(sec => {
                contSecretarios.innerHTML += `
                    <div class="perfil-card">
                        <img src="${sec.fotoUrl}" alt="Secretario" class="perfil-img">
                        <div class="perfil-info">
                            <a href="perfil.html?id=${sec.id}" class="perfil-link">${sec.nombre} ${sec.apellido}</a>
                            <span class="perfil-rol">${sec.rol}</span>
                        </div>
                    </div>`;
            });
        } else {
            contSecretarios.innerHTML = '<p style="color:#aaa; font-size:13px;">No hay secretarios asignados en esta área.</p>';
        }
    }

    cerrarModal() {
        document.getElementById('especialidadModal').style.display = 'none';
    }
}

// Instanciamos y lo guardamos a nivel global para que el HTML pueda llamar sus métodos en los clicks
const menuCitasView = new MenuCitasView();