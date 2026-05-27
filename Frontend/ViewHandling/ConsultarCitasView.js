class ConsultarCitasView {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.solicitarCitasAlServidor();
        });
    }

    solicitarCitasAlServidor() {
        // Hacemos el fetch al backend para obtener las citas
        fetch('http://localhost:3000/api/citas')
            .then(respuesta => {
                if (!respuesta.ok) throw new Error("Servidor no responde correctamente");
                // Leemos la respuesta como texto primero para poder verificar si está vacía
                return respuesta.text(); 
            })
            .then(texto => {
                if (!texto || texto.trim() === "") {
                    // Escenario: El archivo Json está completamente vacío
                    this.mostrarCitas([]); 
                } else {
                    // Escenario: El archivo Json tiene datos
                    this.mostrarCitas(JSON.parse(texto));
                }
            })
            .catch(error => {
                // Escenario: Error real de conexión, servidor apagado o falla de red
                console.error('Error de conexión:', error);
                const contenedor = document.getElementById('contenedorCitas');
                if (contenedor) {
                    contenedor.innerHTML = '<p class="mensaje-error">Error de conexión con el servidor. Asegúrate de iniciarlo.</p>';
                }
            });
    }

    mostrarCitas(citas) {
        const contenedor = document.getElementById('contenedorCitas');
        if (!contenedor) return;

        // Limpiamos el contenedor (quitamos el mensaje de "Cargando...")
        contenedor.innerHTML = '';

        // Validamos si el arreglo está vacío
        if (!citas || citas.length === 0) {
            contenedor.innerHTML = '<p id="mensajeVacio" class="mensaje-vacio">No has reservado ninguna cita.</p>';
            return;
        }

        // Si hay citas, las dibujamos en cuadros o "tarjetas" (cards)
        citas.forEach(cita => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'cita-card';
            
            tarjeta.innerHTML = `
                <h3 class="cita-card-titulo">Cita con ${cita.doctor}</h3>
                <p><strong>Paciente:</strong> ${cita.nombre} ${cita.apellido}</p>
                <p><strong>Fecha:</strong> ${cita.fecha}</p>
                <p><strong>Hora:</strong> ${cita.hora}</p>
                <p><strong>Motivo / Comentarios:</strong> ${cita.motivo}</p>
            `;
            
            contenedor.appendChild(tarjeta);
        });
    }
}

// Instanciar la vista para que se ejecute automáticamente
new ConsultarCitasView();
