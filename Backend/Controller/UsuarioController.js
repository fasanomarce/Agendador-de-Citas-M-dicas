const fs = require('fs');
const path = require('path');
const Paciente = require('../Model/Paciente');
const Especialista = require('../Model/Especialista');
const Secretario = require('../Model/Secretario');

class UsuarioController {
    static rutaPacientes = path.join(__dirname, '../pacientes.json');
    static rutaPersonal = path.join(__dirname, '../personal.json');
    static rutaAdmins = path.join(__dirname, '../administradores.json');

    // Auxiliar: Leer pacientes
    static leerPacientes() {
        try {
            const data = fs.readFileSync(UsuarioController.rutaPacientes, 'utf8');
            return JSON.parse(data || '[]');
        } catch (e) {
            return [];
        }
    }

    // Auxiliar: Escribir pacientes
    static guardarPacientesList(pacientes) {
        fs.writeFileSync(UsuarioController.rutaPacientes, JSON.stringify(pacientes, null, 2), 'utf8');
    }

    // Auxiliar: Leer personal
    static leerPersonal() {
        try {
            const data = fs.readFileSync(UsuarioController.rutaPersonal, 'utf8');
            return JSON.parse(data || '{"especialistas":[],"secretarios":[]}');
        } catch (e) {
            return { especialistas: [], secretarios: [] };
        }
    }

    // Auxiliar: Escribir personal
    static guardarPersonalList(personal) {
        fs.writeFileSync(UsuarioController.rutaPersonal, JSON.stringify(personal, null, 2), 'utf8');
    }

    // Auxiliar: Leer admins
    static leerAdmins() {
        try {
            const data = fs.readFileSync(UsuarioController.rutaAdmins, 'utf8');
            return JSON.parse(data || '[]');
        } catch (e) {
            return [];
        }
    }

    // Auxiliar: Escribir admins
    static guardarAdminsList(admins) {
        fs.writeFileSync(UsuarioController.rutaAdmins, JSON.stringify(admins, null, 2), 'utf8');
    }

    // Auxiliar: Cifrar contraseña (simple Base64 para simulación de cifrado ISO 25010)
    static cifrarPassword(password) {
        return Buffer.from(password).toString('base64');
    }

    // Auxiliar: Sanitizar strings para prevenir XSS (ISO 25010 Seguridad)
    static sanitizar(str) {
        if (typeof str !== 'string') return str;
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;")
            .replace(/\//g, "&#x2F;");
    }

    // HU-01: REGISTRAR USUARIO (Paciente Público)
    static registroUsuario(req, res) {
        const tInicio = Date.now();
        
        let { id, nombre, apellido, correo, contrasena } = req.body;

        if (!id || !nombre || !apellido || !correo || !contrasena) {
            return res.status(400).json({ error: "Todos los campos obligatorios (nombre, apellido, cédula/ID, correo, contraseña) deben estar llenos." });
        }

        id = id.toString().trim();
        nombre = UsuarioController.sanitizar(nombre.trim());
        apellido = UsuarioController.sanitizar(apellido.trim());
        correo = UsuarioController.sanitizar(correo.trim().toLowerCase());

        // Validar formatos
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(correo)) {
            return res.status(400).json({ error: "El correo electrónico tiene un formato inválido." });
        }

        const regexCedula = /^\d{8,}$/;
        if (!regexCedula.test(id)) {
            return res.status(400).json({ error: "La cédula/ID debe contener únicamente números y tener al menos 8 dígitos." });
        }

        // Validar duplicados globales (Pacientes, Personal, Admins)
        const pacientes = UsuarioController.leerPacientes();
        const personal = UsuarioController.leerPersonal();
        const admins = UsuarioController.leerAdmins();

        const correoExiste = 
            pacientes.some(p => p.correo === correo) ||
            personal.especialistas.some(e => e.correo === correo) ||
            personal.secretarios.some(s => s.correo === correo) ||
            admins.some(a => a.correo === correo);

        if (correoExiste) {
            return res.status(400).json({ error: "El correo electrónico ya se encuentra registrado en el sistema." });
        }

        const idExiste = 
            pacientes.some(p => p.id === id) ||
            personal.especialistas.some(e => String(e.id) === id) ||
            personal.secretarios.some(s => String(s.id) === id) ||
            admins.some(a => String(a.id) === id);

        if (idExiste) {
            return res.status(400).json({ error: "La cédula/ID ya se encuentra registrada en el sistema." });
        }

        // Asignación obligatoria de rol "Paciente"
        const contrasenaCifrada = UsuarioController.cifrarPassword(contrasena);
        const nuevoPaciente = new Paciente(id, nombre, apellido, correo, contrasenaCifrada);

        pacientes.push(nuevoPaciente);
        UsuarioController.guardarPacientesList(pacientes);

        const tFin = Date.now();
        console.log(`[HU-01] Registro público exitoso procesado en ${tFin - tInicio}ms.`);

        return res.status(201).json({
            mensaje: "Usuario registrado exitosamente.",
            usuario: {
                id: nuevoPaciente.id,
                nombre: nuevoPaciente.nombre,
                apellido: nuevoPaciente.apellido,
                correo: nuevoPaciente.correo,
                rol: nuevoPaciente.rol,
                fotoUrl: nuevoPaciente.fotoUrl
            }
        });
    }

