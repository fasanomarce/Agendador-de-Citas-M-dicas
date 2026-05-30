class Especialidad {
    constructor(nombre, ubicacion, horario, descripcion, doctoresAsignados = []) {
        this.nombre = nombre;
        this.ubicacion = ubicacion;
        this.horario = horario;
        this.descripcion = descripcion;
        this.doctoresAsignados = doctoresAsignados; 
    }

    esValida() {
        // El campo 'horario' ahora es opcional en la creación de especialidades
        return this.nombre && this.ubicacion && this.descripcion;
    }
}

module.exports = Especialidad;