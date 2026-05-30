const fs = require('fs');
const path = require('path');
const Especialista = require('../Model/Especialista');
const Secretario = require('../Model/Secretario');

class EspecialidadController {

    static obtenerTodas(req, res) {
        const especialidadesRuta = path.join(__dirname, '../json/especialidades.json');
        try {
            const especialidadesSintaxis = fs.readFileSync(especialidadesRuta, 'utf-8');
            const especialidadesJson = JSON.parse(especialidadesSintaxis);
            res.json(especialidadesJson);
        } catch (e) {
            res.status(500).json({ error: "Error al leer especialidades." });
        }
    }

    static obtenerDetalles(req, res) {
        const nombreEspecialidad = req.params.nombre;

        // Leer datos de JSONs
        const personalRuta = path.join(__dirname, '../json/personal.json');
        const especialidadesRuta = path.join(__dirname, '../json/especialidades.json');

        const personalSintaxis = fs.readFileSync(personalRuta, 'utf-8');
        const especialidadesSintaxis = fs.readFileSync(especialidadesRuta, 'utf-8');

        const personalJson = JSON.parse(personalSintaxis);
        const especialidadesJson = JSON.parse(especialidadesSintaxis);

        const especialidadEncontrada = especialidadesJson[nombreEspecialidad];

        if (especialidadEncontrada) {
            // Filtrar los especialistas y mapearlos a objetos 
            const doctoresBrutos = personalJson.especialistas.filter(esp => esp.especialidad === nombreEspecialidad);
            const doctoresObj = doctoresBrutos.map(d => new Especialista(d.id, d.nombre, d.apellido, d.correo, d.contrasena, d.especialidad, d.rol, d.color));

            // Filtrar los secretarios y mapearlos a objetos 
            const secretariosBrutos = personalJson.secretarios.filter(sec => sec.areaAsignada === nombreEspecialidad);
            const secretariosObj = secretariosBrutos.map(s => new Secretario(s.id, s.nombre, s.apellido, s.correo, s.contrasena, s.areaAsignada, s.rol, s.color));

            // Preparar respuesta adjuntando doctores y secretarios convertidos
            const respuesta = {
                ...especialidadEncontrada,
                doctores: doctoresObj,
                secretarios: secretariosObj
            };

            // Mandamos todo
            res.json(respuesta);
        } else {
            res.status(404).json({ error: "Especialidad no configurada en el JSON" });
        }
    }
}

module.exports = EspecialidadController;