    // REGISTRO DE PERSONAL (Opción B: Panel de Administración Seguro)
    static registroPersonal(req, res) {
        const { creadorId, creadorRol, id, nombre, apellido, correo, contrasena, rol, especialidad, areaAsignada, rolDetalle } = req.body;

        // 1. Validar autorización del creador
        if (!creadorId || creadorRol !== 'Administrador') {
            return res.status(403).json({ error: "Acceso denegado. Solo administradores autorizados pueden registrar personal." });
        }

        // 2. Validar campos obligatorios generales
        if (!id || !nombre || !apellido || !correo || !contrasena || !rol) {
            return res.status(400).json({ error: "Debe completar todos los datos básicos requeridos." });
        }

        const sId = id.toString().trim();
        const sNombre = UsuarioController.sanitizar(nombre.trim());
        const sApellido = UsuarioController.sanitizar(apellido.trim());
        const sCorreo = UsuarioController.sanitizar(correo.trim().toLowerCase());
        const sContraCifrada = UsuarioController.cifrarPassword(contrasena);

        // Validar formatos
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(sCorreo)) {
            return res.status(400).json({ error: "El correo electrónico tiene un formato inválido." });
        }

        const regexCedula = /^\d{8,}$/;
        if (!regexCedula.test(sId)) {
            return res.status(400).json({ error: "La cédula/ID debe contener únicamente números y tener al menos 8 dígitos." });
        }

        // 3. Validar duplicados globales
        const pacientes = UsuarioController.leerPacientes();
        const personal = UsuarioController.leerPersonal();
        const admins = UsuarioController.leerAdmins();

        const correoExiste = 
            pacientes.some(p => p.correo === sCorreo) ||
            personal.especialistas.some(e => e.correo === sCorreo) ||
            personal.secretarios.some(s => s.correo === sCorreo) ||
            admins.some(a => a.correo === sCorreo);

        if (correoExiste) {
            return res.status(400).json({ error: "El correo electrónico ya está en uso." });
        }

        const idExiste = 
            pacientes.some(p => p.id === sId) ||
            personal.especialistas.some(e => String(e.id) === sId) ||
            personal.secretarios.some(s => String(s.id) === sId) ||
            admins.some(a => String(a.id) === sId);

        if (idExiste) {
            return res.status(400).json({ error: "La cédula/ID ya está registrada." });
        }

