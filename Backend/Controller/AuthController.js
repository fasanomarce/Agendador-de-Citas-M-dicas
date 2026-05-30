const Paciente = require('../Model/Paciente');
const store = require('../utils/usuarioStore');

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
        nombre = store.sanitizar(nombre.trim());
        apellido = store.sanitizar(apellido.trim());
        correo = store.sanitizar(correo.trim().toLowerCase());

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

        if (store.correoExisteGlobal(correo)) {
            return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado en el sistema.' });
        }
        if (store.idExisteGlobal(id)) {
            return res.status(400).json({ error: 'La cédula/ID ya se encuentra registrada en el sistema.' });
        }

        const pacientes = store.leerPacientes();
        const contrasenaCifrada = store.cifrarPassword(contrasena);
        const nuevoPaciente = new Paciente(id, nombre, apellido, correo, contrasenaCifrada);

        pacientes.push(nuevoPaciente);
        store.guardarPacientes(pacientes);

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
        try {
            let { correo, contrasena } = req.body;

            if (!correo || !contrasena) {
                return res.status(400).json({ error: 'Debe ingresar el correo y la contraseña.' });
            }

            const correoNorm = store.normalizarCorreo(correo);
            contrasena = String(contrasena);

            const pacientes = store.leerPacientes();
            const paciente = pacientes.find(p => store.normalizarCorreo(p.correo) === correoNorm);
            if (paciente && store.contrasenaCoincide(contrasena, paciente.contrasena)) {
                return res.json({
                    id: paciente.id,
                    nombre: paciente.nombre,
                    apellido: paciente.apellido,
                    correo: paciente.correo,
                    telefono: paciente.telefono || '',
                    fotoUrl: paciente.fotoUrl,
                    biografia: paciente.biografia || '',
                    rol: 'Paciente'
                });
            }

            const personal = store.leerPersonal();
            const especialista = personal.especialistas.find(
                e => store.normalizarCorreo(e.correo) === correoNorm
            );
            if (especialista && store.contrasenaCoincide(contrasena, especialista.contrasena)) {
                const nombre = especialista.nombre;
                const apellido = especialista.apellido;
                return res.json({
                    id: especialista.id,
                    nombre,
                    apellido,
                    correo: especialista.correo,
                    rol: 'Especialista',
                    rolClinico: especialista.rol || 'Médico Titular',
                    especialidad: especialista.especialidad,
                    color: especialista.color,
                    fotoUrl: especialista.fotoUrl ||
                        `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=2f4f4f&color=fff`
                });
            }

            const secretario = personal.secretarios.find(
                s => store.normalizarCorreo(s.correo) === correoNorm
            );
            if (secretario && store.contrasenaCoincide(contrasena, secretario.contrasena)) {
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

            const admins = store.leerAdmins();
            const admin = admins.find(a => store.normalizarCorreo(a.correo) === correoNorm);
            if (admin && store.contrasenaCoincide(contrasena, admin.contrasena)) {
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
        } catch (err) {
            console.error('[Auth] Error en login:', err);
            return res.status(500).json({ error: 'Error interno al iniciar sesión.' });
        }
    }
}

module.exports = AuthController;
