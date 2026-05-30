const Paciente = require('../Model/Paciente');
const Especialidad = require('../Model/Especialidad');
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

    static listarDoctores(req, res) {
        const personal = store.leerPersonal();
        const doctores = personal.especialistas.map(esp => ({
            id: esp.id,
            nombre: esp.nombre,
            apellido: esp.apellido,
            especialidad: esp.especialidad
        }));
        return res.json(doctores);
    }

    static agregarEspecialidad(req, res) {
        // 1. Extraemos TODOS los datos (¡incluyendo doctoresAsignados!)
        const { creadorRol, nombre, codigo, ubicacion, horario, descripcion, doctoresAsignados } = req.body;

        if (creadorRol !== 'Administrador') {
            return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden configurar especialidades.' });
        }

        // 2. Instanciamos la clase Modelo
        const nuevaEspecialidad = new Especialidad(
            nombre ? store.sanitizar(nombre.trim()) : null,
            codigo ? store.sanitizar(codigo.trim()) : null,
            ubicacion ? store.sanitizar(ubicacion.trim()) : null,
            horario ? store.sanitizar(horario.trim()) : null,
            descripcion ? store.sanitizar(descripcion.trim()) : null,
            doctoresAsignados || []
        );

        // 3. Validación interna del objeto
        if (!nuevaEspecialidad.esValida()) {
            return res.status(400).json({ error: 'Complete todos los campos de la especialidad.' });
        }

        const especialidades = store.leerEspecialidades();
        if (especialidades[nuevaEspecialidad.nombre]) {
            return res.status(400).json({ error: 'Esta especialidad médica ya existe en el sistema.' });
        }

        // 4. Regla de Negocio (ERS): Obligatorio un doctor
        if (nuevaEspecialidad.doctoresAsignados.length === 0) {
            return res.status(400).json({ error: 'Debe asignar al menos un especialista a esta área.' });
        }

        // 5. Guardar
        especialidades[nuevaEspecialidad.nombre] = {
            codigo: nuevaEspecialidad.codigo,
            ubicacion: nuevaEspecialidad.ubicacion,
            horario: nuevaEspecialidad.horario,
            descripcion: nuevaEspecialidad.descripcion,
            doctoresAsignados: nuevaEspecialidad.doctoresAsignados
        };

        store.guardarEspecialidades(especialidades);

        return res.status(201).json({
            mensaje: `Especialidad "${nuevaEspecialidad.nombre}" registrada correctamente.`,
            especialidad: especialidades[nuevaEspecialidad.nombre]
        });
    }

    static obtenerMiPerfil(req, res) {
        const id = String(req.params.id);
        const admins = store.leerAdmins();
        const admin = admins.find(a => String(a.id) === id);
        if (!admin) {
            return res.status(404).json({ error: 'Administrador no encontrado.' });
        }
        return res.json({
            id: admin.id,
            nombre: admin.nombre,
            apellido: admin.apellido,
            correo: admin.correo,
            rol: 'Administrador',
            fotoUrl: `https://ui-avatars.com/api/?name=${admin.nombre}+${admin.apellido}&background=0056b3&color=fff`
        });
    }

    static actualizarMiPerfil(req, res) {
        const id = String(req.params.id);
        const { modificadoPor, correo } = req.body;

        if (!modificadoPor || String(modificadoPor) !== id) {
            return res.status(403).json({ error: 'Solo puede modificar su propio perfil.' });
        }

        const admins = store.leerAdmins();
        const indice = admins.findIndex(a => String(a.id) === id);
        if (indice === -1) {
            return res.status(404).json({ error: 'Administrador no encontrado.' });
        }

        const admin = admins[indice];
        const nuevoCorreo = correo ? store.sanitizar(String(correo).trim().toLowerCase()) : admin.correo;

        if (correo) {
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(nuevoCorreo)) {
                return res.status(400).json({ error: 'El correo electrónico tiene un formato inválido.' });
            }
            if (nuevoCorreo !== admin.correo && store.correoExisteGlobal(nuevoCorreo, id)) {
                return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
            }
        }

        admin.correo = nuevoCorreo;
        admins[indice] = admin;
        store.guardarAdmins(admins);

        return res.json({
            mensaje: 'Datos de contacto actualizados de forma inmediata.',
            usuario: {
                id: admin.id,
                nombre: admin.nombre,
                apellido: admin.apellido,
                correo: admin.correo,
                rol: 'Administrador',
                fotoUrl: `https://ui-avatars.com/api/?name=${admin.nombre}+${admin.apellido}&background=0056b3&color=fff`
            }
        });
    }
}

module.exports = AdminController;
