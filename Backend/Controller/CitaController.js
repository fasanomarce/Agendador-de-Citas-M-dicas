const fs = require('fs');
const path = require('path');

const rutaJson = path.join(__dirname, '../citas.json');

class CitaController {
    
    // este metodo se activa con el POST
    static guardarCita(req, res) {
        const nuevaCita = req.body; // aca llegan los datos del fetch
        
        // leer el JSON actual
        fs.readFile(rutaJson, 'utf8', (err, data) => {
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

            // asigna un id
            nuevaCita.id = Date.now();
            
            // agrega la cita nueva al arreglo
            citas.push(nuevaCita);

            fs.writeFile(rutaJson, JSON.stringify(citas, null, 2), (err) => {
                if (err) return res.status(500).json({ error: "Error guardando la cita en el archivo." });

                res.status(201).json({ mensaje: "Cita guardada correctamente." });
            })
        })
    }

    // para consultar cita
    static obtenerCitas(req, res) {
        fs.readFile(rutaJson, 'utf8', (err, data) => {
            if (err) return res.status(500).json({error: "Error leyendo archivo" });
            res.json(JSON.parse(data));
        });
    }
}

module.exports = CitaController;