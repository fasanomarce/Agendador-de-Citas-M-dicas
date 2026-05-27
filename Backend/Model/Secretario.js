const Usuario = require('./Usuario');

class Secretario extends Usuario {
    id;
    nombre;
    apellido;
    areaAsignada;  // Especialidad en la que trabaja (Ej. "Cardiología")
    rol;           // Ej. "Recepción Dpto."
    fotoUrl;

    constructor(id, nombre, apellido, correo, contrasena, areaAsignada, rol, colorFondo = '4682B4') {
        super(correo, contrasena);
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.areaAsignada = areaAsignada;
        this.rol = rol;
        // Generamos un avatar por defecto
        this.fotoUrl = `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=${colorFondo}&color=fff`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Secretario;
}