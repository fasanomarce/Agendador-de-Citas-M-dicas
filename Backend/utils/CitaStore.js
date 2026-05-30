const fs = require('fs');
const path = require('path');

class CitaStore {
    constructor() {
        this.rutaCitas = path.join(__dirname, '../json/citas.json');
    }

    leerCitas() {
        try {
            const data = fs.readFileSync(this.rutaCitas, 'utf8');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    guardarCitas(citas) {
        fs.writeFileSync(this.rutaCitas, JSON.stringify(citas, null, 2), 'utf8');
    }

    normalizarEstado(cita) {
        if (!cita.estado) cita.estado = 'pendiente';
        return cita;
    }

    nombreDoctorDesdeEspecialista(esp) {
        return `Dr/a. ${esp.nombre} ${esp.apellido}`;
    }
}

module.exports = new CitaStore();
