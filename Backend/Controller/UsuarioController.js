const fs = require('fs');
const path = require('path');
const Paciente = require('../Model/Paciente');

class UsuarioController {
    static rutaPacientes = path.join(__dirname, '../pacientes.json');
    static rutaPersonal = path.join(__dirname, '../personal.json');

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

    // HU-01: REGISTRAR USUARIO
    static registroUsuario(req, res) {
        const tInicio = Date.now(); // Para medir tiempo de respuesta
        
        let { id, nombre, apellido, correo, contrasena } = req.body;

        // 1. Validar campos obligatorios
        if (!id || !nombre || !apellido || !correo || !contrasena) {
            return res.status(400).json({ error: "Todos los campos obligatorios (nombre, apellido, cédula/ID, correo, contraseña) deben estar llenos." });
        }

        // Sanitización
        id = id.toString().trim();
        nombre = UsuarioController.sanitizar(nombre.trim());
        apellido = UsuarioController.sanitizar(apellido.trim());
        correo = UsuarioController.sanitizar(correo.trim().toLowerCase());

        // 2. Validar formatos (ISO 25010 Fiabilidad)
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(correo)) {
            return res.status(400).json({ error: "El correo electrónico tiene un formato inválido." });
        }

        const regexCedula = /^\d{8,}$/; // Solo números, mín 8
        if (!regexCedula.test(id)) {
            return res.status(400).json({ error: "La cédula/ID debe contener únicamente números y tener al menos 8 dígitos." });
        }

        // 3. Validar correo y cédula duplicados
        const pacientes = UsuarioController.leerPacientes();
        const personal = UsuarioController.leerPersonal();

        // Verificar si el correo ya existe en pacientes, especialistas o secretarios
        const correoExisteEnPacientes = pacientes.some(p => p.correo === correo);
        const correoExisteEnEspecialistas = personal.especialistas.some(e => e.correo === correo);
        const correoExisteEnSecretarios = personal.secretarios.some(s => s.correo === correo);

        if (correoExisteEnPacientes || correoExisteEnEspecialistas || correoExisteEnSecretarios) {
            return res.status(400).json({ error: "El correo electrónico ya se encuentra registrado en el sistema." });
        }

        // Verificar si la cédula ya existe en pacientes, especialistas o secretarios
        const idExisteEnPacientes = pacientes.some(p => p.id === id);
        const idExisteEnEspecialistas = personal.especialistas.some(e => String(e.id) === id);
        const idExisteEnSecretarios = personal.secretarios.some(s => String(s.id) === id);

        if (idExisteEnPacientes || idExisteEnEspecialistas || idExisteEnSecretarios) {
            return res.status(400).json({ error: "La cédula/ID ya se encuentra registrada en el sistema." });
        }

        // 4. Crear instancia del Paciente con rol automático "Paciente"
        const contrasenaCifrada = UsuarioController.cifrarPassword(contrasena);
        const nuevoPaciente = new Paciente(id, nombre, apellido, correo, contrasenaCifrada);

        // 5. Guardar en la base de datos JSON
        pacientes.push(nuevoPaciente);
        UsuarioController.guardarPacientesList(pacientes);

        const tFin = Date.now();
        const tiempoEjecucionMs = tFin - tInicio;
        console.log(`[HU-01] Registro exitoso para ${correo} procesado en ${tiempoEjecucionMs}ms.`);

        // Garantizar que la métrica de tiempo de respuesta sea < 2 segundos (2000ms)
        if (tiempoEjecucionMs > 2000) {
            console.warn(`[ISO 25010 - ADVERTENCIA]: El registro de usuario tomó ${tiempoEjecucionMs}ms, excediendo el límite de 2s.`);
        }

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

