const fs = require('fs');
const path = require('path');
const Paciente = require('../Model/Paciente');
const UsuarioStore = require('../utils/UsuarioStore');

const rutaEspecialidades = path.join(__dirname, '../especialidades.json');

class AdminController {
    static registroPersonal(req, res) {
        const { creadorId, creadorRol, id, nombre, apellido, correo, contrasena, rol, especialidad, areaAsignada, rolDetalle } = req.body;

        if (!creadorId || creadorRol !== 'Administrador') {
            return res.status(403).json({ error: 'Acceso denegado. Solo administradores autorizados pueden registrar personal.' });
        }

        if (!id || !nombre || !apellido || !correo || !contrasena || !rol) {
            return res.status(400).json({ error: 'Debe completar todos los datos básicos requeridos.' });
        }

        const sId = id.toString().trim();
        const sNombre = UsuarioStore.sanitizar(nombre.trim());
        const sApellido = UsuarioStore.sanitizar(apellido.trim());
        const sCorreo = UsuarioStore.sanitizar(correo.trim().toLowerCase());
        const sContraCifrada = UsuarioStore.cifrarPassword(contrasena);

        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(sCorreo)) {
            return res.status(400).json({ error: 'El correo electrónico tiene un formato inválido.' });
        }

        const regexCedula = /^\d{8,}$/;
        if (!regexCedula.test(sId)) {
            return res.status(400).json({ error: 'La cédula/ID debe contener únicamente números y tener al menos 8 dígitos.' });
        }

        if (UsuarioStore.correoExisteGlobal(sCorreo)) {
            return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
        }

        if (UsuarioStore.idExisteGlobal(sId)) {
            return res.status(400).json({ error: 'La cédula/ID ya está registrada.' });
        }

        const pacientes = UsuarioStore.leerPacientes();
        const personal = UsuarioStore.leerPersonal();
        const admins = UsuarioStore.leerAdmins();

        if (rol === 'Especialista') {
            if (!especialidad) {
                return res.status(400).json({ error: 'Debe seleccionar una especialidad para el doctor.' });
            }
            const sEspec = UsuarioStore.sanitizar(especialidad.trim());
            const sRolClinico = rolDetalle ? UsuarioStore.sanitizar(rolDetalle.trim()) : 'Médico Titular';
            const coloresMap = {
                Cardiología: '2F4F4F',
                Pediatría: 'B22222',
                Dermatología: '008000',
                Odontología: '4682B4',
                Neurología: '696969'
            };
            const color = coloresMap[sEspec] || '4682B4';

            personal.especialistas.push({
                id: Number(sId),
                nombre: sNombre,
                apellido: sApellido,
                correo: sCorreo,
                contrasena: contrasena,
                especialidad: sEspec,
                rol: sRolClinico,
                color,
                fotoUrl: `https://ui-avatars.com/api/?name=${sNombre}+${sApellido}&background=${color}&color=fff`
            });
            UsuarioStore.guardarPersonal(personal);
        } else if (rol === 'Secretario') {
            if (!areaAsignada) {
                return res.status(400).json({ error: 'Debe seleccionar un área asignada para el secretario.' });
            }
            const sArea = UsuarioStore.sanitizar(areaAsignada.trim());
            const sRolAdmin = rolDetalle ? UsuarioStore.sanitizar(rolDetalle.trim()) : 'Recepción Dpto.';

            personal.secretarios.push({
                id: Number(sId),
                nombre: sNombre,
                apellido: sApellido,
                correo: sCorreo,
                contrasena: contrasena,
                areaAsignada: sArea,
                rol: sRolAdmin,
                color: '4682B4',
                fotoUrl: `https://ui-avatars.com/api/?name=${sNombre}+${sApellido}&background=4682B4&color=fff`
            });
            UsuarioStore.guardarPersonal(personal);
        } else if (rol === 'Administrador') {
            admins.push({
                id: sId,
                nombre: sNombre,
                apellido: sApellido,
                correo: sCorreo,
                contrasena: contrasena,
                rol: 'Administrador'
            });
            UsuarioStore.guardarAdmins(admins);
        } else if (rol === 'Paciente') {
            pacientes.push(new Paciente(sId, sNombre, sApellido, sCorreo, sContraCifrada));
            UsuarioStore.guardarPacientes(pacientes);
        } else {
            return res.status(400).json({ error: 'El rol seleccionado no es válido.' });
        }

        console.log(`[Admin] Registro de personal (${rol}) exitoso. Creado por Admin ID: ${creadorId}.`);

        return res.status(201).json({
            mensaje: `El personal con rol de ${rol} fue registrado exitosamente en el sistema.`
        });
    }

    static listarEspecialidades(req, res) {
        try {
            const data = JSON.parse(fs.readFileSync(rutaEspecialidades, 'utf8'));
            return res.json(Object.keys(data));
        } catch {
            return res.json([]);
        }
    }

    static crearEspecialidad(req, res) {
        const { creadorRol, nombre, codigo, ubicacion, horario, descripcion } = req.body;

        if (creadorRol !== 'Administrador') {
            return res.status(403).json({ error: 'Acceso denegado.' });
        }

        if (!nombre || !codigo || !ubicacion || !horario || !descripcion) {
            return res.status(400).json({ error: 'Todos los campos de la especialidad son obligatorios.' });
        }

        const nombreLimpio = UsuarioStore.sanitizar(nombre.trim());
        let especialidades;

        try {
            especialidades = JSON.parse(fs.readFileSync(rutaEspecialidades, 'utf8'));
        } catch {
            especialidades = {};
        }

        if (especialidades[nombreLimpio]) {
            return res.status(400).json({ error: 'La especialidad ya existe en el catálogo.' });
        }

        especialidades[nombreLimpio] = {
            codigo: UsuarioStore.sanitizar(codigo.trim()),
            ubicacion: UsuarioStore.sanitizar(ubicacion.trim()),
            horario: UsuarioStore.sanitizar(horario.trim()),
            descripcion: UsuarioStore.sanitizar(descripcion.trim()),
            bloquesHorarios: {}
        };

        fs.writeFileSync(rutaEspecialidades, JSON.stringify(especialidades, null, 2), 'utf8');

        return res.status(201).json({
            mensaje: 'Especialidad médica registrada correctamente.',
            especialidad: nombreLimpio
        });
    }

    static modificarPerfilPropio(req, res) {
        const idModificar = String(req.params.id);
        const { modificadoPor, rolModificadoPor, correo } = req.body;

        if (!modificadoPor || rolModificadoPor !== 'Administrador' || String(modificadoPor) !== idModificar) {
            return res.status(403).json({ error: 'Acceso denegado.' });
        }

        const admins = UsuarioStore.leerAdmins();
        const indice = admins.findIndex(a => String(a.id) === idModificar);
        if (indice === -1) {
            return res.status(404).json({ error: 'Administrador no encontrado.' });
        }

        if (correo) {
            admins[indice].correo = UsuarioStore.sanitizar(correo.trim().toLowerCase());
        }
        UsuarioStore.guardarAdmins(admins);

        return res.json({
            mensaje: 'Datos de contacto actualizados de forma inmediata.',
            usuario: { ...admins[indice], rol: 'Administrador' }
        });
    }
}

module.exports = AdminController;
