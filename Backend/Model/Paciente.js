class Paciente extends Usuario {
    constructor(correo, contrasena, nombre, apellido, cita) {
        super(correo, contrasena);
        this.nombre = nombre;
        this.apellido = apellido;
        this.cita = cita;
    }
}