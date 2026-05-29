const fs = require('fs');
const path = require('path');

const rutaPacientes = path.join(__dirname, '../pacientes.json');
const rutaPersonal = path.join(__dirname, '../personal.json');
const rutaAdmins = path.join(__dirname, '../administradores.json');
const rutaEspecialidades = path.join(__dirname, '../especialidades.json');

function leerPacientes() {
    try {
        return JSON.parse(fs.readFileSync(rutaPacientes, 'utf8') || '[]');
    } catch {
        return [];
    }
}

function guardarPacientes(pacientes) {
    fs.writeFileSync(rutaPacientes, JSON.stringify(pacientes, null, 2), 'utf8');
}

function leerPersonal() {
    try {
        return JSON.parse(fs.readFileSync(rutaPersonal, 'utf8') || '{"especialistas":[],"secretarios":[]}');
    } catch {
        return { especialistas: [], secretarios: [] };
    }
}

function guardarPersonal(personal) {
    fs.writeFileSync(rutaPersonal, JSON.stringify(personal, null, 2), 'utf8');
}

function leerAdmins() {
    try {
        return JSON.parse(fs.readFileSync(rutaAdmins, 'utf8') || '[]');
    } catch {
        return [];
    }
}

function guardarAdmins(admins) {
    fs.writeFileSync(rutaAdmins, JSON.stringify(admins, null, 2), 'utf8');
}

function leerEspecialidades() {
    try {
        return JSON.parse(fs.readFileSync(rutaEspecialidades, 'utf8') || '{}');
    } catch {
        return {};
    }
}

function guardarEspecialidades(especialidades) {
    fs.writeFileSync(rutaEspecialidades, JSON.stringify(especialidades, null, 2), 'utf8');
}

function cifrarPassword(password) {
    return Buffer.from(password).toString('base64');
}

function sanitizar(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

function correoExisteGlobal(correo, excluirId = null) {
    const pacientes = leerPacientes();
    const personal = leerPersonal();
    const admins = leerAdmins();
    const idStr = excluirId != null ? String(excluirId) : null;

    return (
        pacientes.some(p => p.correo === correo && String(p.id) !== idStr) ||
        personal.especialistas.some(e => e.correo === correo) ||
        personal.secretarios.some(s => s.correo === correo) ||
        admins.some(a => a.correo === correo)
    );
}

function idExisteGlobal(id) {
    const sId = String(id);
    const pacientes = leerPacientes();
    const personal = leerPersonal();
    const admins = leerAdmins();

    return (
        pacientes.some(p => String(p.id) === sId) ||
        personal.especialistas.some(e => String(e.id) === sId) ||
        personal.secretarios.some(s => String(s.id) === sId) ||
        admins.some(a => String(a.id) === sId)
    );
}

module.exports = {
    leerPacientes,
    guardarPacientes,
    leerPersonal,
    guardarPersonal,
    leerAdmins,
    guardarAdmins,
    leerEspecialidades,
    guardarEspecialidades,
    cifrarPassword,
    sanitizar,
    correoExisteGlobal,
    idExisteGlobal
};
