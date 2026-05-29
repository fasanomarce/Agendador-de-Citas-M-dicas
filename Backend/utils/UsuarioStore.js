const fs = require('fs');
const path = require('path');

const rutaPacientes = path.join(__dirname, '../pacientes.json');
const rutaPersonal = path.join(__dirname, '../personal.json');
const rutaAdmins = path.join(__dirname, '../administradores.json');

class UsuarioStore {
    static leerPacientes() {
        try {
            return JSON.parse(fs.readFileSync(rutaPacientes, 'utf8') || '[]');
        } catch {
            return [];
        }
    }

    static guardarPacientes(pacientes) {
        fs.writeFileSync(rutaPacientes, JSON.stringify(pacientes, null, 2), 'utf8');
    }

    static leerPersonal() {
        try {
            return JSON.parse(fs.readFileSync(rutaPersonal, 'utf8') || '{"especialistas":[],"secretarios":[]}');
        } catch {
            return { especialistas: [], secretarios: [] };
        }
    }

    static guardarPersonal(personal) {
        fs.writeFileSync(rutaPersonal, JSON.stringify(personal, null, 2), 'utf8');
    }

    static leerAdmins() {
        try {
            return JSON.parse(fs.readFileSync(rutaAdmins, 'utf8') || '[]');
        } catch {
            return [];
        }
    }

    static guardarAdmins(admins) {
        fs.writeFileSync(rutaAdmins, JSON.stringify(admins, null, 2), 'utf8');
    }

    static cifrarPassword(password) {
        return Buffer.from(password).toString('base64');
    }

    static sanitizar(str) {
        if (typeof str !== 'string') return str;
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    static correoExisteGlobal(correo, excluirId = null) {
        const pacientes = UsuarioStore.leerPacientes();
        const personal = UsuarioStore.leerPersonal();
        const admins = UsuarioStore.leerAdmins();
        const excluir = excluirId != null ? String(excluirId) : null;

        return (
            pacientes.some(p => p.correo === correo && String(p.id) !== excluir) ||
            personal.especialistas.some(e => e.correo === correo) ||
            personal.secretarios.some(s => s.correo === correo) ||
            admins.some(a => a.correo === correo)
        );
    }

    static idExisteGlobal(id) {
        const sId = String(id);
        const pacientes = UsuarioStore.leerPacientes();
        const personal = UsuarioStore.leerPersonal();
        const admins = UsuarioStore.leerAdmins();

        return (
            pacientes.some(p => String(p.id) === sId) ||
            personal.especialistas.some(e => String(e.id) === sId) ||
            personal.secretarios.some(s => String(s.id) === sId) ||
            admins.some(a => String(a.id) === sId)
        );
    }

    static buscarPorId(id) {
        const idBuscado = String(id);
        const paciente = UsuarioStore.leerPacientes().find(p => String(p.id) === idBuscado);
        if (paciente) return { tipo: 'paciente', usuario: paciente };

        const personal = UsuarioStore.leerPersonal();
        const especialista = personal.especialistas.find(e => String(e.id) === idBuscado);
        if (especialista) {
            return {
                tipo: 'especialista',
                usuario: {
                    id: especialista.id,
                    nombre: especialista.nombre,
                    apellido: especialista.apellido,
                    correo: especialista.correo,
                    rol: especialista.rol,
                    especialidad: especialista.especialidad,
                    fotoUrl: especialista.fotoUrl
                }
            };
        }

        const secretario = personal.secretarios.find(s => String(s.id) === idBuscado);
        if (secretario) {
            return {
                tipo: 'secretario',
                usuario: {
                    id: secretario.id,
                    nombre: secretario.nombre,
                    apellido: secretario.apellido,
                    correo: secretario.correo,
                    rol: 'Secretario',
                    rolOriginal: secretario.rol,
                    areaAsignada: secretario.areaAsignada,
                    fotoUrl: secretario.fotoUrl
                }
            };
        }

        const admin = UsuarioStore.leerAdmins().find(a => String(a.id) === idBuscado);
        if (admin) {
            return {
                tipo: 'admin',
                usuario: {
                    id: admin.id,
                    nombre: admin.nombre,
                    apellido: admin.apellido,
                    correo: admin.correo,
                    rol: 'Administrador',
                    fotoUrl: `https://ui-avatars.com/api/?name=${admin.nombre}+${admin.apellido}&background=0056b3&color=fff`
                }
            };
        }

        return null;
    }
}

module.exports = UsuarioStore;
