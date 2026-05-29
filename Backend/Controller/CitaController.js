class CitaController {
    // Atributos estáticos de la clase
    static fs = require('fs');
    static path = require('path');
    static rutaJson = CitaController.path.join(__dirname, '../citas.json');
    
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

            // asigna un id y estado inicial
            nuevaCita.id = Date.now();
            if (!nuevaCita.estado) nuevaCita.estado = 'pendiente';
            
            // agrega la cita nueva al arreglo
            citas.push(nuevaCita);

            CitaController.fs.writeFile(CitaController.rutaJson, JSON.stringify(citas, null, 2), (err) => {
                if (err) return res.status(500).json({ error: "Error guardando la cita en el archivo." });

                res.status(201).json({ mensaje: "Cita guardada correctamente." });
            })
        })
    }

    // para consultar cita
    static cargarCitas(req, res) {
        CitaController.fs.readFile(CitaController.rutaJson, 'utf8', (err, data) => {
            if (err) return res.status(500).json({error: "Error leyendo archivo" });
            res.json(JSON.parse(data));
        });
    }
}

module.exports = CitaController;