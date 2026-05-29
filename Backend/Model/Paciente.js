const Usuario = require('./Usuario');

class Paciente extends Usuario {
    id;
    nombre;
    apellido;
    telefono;
    fotoUrl;
    biografia;
    rol;
    cita;

    constructor(id, nombre, apellido, correo, contrasena, telefono = '', fotoUrl = '', biografia = '', cita = null) {
        super(correo, contrasena);
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.fotoUrl = fotoUrl || `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=28a745&color=fff`;
        this.biografia = biografia;
        this.rol = 'Paciente';
        this.cita = cita;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Paciente;
}