    // LOGIN USUARIO
    static loginUsuario(req, res) {
        let { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ error: "Debe ingresar el correo y la contraseña." });
        }

        correo = correo.trim().toLowerCase();
        const contrasenaCifrada = UsuarioController.cifrarPassword(contrasena);

        // Buscar en pacientes
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

        // Buscar en personal (Especialistas y Secretarios)
        const personal = UsuarioController.leerPersonal();
        const especialistaEncontrado = personal.especialistas.find(e => e.correo === correo);

        if (especialistaEncontrado && especialistaEncontrado.contrasena === contrasena) {
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
        if (secretarioEncontrado && secretarioEncontrado.contrasena === contrasena) {
            return res.json({
                id: secretarioEncontrado.id,
                nombre: secretarioEncontrado.nombre,
                apellido: secretarioEncontrado.apellido,
                correo: secretarioEncontrado.correo,
                rol: 'Secretario', // Rol unificado para vista
                rolOriginal: secretarioEncontrado.rol,
                areaAsignada: secretarioEncontrado.areaAsignada,
                fotoUrl: secretarioEncontrado.fotoUrl
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

        // Si no se encuentra
        return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // HU-02: MODIFICAR USUARIO / DATOS DE CONTACTO
    static modificarUsuario(req, res) {
        const idModificar = String(req.params.id);
        const { modificadoPor, rolModificadoPor, telefono, correo, fotoUrl, biografia, nombre, apellido } = req.body;

        // Validar si el usuario modificador está autenticado y tiene autorización
        if (!modificadoPor || !rolModificadoPor) {
            return res.status(403).json({ error: "Acceso denegado. Información de autorización faltante." });
        }

        // Regla 1: Un Paciente solo puede modificar sus propios datos de contacto
        if (rolModificadoPor === 'Paciente' && String(modificadoPor) !== idModificar) {
            return res.status(403).json({ error: "Acceso denegado. No tiene autorización para modificar el perfil de otro usuario." });
        }

        // Regla 2: Un Secretario puede modificar a cualquier paciente. Validamos que el paciente exista.
        const pacientes = UsuarioController.leerPacientes();
        const indicePaciente = pacientes.findIndex(p => String(p.id) === idModificar);

        if (indicePaciente === -1) {
            return res.status(404).json({ error: "El paciente a modificar no existe." });
        }

        const pacienteOriginal = pacientes[indicePaciente];

        // Sanitización de entradas (Seguridad XSS)
        const nuevoTelefono = telefono ? UsuarioController.sanitizar(String(telefono).trim()) : pacienteOriginal.telefono;
        let nuevoCorreo = correo ? UsuarioController.sanitizar(String(correo).trim().toLowerCase()) : pacienteOriginal.correo;
        const nuevaFoto = fotoUrl ? String(fotoUrl).trim() : pacienteOriginal.fotoUrl;
        const nuevaBio = biografia !== undefined ? UsuarioController.sanitizar(String(biografia).trim()) : pacienteOriginal.biografia;

        // Si el modificador es secretario, opcionalmente puede corregir nombre/apellido
        const nuevoNombre = (rolModificadoPor === 'Secretario' && nombre) ? UsuarioController.sanitizar(nombre.trim()) : pacienteOriginal.nombre;
        const nuevoApellido = (rolModificadoPor === 'Secretario' && apellido) ? UsuarioController.sanitizar(apellido.trim()) : pacienteOriginal.apellido;

        // Validar formatos de entrada
        if (correo) {
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(nuevoCorreo)) {
                return res.status(400).json({ error: "El correo electrónico tiene un formato inválido." });
            }
        }

        if (telefono) {
            const regexTelefono = /^\d{7,15}$/; // Dígitos de teléfono
            if (!regexTelefono.test(nuevoTelefono.replace(/[\s-+()]/g, ''))) {
                return res.status(400).json({ error: "El número telefónico debe contener únicamente dígitos válidos." });
            }
        }

        // Regla 3: Si se modifica el correo, validar unicidad
        if (nuevoCorreo !== pacienteOriginal.correo) {
            const personal = UsuarioController.leerPersonal();
            
            const correoExisteEnPacientes = pacientes.some(p => p.correo === nuevoCorreo && String(p.id) !== idModificar);
            const correoExisteEnEspecialistas = personal.especialistas.some(e => e.correo === nuevoCorreo);
            const correoExisteEnSecretarios = personal.secretarios.some(s => s.correo === nuevoCorreo);

            if (correoExisteEnPacientes || correoExisteEnEspecialistas || correoExisteEnSecretarios) {
                return res.status(400).json({ error: "El nuevo correo electrónico ya está registrado por otro usuario." });
            }
        }

        // Actualizar datos del paciente
        pacienteOriginal.telefono = nuevoTelefono;
        pacienteOriginal.correo = nuevoCorreo;
        pacienteOriginal.fotoUrl = nuevaFoto || `https://ui-avatars.com/api/?name=${nuevoNombre}+${nuevoApellido}&background=28a745&color=fff`;
        pacienteOriginal.biografia = nuevaBio;
        pacienteOriginal.nombre = nuevoNombre;
        pacienteOriginal.apellido = nuevoApellido;

        // Mantener campos estrictamente fijos (Cédula/ID y Rol no son editables por el paciente)
        // Esto se cumple ya que no asignamos req.body.id o req.body.rol al pacienteOriginal

        pacientes[indicePaciente] = pacienteOriginal;
        UsuarioController.guardarPacientesList(pacientes);

        console.log(`[HU-02] Modificación exitosa del paciente ID ${idModificar} realizada por ${modificadoPor} (${rolModificadoPor}).`);

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

    // LISTAR PACIENTES (Para uso del Secretario en el buscador)
    static listarPacientes(req, res) {
        const pacientes = UsuarioController.leerPacientes();
        // Devolver lista reducida por seguridad (excluyendo contraseñas)
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
