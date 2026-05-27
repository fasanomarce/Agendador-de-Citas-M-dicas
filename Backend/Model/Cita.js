class Cita {
    nombre;
    apellido;
    motivo;
    doctor;
    fecha;
    hora;

    constructor(nombre, apellido, motivo, doctor, fecha, hora) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.motivo = motivo;
        this.doctor = doctor;
        this.fecha = fecha;
        this.hora = hora;
    }
}

// Se exporta
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Cita;
}