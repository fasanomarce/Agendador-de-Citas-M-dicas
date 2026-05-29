const Paciente = require('../Model/Paciente');
const UsuarioStore = require('../utils/UsuarioStore');

class AuthController {
    static registro(req, res) {
        const tInicio = Date.now();
        let { id, nombre, apellido, correo, contrasena } = req.body;

        if (!id || !nombre || !apellido || !correo || !contrasena) {
            return res.status(400).json({
                error: 'Todos los campos obligatorios (nombre, apellido, cédula/ID, correo, contraseña) deben estar llenos.'
            });
        }

        id = id.toString().trim();
        nombre = UsuarioStore.sanitizar(nombre.trim());
        apellido = UsuarioStore.sanitizar(apellido.trim());
        correo = UsuarioStore.sanitizar(correo.trim().toLowerCase());

        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(correo)) {
            return res.status(400).json({ error: 'El correo electrónico tiene un formato inválido.' });
        }

        const regexCedula = /^\d{8,}$/;
        if (!regexCedula.test(id)) {
            return res.status(400).json({
                error: 'La cédula/ID debe contener únicamente números y tener al menos 8 dígitos.'
            });
        }

        if (UsuarioStore.correoExisteGlobal(correo)) {
            return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado en el sistema.' });
        }

        if (UsuarioStore.idExisteGlobal(id)) {
            return res.status(400).json({ error: 'La cédula/ID ya se encuentra registrada en el sistema.' });
        }

        const pacientes = UsuarioStore.leerPacientes();
        const contrasenaCifrada = UsuarioStore.cifrarPassword(contrasena);
        const nuevoPaciente = new Paciente(id, nombre, apellido, correo, contrasenaCifrada);

        pacientes.push(nuevoPaciente);
        UsuarioStore.guardarPacientes(pacientes);

        console.log(`[HU-01] Registro público exitoso procesado en ${Date.now() - tInicio}ms.`);

        return res.status(201).json({
            mensaje: 'Usuario registrado exitosamente.',
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

    static login(req, res) {
        let { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ error: 'Debe ingresar el correo y la contraseña.' });
        }

        correo = correo.trim().toLowerCase();
        const contrasenaCifrada = UsuarioStore.cifrarPassword(contrasena);

        const pacientes = UsuarioStore.leerPacientes();
        const paciente = pacientes.find(p => p.correo === correo);
        if (paciente && (paciente.contrasena === contrasena || paciente.contrasena === contrasenaCifrada)) {
            return res.json({
                id: paciente.id,
                nombre: paciente.nombre,
                apellido: paciente.apellido,
                correo: paciente.correo,
                telefono: paciente.telefono || '',
                fotoUrl: paciente.fotoUrl,
                biografia: paciente.biografia || '',
                rol: paciente.rol
            });
        }

        const personal = UsuarioStore.leerPersonal();
        const especialista = personal.especialistas.find(e => e.correo === correo);
        if (especialista && (especialista.contrasena === contrasena || especialista.contrasena === contrasenaCifrada)) {
            return res.json({
                id: especialista.id,
                nombre: especialista.nombre,
                apellido: especialista.apellido,
                correo: especialista.correo,
                rol: 'Especialista',
                rolClinico: especialista.rol || 'Médico Titular',
                especialidad: especialista.especialidad,
                color: especialista.color,
                fotoUrl: especialista.fotoUrl
            });
        }

        const secretario = personal.secretarios.find(s => s.correo === correo);
        if (secretario && (secretario.contrasena === contrasena || secretario.contrasena === contrasenaCifrada)) {
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

        const admin = UsuarioStore.leerAdmins().find(a => a.correo === correo);
        if (admin && (admin.contrasena === contrasena || admin.contrasena === contrasenaCifrada)) {
            return res.json({
                id: admin.id,
                nombre: admin.nombre,
                apellido: admin.apellido,
                correo: admin.correo,
                rol: 'Administrador',
                fotoUrl: `https://ui-avatars.com/api/?name=${admin.nombre}+${admin.apellido}&background=0056b3&color=fff`
            });
        }

        return res.status(401).json({ error: 'Credenciales de acceso incorrectas.' });
    }
}

module.exports = AuthController;
