const fs = require('fs');
const path = require('path');

const rutaCitas = path.join(__dirname, '../citas.json');
const rutaBloques = path.join(__dirname, '../bloques.json');

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

function leerBloques() {
    try {
        const data = fs.readFileSync(rutaBloques, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function guardarBloques(bloques) {
    fs.writeFileSync(rutaBloques, JSON.stringify(bloques, null, 2), 'utf8');
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
    leerBloques,
    guardarBloques,
    normalizarEstado,
    nombreDoctorDesdeEspecialista
};
