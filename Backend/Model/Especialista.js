const Usuario = require('./Usuario');

class Especialista extends Usuario {
    id;
    nombre;
    apellido;
    especialidad;
    rol;       // Ej. "Médico Titular", "Especialista Asociado"
    fotoUrl;   // Para colocar el link a su foto de perfil

    constructor(id, nombre, apellido, correo, contrasena, especialidad, rol, colorFondo = '2F4F4F') {
        super(correo, contrasena);
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.especialidad = especialidad;
        this.rol = rol;
        // Generamos un avatar por defecto usando la API de ui-avatars
        this.fotoUrl = `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=${colorFondo}&color=fff`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Especialista;
}