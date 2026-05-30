const fs = require('fs');
const path = require('path');

class UsuarioStore {
    constructor() {
        this.rutaPacientes = path.join(__dirname, '../json/pacientes.json');
        this.rutaPersonal = path.join(__dirname, '../json/personal.json');
        this.rutaAdmins = path.join(__dirname, '../json/administradores.json');
        this.rutaEspecialidades = path.join(__dirname, '../json/especialidades.json');
    }

    leerPacientes() {
        try {
            return JSON.parse(fs.readFileSync(this.rutaPacientes, 'utf8') || '[]');
        } catch {
            return [];
        }
    }

    guardarPacientes(pacientes) {
        fs.writeFileSync(this.rutaPacientes, JSON.stringify(pacientes, null, 2), 'utf8');
    }

    leerPersonal() {
        try {
            const data = JSON.parse(fs.readFileSync(this.rutaPersonal, 'utf8') || '{}');
            return {
                especialistas: Array.isArray(data.especialistas) ? data.especialistas : [],
                secretarios: Array.isArray(data.secretarios) ? data.secretarios : []
            };
        } catch {
            return { especialistas: [], secretarios: [] };
        }
    }

    normalizarCorreo(correo) {
        if (!correo || typeof correo !== 'string') return '';
        return correo.trim().toLowerCase();
    }

    contrasenaCoincide(ingresada, almacenada) {
        if (almacenada == null) return false;
        const cifrada = this.cifrarPassword(ingresada);
        return almacenada === cifrada;
    }

    guardarPersonal(personal) {
        fs.writeFileSync(this.rutaPersonal, JSON.stringify(personal, null, 2), 'utf8');
    }

    leerAdmins() {
        try {
            return JSON.parse(fs.readFileSync(this.rutaAdmins, 'utf8') || '[]');
        } catch {
            return [];
        }
    }

    guardarAdmins(admins) {
        fs.writeFileSync(this.rutaAdmins, JSON.stringify(admins, null, 2), 'utf8');
    }

    leerEspecialidades() {
        try {
            return JSON.parse(fs.readFileSync(this.rutaEspecialidades, 'utf8') || '{}');
        } catch {
            return {};
        }
    }

    guardarEspecialidades(especialidades) {
        fs.writeFileSync(this.rutaEspecialidades, JSON.stringify(especialidades, null, 2), 'utf8');
    }

    cifrarPassword(password) {
        return Buffer.from(password).toString('base64');
    }

    sanitizar(str) {
        if (typeof str !== 'string') return str;
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    correoExisteGlobal(correo, excluirId = null) {
        const pacientes = this.leerPacientes();
        const personal = this.leerPersonal();
        const admins = this.leerAdmins();
        const idStr = excluirId != null ? String(excluirId) : null;

        return (
            pacientes.some(p => p.correo === correo && String(p.id) !== idStr) ||
            personal.especialistas.some(e => e.correo === correo) ||
            personal.secretarios.some(s => s.correo === correo) ||
            admins.some(a => a.correo === correo)
        );
    }

    idExisteGlobal(id) {
        const sId = String(id);
        const pacientes = this.leerPacientes();
        const personal = this.leerPersonal();
        const admins = this.leerAdmins();

        return (
            pacientes.some(p => String(p.id) === sId) ||
            personal.especialistas.some(e => String(e.id) === sId) ||
            personal.secretarios.some(s => String(s.id) === sId) ||
            admins.some(a => String(a.id) === sId)
        );
    }
}

module.exports = new UsuarioStore();
