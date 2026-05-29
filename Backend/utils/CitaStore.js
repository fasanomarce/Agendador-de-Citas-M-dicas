const fs = require('fs');
const path = require('path');

const rutaJson = path.join(__dirname, '../citas.json');

class CitaStore {
    static leerCitas() {
        try {
            const data = fs.readFileSync(rutaJson, 'utf8');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    static guardarCitas(citas) {
        fs.writeFileSync(rutaJson, JSON.stringify(citas, null, 2), 'utf8');
    }

    static nombreDoctorEspecialista(especialista) {
        return `Dr/a. ${especialista.nombre} ${especialista.apellido}`;
    }

    static coincideConPaciente(cita, paciente) {
        const mismoId = cita.pacienteId != null && String(cita.pacienteId) === String(paciente.id);
        const mismoNombre =
            cita.nombre === paciente.nombre && cita.apellido === paciente.apellido;
        return mismoId || mismoNombre;
    }

    static coincideConEspecialista(cita, especialista) {
        const etiqueta = CitaStore.nombreDoctorEspecialista(especialista);
        if (cita.especialistaId != null && String(cita.especialistaId) === String(especialista.id)) {
            return true;
        }
        return cita.doctor === etiqueta || (cita.doctor && cita.doctor.includes(especialista.apellido));
    }
}

module.exports = CitaStore;
