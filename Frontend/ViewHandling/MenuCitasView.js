class MenuCitasView {
    constructor() {
        this.init();
    }

    init() {
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
                document.getElementById('modalHorario').innerText = "N/A";
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
        document.getElementById('modalHorario').innerText = datos.horario;
        document.getElementById('modalDescripcion').innerText = datos.descripcion;

        const btnAgendar = document.getElementById('btnAgendarCita');
        if (btnAgendar) {
            btnAgendar.href = `RegistrarCita.html?especialidad=${encodeURIComponent(nombreEspecialidad)}`;
            btnAgendar.style.pointerEvents = 'auto';
            btnAgendar.style.opacity = '1';
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