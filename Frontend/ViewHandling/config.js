const API_BASE = 'http://localhost:3000/api';

function normalizarRol(usuario) {
    if (!usuario) return null;
    const rol = String(usuario.rol || '').trim();

    if (['Paciente', 'Secretario', 'Especialista', 'Administrador'].includes(rol)) {
        return rol;
    }
    if (usuario.areaAsignada || /recepci|secretar|asistente/i.test(rol)) {
        return 'Secretario';
    }
    if (usuario.especialidad || /médico|medico|doctor|titular|neuro|odont/i.test(rol)) {
        return 'Especialista';
    }
    if (/admin/i.test(rol)) {
        return 'Administrador';
    }
    return 'Paciente';
}

function obtenerSesion() {
    const raw = localStorage.getItem('usuarioActivo');
    if (!raw) return null;
    try {
        const usuario = JSON.parse(raw);
        usuario.rol = normalizarRol(usuario);
        return usuario;
    } catch {
        return null;
    }
}

function guardarSesion(usuario) {
    const normalizado = { ...usuario, rol: normalizarRol(usuario) };
    localStorage.setItem('usuarioActivo', JSON.stringify(normalizado));
    return normalizado;
}

function exigirSesion() {
    const sesion = obtenerSesion();
    if (!sesion) {
        window.location.href = 'login.html';
        return null;
    }
    return sesion;
}

function perfilUrlPorRol(rol) {
    const rolCanonico = normalizarRol({ rol });
    const mapa = {
        Paciente: 'PerfilPaciente.html',
        Secretario: 'PerfilSecretario.html',
        Especialista: 'PerfilEspecialista.html',
        Administrador: 'PerfilAdmin.html'
    };
    return mapa[rolCanonico] || 'PerfilPaciente.html';
}

function destinoTrasLogin(usuario) {
    const rol = normalizarRol(usuario);
    const mapa = {
        Paciente: 'MenuCitas.html',
        Secretario: 'PerfilSecretario.html',
        Especialista: 'PerfilEspecialista.html',
        Administrador: 'PerfilAdmin.html'
    };
    return mapa[rol] || 'MenuCitas.html';
}

function redirigirPerfilPorRol() {
    const sesion = exigirSesion();
    if (!sesion) return;
    window.location.replace(perfilUrlPorRol(sesion.rol));
}

function alListo(fn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
}

function mostrarToast(elemento, mensaje, esError = false) {
    if (!elemento) return;
    elemento.innerText = mensaje;
    elemento.className = esError ? 'toast-notificacion error' : 'toast-notificacion';
    elemento.style.display = 'flex';
    setTimeout(() => {
        elemento.style.display = 'none';
    }, 5000);
}
