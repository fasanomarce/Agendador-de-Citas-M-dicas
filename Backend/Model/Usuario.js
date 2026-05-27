class Usuario {
    correo;
    contrasena;

    constructor(correo, contrasena) {
        this.correo = correo;
        this.contrasena = contrasena;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Usuario;
}