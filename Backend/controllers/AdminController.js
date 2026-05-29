const Paciente = require('../Model/Paciente');
const store = require('../utils/usuarioStore');

class AdminController {
    static registrarPersonal(req, res) {
        const { creadorId, creadorRol, id, nombre, apellido, correo, contrasena, rol, especialidad, areaAsignada, rolDetalle } = req.body;

        if (!creadorId || creadorRol !== 'Administrador') {
            return res.status(403).json({
                error: 'Acceso denegado. Solo administradores autorizados pueden registrar personal.'
            });
        }

        if (!id || !nombre || !apellido || !correo || !contrasena || !rol) {
            return res.status(400).json({ error: 'Debe completar todos los datos básicos requeridos.' });
        }

        const sId = id.toString().trim();
        const sNombre = store.sanitizar(nombre.trim());
        const sApellido = store.sanitizar(apellido.trim());
        const sCorreo = store.sanitizar(correo.trim().toLowerCase());
        const sContraCifrada = store.cifrarPassword(contrasena);

        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(sCorreo)) {
            return res.status(400).json({ error: 'El correo electrónico tiene un formato inválido.' });
        }

        const regexCedula = /^\d{8,}$/;
        if (!regexCedula.test(sId)) {
            return res.status(400).json({ error: 'La cédula/ID debe contener únicamente números y tener al menos 8 dígitos.' });
        }

        if (store.correoExisteGlobal(sCorreo)) {
            return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
        }
        if (store.idExisteGlobal(sId)) {
            return res.status(400).json({ error: 'La cédula/ID ya está registrada.' });
        }

        const pacientes = store.leerPacientes();
        const personal = store.leerPersonal();
        const admins = store.leerAdmins();

        if (rol === 'Especialista') {
            if (!especialidad) {
                return res.status(400).json({ error: 'Debe seleccionar una especialidad para el doctor.' });
            }
            const sEspec = store.sanitizar(especialidad.trim());
            const sRolClinico = rolDetalle ? store.sanitizar(rolDetalle.trim()) : 'Médico Titular';
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
            store.guardarPersonal(personal);
        } else if (rol === 'Secretario') {
            if (!areaAsignada) {
                return res.status(400).json({ error: 'Debe seleccionar un área asignada para el secretario.' });
            }
            const sArea = store.sanitizar(areaAsignada.trim());
            const sRolAdmin = rolDetalle ? store.sanitizar(rolDetalle.trim()) : 'Recepción Dpto.';

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
            store.guardarPersonal(personal);
        } else if (rol === 'Administrador') {
            admins.push({
                id: sId,
                nombre: sNombre,
                apellido: sApellido,
                correo: sCorreo,
                contrasena: contrasena,
                rol: 'Administrador'
            });
            store.guardarAdmins(admins);
        } else if (rol === 'Paciente') {
            pacientes.push(new Paciente(sId, sNombre, sApellido, sCorreo, sContraCifrada));
            store.guardarPacientes(pacientes);
        } else {
            return res.status(400).json({ error: 'El rol seleccionado no es válido.' });
        }

        console.log(`[Admin] Registro de personal (${rol}) exitoso. Creado por Admin ID: ${creadorId}.`);

        return res.status(201).json({
            mensaje: `El personal con rol de ${rol} fue registrado exitosamente en el sistema.`
        });
    }

    static listarEspecialidades(req, res) {
        const especialidades = store.leerEspecialidades();
        return res.json(Object.keys(especialidades));
    }

    static agregarEspecialidad(req, res) {
        const { creadorRol, nombre, codigo, ubicacion, horario, descripcion } = req.body;

        if (creadorRol !== 'Administrador') {
            return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden configurar especialidades.' });
        }

        if (!nombre || !codigo || !ubicacion || !horario || !descripcion) {
            return res.status(400).json({ error: 'Complete todos los campos de la especialidad.' });
        }

        const nombreLimpio = store.sanitizar(nombre.trim());
        const especialidades = store.leerEspecialidades();

        if (especialidades[nombreLimpio]) {
            return res.status(400).json({ error: 'Esta especialidad médica ya existe en el sistema.' });
        }

        especialidades[nombreLimpio] = {
            codigo: store.sanitizar(codigo.trim()),
            ubicacion: store.sanitizar(ubicacion.trim()),
            horario: store.sanitizar(horario.trim()),
            descripcion: store.sanitizar(descripcion.trim())
        };

        store.guardarEspecialidades(especialidades);

        return res.status(201).json({
            mensaje: `Especialidad "${nombreLimpio}" registrada correctamente.`,
            especialidad: especialidades[nombreLimpio]
        });
    }
}

module.exports = AdminController;