        // 4. Persistir según el rol seleccionado
        if (rol === 'Especialista') {
            if (!especialidad) {
                return res.status(400).json({ error: "Debe seleccionar una especialidad para el doctor." });
            }
            const sEspec = UsuarioController.sanitizar(especialidad.trim());
            const sRolClinico = rolDetalle ? UsuarioController.sanitizar(rolDetalle.trim()) : "Médico Titular";
            
            // Colores por defecto para cada especialidad en el dashboard
            const coloresMap = {
                "Cardiología": "2F4F4F",
                "Pediatría": "B22222",
                "Dermatología": "008000",
                "Odontología": "4682B4",
                "Neurología": "696969"
            };
            const color = coloresMap[sEspec] || "4682B4";

            // Guardar Especialista
            const nuevoDoc = {
                id: Number(sId),
                nombre: sNombre,
                apellido: sApellido,
                correo: sCorreo,
                contrasena: contrasena, // Para consistencia de personal.json se guarda plana
                especialidad: sEspec,
                rol: sRolClinico,
                color: color,
                fotoUrl: `https://ui-avatars.com/api/?name=${sNombre}+${sApellido}&background=${color}&color=fff`
            };

            personal.especialistas.push(nuevoDoc);
            UsuarioController.guardarPersonalList(personal);

        } else if (rol === 'Secretario') {
            if (!areaAsignada) {
                return res.status(400).json({ error: "Debe seleccionar un área asignada para el secretario." });
            }
            const sArea = UsuarioController.sanitizar(areaAsignada.trim());
            const sRolAdmin = rolDetalle ? UsuarioController.sanitizar(rolDetalle.trim()) : "Recepción Dpto.";

            // Guardar Secretario
            const nuevoSec = {
                id: Number(sId),
                nombre: sNombre,
                apellido: sApellido,
                correo: sCorreo,
                contrasena: contrasena, // Guardar plana para personal.json
                areaAsignada: sArea,
                rol: sRolAdmin,
                color: "4682B4",
                fotoUrl: `https://ui-avatars.com/api/?name=${sNombre}+${sApellido}&background=4682B4&color=fff`
            };

            personal.secretarios.push(nuevoSec);
            UsuarioController.guardarPersonalList(personal);

        } else if (rol === 'Administrador') {
            // Guardar Administrador
            const nuevoAdmin = {
                id: sId,
                nombre: sNombre,
                apellido: sApellido,
                correo: sCorreo,
                contrasena: contrasena, // Puede ser plana o cifrada
                rol: "Administrador"
            };

            admins.push(nuevoAdmin);
            UsuarioController.guardarAdminsList(admins);

        } else if (rol === 'Paciente') {
            // Guardar Paciente
            const nuevoPac = new Paciente(sId, sNombre, sApellido, sCorreo, sContraCifrada);
            pacientes.push(nuevoPac);
            UsuarioController.guardarPacientesList(pacientes);
        } else {
            return res.status(400).json({ error: "El rol seleccionado no es válido." });
        }

        console.log(`[Admin] Registro de personal (${rol}) exitoso. Creado por Admin ID: ${creadorId}.`);

