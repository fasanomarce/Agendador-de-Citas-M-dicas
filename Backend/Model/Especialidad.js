class Especialidad {
    constructor(nombre, codigo, ubicacion, horario, descripcion, doctoresAsignados = []) {
        this.nombre = nombre;
        this.codigo = codigo;
        this.ubicacion = ubicacion;
        this.horario = horario;
        this.descripcion = descripcion;
        this.doctoresAsignados = doctoresAsignados; 
    }

    esValida() {
        return this.nombre && this.codigo && this.ubicacion && this.horario && this.descripcion;
    }
}

module.exports = Especialidad;