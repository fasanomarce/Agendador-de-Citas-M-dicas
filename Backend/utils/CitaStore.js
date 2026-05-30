const fs = require('fs');
const path = require('path');

const rutaCitas = path.join(__dirname, '../json/citas.json');

function leerCitas() {
    try {
        const data = fs.readFileSync(rutaCitas, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function guardarCitas(citas) {
    fs.writeFileSync(rutaCitas, JSON.stringify(citas, null, 2), 'utf8');
}

function normalizarEstado(cita) {
    if (!cita.estado) cita.estado = 'pendiente';
    return cita;
}

function nombreDoctorDesdeEspecialista(esp) {
    return `Dr/a. ${esp.nombre} ${esp.apellido}`;
}

module.exports = {
    leerCitas,
    guardarCitas,
    normalizarEstado,
    nombreDoctorDesdeEspecialista
};