        return res.status(201).json({
            mensaje: `El personal con rol de ${rol} fue registrado exitosamente en el sistema.`
        });
    }

    // LOGIN USUARIO (Incluye soporte para Administrador)
    static loginUsuario(req, res) {
        let { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ error: "Debe ingresar el correo y la contraseña." });
        }

        correo = correo.trim().toLowerCase();
        const contrasenaCifrada = UsuarioController.cifrarPassword(contrasena);

        // 1. Buscar en pacientes
        const pacientes = UsuarioController.leerPacientes();
        const pacienteEncontrado = pacientes.find(p => p.correo === correo);

        if (pacienteEncontrado) {
            if (pacienteEncontrado.contrasena === contrasena || pacienteEncontrado.contrasena === contrasenaCifrada) {
                return res.json({
                    id: pacienteEncontrado.id,
                    nombre: pacienteEncontrado.nombre,
                    apellido: pacienteEncontrado.apellido,
                    correo: pacienteEncontrado.correo,
                    telefono: pacienteEncontrado.telefono || '',
                    fotoUrl: pacienteEncontrado.fotoUrl,
                    biografia: pacienteEncontrado.biografia || '',
                    rol: pacienteEncontrado.rol
                });
            }
        }

        // 2. Buscar en personal (Especialistas y Secretarios)
        const personal = UsuarioController.leerPersonal();
        const especialistaEncontrado = personal.especialistas.find(e => e.correo === correo);

        if (especialistaEncontrado && (especialistaEncontrado.contrasena === contrasena || especialistaEncontrado.contrasena === contrasenaCifrada)) {
            return res.json({
                id: especialistaEncontrado.id,
                nombre: especialistaEncontrado.nombre,
                apellido: especialistaEncontrado.apellido,
                correo: especialistaEncontrado.correo,
                rol: especialistaEncontrado.rol || 'Especialista',
                color: especialistaEncontrado.color,
                fotoUrl: especialistaEncontrado.fotoUrl || `https://ui-avatars.com/api/?name=${especialistaEncontrado.nombre}+${especialistaEncontrado.apellido}&background=2f4f4f&color=fff`
            });
        }

        const secretarioEncontrado = personal.secretarios.find(s => s.correo === correo);
        if (secretarioEncontrado && (secretarioEncontrado.contrasena === contrasena || secretarioEncontrado.contrasena === contrasenaCifrada)) {
            return res.json({
                id: secretarioEncontrado.id,
                nombre: secretarioEncontrado.nombre,
                apellido: secretarioEncontrado.apellido,
                correo: secretarioEncontrado.correo,
                rol: 'Secretario',
                rolOriginal: secretarioEncontrado.rol,
                areaAsignada: secretarioEncontrado.areaAsignada,
                fotoUrl: secretarioEncontrado.fotoUrl
            });
        }

        // 3. Buscar en administradores
        const admins = UsuarioController.leerAdmins();
        const adminEncontrado = admins.find(a => a.correo === correo);
        if (adminEncontrado && (adminEncontrado.contrasena === contrasena || adminEncontrado.contrasena === contrasenaCifrada)) {
            return res.json({
                id: adminEncontrado.id,
                nombre: adminEncontrado.nombre,
                apellido: adminEncontrado.apellido,
                correo: adminEncontrado.correo,
                rol: 'Administrador',
                fotoUrl: `https://ui-avatars.com/api/?name=${adminEncontrado.nombre}+${adminEncontrado.apellido}&background=0056b3&color=fff`
            });
        }

        return res.status(401).json({ error: "Credenciales de acceso incorrectas." });
    }

    // OBTENER DETALLES DE USUARIO
    static obtenerUsuario(req, res) {
        const idBuscado = String(req.params.id);

        // 1. Buscar en pacientes
        const pacientes = UsuarioController.leerPacientes();
        const paciente = pacientes.find(p => String(p.id) === idBuscado);
        if (paciente) {
            return res.json(paciente);
        }

        // 2. Buscar en personal
        const personal = UsuarioController.leerPersonal();
        const especialista = personal.especialistas.find(e => String(e.id) === idBuscado);
        if (especialista) {
            return res.json({
                id: especialista.id,
                nombre: especialista.nombre,
                apellido: especialista.apellido,
                correo: especialista.correo,
                rol: especialista.rol,
                especialidad: especialista.especialidad,
                fotoUrl: especialista.fotoUrl || `https://ui-avatars.com/api/?name=${especialista.nombre}+${especialista.apellido}&background=2f4f4f&color=fff`
            });
        }

        const secretario = personal.secretarios.find(s => String(s.id) === idBuscado);
        if (secretario) {
            return res.json({
                id: secretario.id,
                nombre: secretario.nombre,
                apellido: secretario.apellido,
                correo: secretario.correo,
                rol: 'Secretario',
                rolOriginal: secretario.rol,
                areaAsignada: secretario.areaAsignada,
                fotoUrl: secretario.fotoUrl
            });
        }

        // 3. Buscar en admins
        const admins = UsuarioController.leerAdmins();
        const admin = admins.find(a => String(a.id) === idBuscado);
        if (admin) {
            return res.json({
                id: admin.id,
                nombre: admin.nombre,
                apellido: admin.apellido,
                correo: admin.correo,
                rol: 'Administrador',
                fotoUrl: `https://ui-avatars.com/api/?name=${admin.nombre}+${admin.apellido}&background=0056b3&color=fff`
            });
        }

        return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // HU-02: MODIFICAR USUARIO / DATOS DE CONTACTO
    static modificarUsuario(req, res) {
        const idModificar = String(req.params.id);
        const { modificadoPor, rolModificadoPor, telefono, correo, fotoUrl, biografia, nombre, apellido } = req.body;

        if (!modificadoPor || !rolModificadoPor) {
            return res.status(403).json({ error: "Acceso denegado. Información de autorización faltante." });
        }

        // Regla 1: Un Paciente solo puede modificar sus propios datos
        if (rolModificadoPor === 'Paciente' && String(modificadoPor) !== idModificar) {
            return res.status(403).json({ error: "Acceso denegado. No tiene autorización." });
        }

        // Regla 2: El Secretario puede modificar pacientes
        const pacientes = UsuarioController.leerPacientes();
        const indicePaciente = pacientes.findIndex(p => String(p.id) === idModificar);

        if (indicePaciente === -1) {
            // Si no es un paciente, tal vez sea el Secretario o Administrador modificándose a sí mismo
            const personal = UsuarioController.leerPersonal();
            const admins = UsuarioController.leerAdmins();

            const secIndice = personal.secretarios.findIndex(s => String(s.id) === idModificar);
            if (secIndice !== -1 && String(modificadoPor) === idModificar) {
                const sec = personal.secretarios[secIndice];
                sec.correo = correo ? UsuarioController.sanitizar(correo.trim().toLowerCase()) : sec.correo;
                sec.fotoUrl = fotoUrl ? String(fotoUrl).trim() : sec.fotoUrl;
                personal.secretarios[secIndice] = sec;
                UsuarioController.guardarPersonalList(personal);
                return res.json({ mensaje: "Datos de contacto actualizados de forma inmediata.", usuario: sec });
            }

            const adminIndice = admins.findIndex(a => String(a.id) === idModificar);
            if (adminIndice !== -1 && String(modificadoPor) === idModificar) {
                const admin = admins[adminIndice];
                admin.correo = correo ? UsuarioController.sanitizar(correo.trim().toLowerCase()) : admin.correo;
                admins[adminIndice] = admin;
                UsuarioController.guardarAdminsList(admins);
                return res.json({ mensaje: "Datos de contacto actualizados de forma inmediata.", usuario: admin });
            }

            return res.status(404).json({ error: "El usuario a modificar no existe o no tiene permisos de edición propia." });
        }

        const pacienteOriginal = pacientes[indicePaciente];

        // Sanitización
        const nuevoTelefono = telefono ? UsuarioController.sanitizar(String(telefono).trim()) : pacienteOriginal.telefono;
        let nuevoCorreo = correo ? UsuarioController.sanitizar(String(correo).trim().toLowerCase()) : pacienteOriginal.correo;
        const nuevaFoto = fotoUrl ? String(fotoUrl).trim() : pacienteOriginal.fotoUrl;
        const nuevaBio = biografia !== undefined ? UsuarioController.sanitizar(String(biografia).trim()) : pacienteOriginal.biografia;

        // Si el modificador es Secretario o Admin, puede cambiar nombres
        const nuevoNombre = ((rolModificadoPor === 'Secretario' || rolModificadoPor === 'Administrador') && nombre) ? UsuarioController.sanitizar(nombre.trim()) : pacienteOriginal.nombre;
        const nuevoApellido = ((rolModificadoPor === 'Secretario' || rolModificadoPor === 'Administrador') && apellido) ? UsuarioController.sanitizar(apellido.trim()) : pacienteOriginal.apellido;

        // Validaciones
        if (correo) {
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(nuevoCorreo)) {
                return res.status(400).json({ error: "El correo electrónico tiene un formato inválido." });
            }
        }

        if (telefono) {
            const regexTelefono = /^\d{7,15}$/;
            if (!regexTelefono.test(nuevoTelefono.replace(/[\s-+()]/g, ''))) {
                return res.status(400).json({ error: "El número telefónico debe contener únicamente dígitos válidos." });
            }
        }

        // Regla 3: Si se modifica el correo, validar unicidad
        if (nuevoCorreo !== pacienteOriginal.correo) {
            const personal = UsuarioController.leerPersonal();
            const admins = UsuarioController.leerAdmins();
            
            const correoExiste = 
                pacientes.some(p => p.correo === nuevoCorreo && String(p.id) !== idModificar) ||
                personal.especialistas.some(e => e.correo === nuevoCorreo) ||
                personal.secretarios.some(s => s.correo === nuevoCorreo) ||
                admins.some(a => a.correo === nuevoCorreo);

            if (correoExiste) {
                return res.status(400).json({ error: "El nuevo correo electrónico ya está registrado por otro usuario." });
            }
        }

        pacienteOriginal.telefono = nuevoTelefono;
        pacienteOriginal.correo = nuevoCorreo;
        pacienteOriginal.fotoUrl = nuevaFoto || `https://ui-avatars.com/api/?name=${nuevoNombre}+${nuevoApellido}&background=28a745&color=fff`;
        pacienteOriginal.biografia = nuevaBio;
        pacienteOriginal.nombre = nuevoNombre;
        pacienteOriginal.apellido = nuevoApellido;

        pacientes[indicePaciente] = pacienteOriginal;
        UsuarioController.guardarPacientesList(pacientes);

        return res.json({
            mensaje: "Datos actualizados exitosamente de forma inmediata.",
            usuario: {
                id: pacienteOriginal.id,
                nombre: pacienteOriginal.nombre,
                apellido: pacienteOriginal.apellido,
                correo: pacienteOriginal.correo,
                telefono: pacienteOriginal.telefono,
                fotoUrl: pacienteOriginal.fotoUrl,
                biografia: pacienteOriginal.biografia,
                rol: pacienteOriginal.rol
            }
        });
    }

    // LISTAR PACIENTES
    static listarPacientes(req, res) {
        const pacientes = UsuarioController.leerPacientes();
        const pacientesLimpios = pacientes.map(p => ({
            id: p.id,
            nombre: p.nombre,
            apellido: p.apellido,
            correo: p.correo,
            telefono: p.telefono || '',
            fotoUrl: p.fotoUrl,
            biografia: p.biografia || '',
            rol: p.rol
        }));
        return res.json(pacientesLimpios);
    }
}

module.exports = UsuarioController;
