class CitaController {
    // Atributos estáticos de la clase
    static fs = require('fs');
    static path = require('path');
    static rutaJson = CitaController.path.join(__dirname, '../json/citas.json');
    
    // este metodo se activa con el POST
    static guardarCita(req, res) {
        const nuevaCita = req.body; // aca llegan los datos del fetch
        
        // leer el JSON actual
        CitaController.fs.readFile(CitaController.rutaJson, 'utf8', (err, data) => {
            if (err) return res.status(500).json({error: "Error leyendo archivo" });
            
            // convertir el texto JSON a un arreglo de JS
            let citas = []
            if (data) {
                try {
                    citas = JSON.parse(data);    
                } catch(e) {
                    citas = [];
                }
                
            }

            // Validar que el paciente no tenga ya una cita activa
            if (nuevaCita.pacienteId) {
                const pacienteIdStr = String(nuevaCita.pacienteId);
                // Si el paciente ya tiene cualquier cita en el sistema
                const tieneCitaActiva = citas.some(cita => 
                    String(cita.pacienteId) === pacienteIdStr
                );

                if (tieneCitaActiva) {
                    return res.status(400).json({ error: "El usuario ya tiene una cita registrada." });
                }
            }

            // asigna un id y estado inicial
            nuevaCita.id = Date.now();
            if (!nuevaCita.estado) nuevaCita.estado = 'pendiente';
            if (nuevaCita.pacienteId != null) {
                nuevaCita.pacienteId = String(nuevaCita.pacienteId);
            }
            
            // agrega la cita nueva al arreglo
            citas.push(nuevaCita);

            CitaController.fs.writeFile(CitaController.rutaJson, JSON.stringify(citas, null, 2), (err) => {
                if (err) return res.status(500).json({ error: "Error guardando la cita en el archivo." });

                res.status(201).json({ mensaje: "Cita guardada correctamente." });
            })
        })
    }

    // Consulta general restringida: usar endpoints por rol
    static cargarCitas(req, res) {
        return res.status(403).json({
            error: 'Use el endpoint de citas de su rol: /api/pacientes/:id/citas o /api/secretario/citas.'
        });
    }
}

module.exports = CitaController;