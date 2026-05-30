const API_BASE = 'http://localhost:3000/api';

class ConsultarCitasView {
    constructor() {
        this.usuarioActivo = null;
        this.esSecretario = false;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            const sesion = localStorage.getItem('usuarioActivo');
            if (!sesion) {
                window.location.href = 'login.html';
                return;
            }

            this.usuarioActivo = JSON.parse(sesion);
            const rol = obtenerRolCanonico(this.usuarioActivo);

            // Permitir acceso a Paciente, Secretario y Administrador
            if (rol !== 'Paciente' && rol !== 'Secretario' && rol !== 'Administrador') {
                window.location.href = destinoInicioSesion(this.usuarioActivo);
                return;
            }

            // Tratamos a Administrador igual que Secretario en esta vista (ve todas las citas)
            this.esSecretario = (rol === 'Secretario' || rol === 'Administrador');
            this.configurarVista();
            this.solicitarCitasAlServidor();
        });
    }

    configurarVista() {
        const titulo = document.getElementById('tituloConsulta');
        const subtitulo = document.getElementById('subtituloConsulta');
        const nav = document.getElementById('mainNav')?.querySelector('.nav__list');
        const rol = obtenerRolCanonico(this.usuarioActivo);

        if (rol === 'Secretario') {
            if (titulo) titulo.innerText = 'Todas las Citas del Sistema';
            if (subtitulo) subtitulo.innerText = 'Vista operativa: consulte el detalle de todas las citas registradas.';
            if (nav) {
                nav.innerHTML = `
                    <li class="nav__item"><a href="PerfilSecretario.html" class="nav__link">Operaciones</a></li>
                    <li class="nav__item"><a href="Perfil.html" class="nav__link">Mi Perfil</a></li>
                    <li class="nav__item"><a href="ConsultarCitas.html" class="nav__link" style="background:rgba(255,255,255,0.3)">Consultar Citas</a></li>`;
            }
        } else if (rol === 'Administrador') {
            if (titulo) titulo.innerText = 'Todas las Citas del Sistema';
            if (subtitulo) subtitulo.innerText = 'Vista operativa: consulte el detalle de todas las citas registradas.';
            if (nav) {
                nav.innerHTML = `
                    <li class="nav__item"><a href="MenuCitas.html" class="nav__link">Menú Principal</a></li>
                    <li class="nav__item"><a href="ConsultarCitas.html" class="nav__link" style="background:rgba(255,255,255,0.3)">Consultar Citas</a></li>
                    <li class="nav__item"><a href="PerfilAdmin.html" class="nav__link">Administración</a></li>
                    <li class="nav__item"><a href="Perfil.html" class="nav__link">Mi Perfil</a></li>`;
            }
        } else if (nav) {
            // Paciente u otros roles permitidos
            nav.innerHTML = `
                <li class="nav__item"><a href="MenuCitas.html" class="nav__link">Menú Principal</a></li>
                <li class="nav__item"><a href="Perfil.html" class="nav__link">Mi Perfil</a></li>
                <li class="nav__item"><a href="ConsultarCitas.html" class="nav__link" style="background:rgba(255,255,255,0.3)">Consultar Citas</a></li>`;
        }
    }

    solicitarCitasAlServidor() {
        const rol = obtenerRolCanonico(this.usuarioActivo);
        let url;
        if (rol === 'Administrador') {
            url = `${API_BASE}/admin/citas?adminId=${encodeURIComponent(this.usuarioActivo.id)}`;
        } else if (this.esSecretario) {
            url = `${API_BASE}/secretario/citas?secretarioId=${encodeURIComponent(this.usuarioActivo.id)}`;
        } else {
            url = `${API_BASE}/pacientes/${encodeURIComponent(this.usuarioActivo.id)}/citas`;
        }

        fetch(url)
            .then(respuesta => {
                if (!respuesta.ok) throw new Error('Servidor no responde correctamente');
                return respuesta.json();
            })
            .then(citas => this.mostrarCitas(Array.isArray(citas) ? citas : []))
            .catch(error => {
                console.error('Error de conexión:', error);
                const contenedor = document.getElementById('contenedorCitas');
                if (contenedor) {
                    contenedor.innerHTML = '<p class="mensaje-error">Error de conexión con el servidor. Asegúrate de iniciarlo.</p>';
                }
            });
    }

    mostrarCitas(citas) {
        const contenedor = document.getElementById('contenedorCitas');
        if (!contenedor) return;

        contenedor.innerHTML = '';

        if (!citas || citas.length === 0) {
            const msg = this.esSecretario
                ? 'No hay citas registradas en el sistema.'
                : 'No has reservado ninguna cita.';
            contenedor.innerHTML = `<p id="mensajeVacio" class="mensaje-vacio">${msg}</p>`;
            return;
        }

        citas.forEach(cita => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'cita-card';

            const estado = cita.estado || 'pendiente';
            tarjeta.innerHTML = `
                <h3 class="cita-card-titulo">Cita con ${cita.doctor}</h3>
                ${this.esSecretario ? `<p><strong>Paciente:</strong> ${cita.nombre} ${cita.apellido}</p>` : ''}
                <p><strong>Fecha:</strong> ${cita.fecha}</p>
                <p><strong>Hora:</strong> ${cita.hora}</p>
                <p><strong>Estado:</strong> ${estado}</p>
                <p><strong>Motivo / Comentarios:</strong> ${cita.motivo || '—'}</p>
            `;

            contenedor.appendChild(tarjeta);
        });
    }
}

new ConsultarCitasView();
