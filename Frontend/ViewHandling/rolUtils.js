/** Utilidades de rol para redirección y control de acceso en el cliente */
function esEspecialista(usuario) {
    if (!usuario) return false;
    if (usuario.rol === 'Especialista' || usuario.especialidad) return true;
    const rolesSistema = ['Paciente', 'Secretario', 'Administrador'];
    if (usuario.rol && !rolesSistema.includes(usuario.rol) && !usuario.areaAsignada) {
        return true;
    }
    return false;
}

function esSecretario(usuario) {
    if (!usuario) return false;
    return usuario.rol === 'Secretario' || !!usuario.areaAsignada;
}

function destinoInicioSesion(usuario) {
    if (!usuario) return 'login.html';
    if (usuario.rol === 'Paciente') return 'MenuCitas.html';
    if (usuario.rol === 'Administrador') return 'PerfilAdmin.html';
    if (esSecretario(usuario)) return 'PerfilSecretario.html';
    if (esEspecialista(usuario)) return 'PerfilEspecialista.html';
    return 'MenuCitas.html';
}
