# Centro Médico Ávila | Agendador de Citas Médicas (Caracas)

Bienvenido a la maqueta inicial (Sprint 1) del **Agendador de Citas Médicas**, una plataforma web responsiva y premium diseñada exclusivamente para centros médicos en la Región Metropolitana de Caracas, Venezuela. 

El idioma oficial y exclusivo de la plataforma es el **Español** y el sistema no incluye pasarelas de pago ni facturación en línea (el cobro es gestionado de manera presencial al momento de la consulta).

---

## 🚀 Puesta en Marcha (Entorno Local)

Para ejecutar el proyecto de forma local, sigue estos pasos:

1. **Navega al directorio del proyecto**:
   ```bash
   cd agendador-citas-medicas
   ```

2. **Instala las dependencias**:
   *(Ya pre-instaladas por el agente en este entorno, pero necesario si clonas el proyecto desde cero)*:
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Accede al navegador**:
   Abre la URL indicada en tu consola, normalmente `http://localhost:5173`.

---

## 🛠️ Stack Tecnológico Utilizado

- **Frontend Core**: React.js (inicializado mediante Vite por su alta eficiencia y rapidez en HMR).
- **Estilos (CSS)**: Tailwind CSS con una paleta de colores HSL curada, componentes con bordes redondeados amplios, sombras premium y efectos glassmorphism.
- **Enrutamiento**: React Router v6 para la navegación fluida sin recargas.
- **Iconografía**: Lucide React para indicadores e iconos visuales modernos de alta calidad.
- **Estado Global y Lógica**: React Context (`AppContext.jsx`) con persistencia en `localStorage` y simulación asíncrona de llamadas de red mediante Promesas (`setTimeout`) para recrear tiempos de respuesta realistas (< 1.5s).

---

## 🧬 Arquitectura de Carpetas (Clean Architecture)

El código sigue una estructura limpia, modular y altamente escalable:

```text
src/
├── components/     # Componentes de UI comunes (Navbar, Footer, RoleSelector ribbon)
├── context/        # Estado centralizado (AppContext.jsx) y Reglas Críticas de Negocio
├── index.css       # Directivas Tailwind CSS, scrollbar estilizada y clases glassmorphism
├── main.jsx        # Punto de anclaje de React en el DOM
├── App.jsx         # Enrutador principal y layout global
└── views/          # Módulos y vistas principales por Rol de Usuario
    ├── Landing.jsx      # Página de bienvenida contextualizada en Caracas (El Ávila)
    ├── Login.jsx        # Formulario de acceso con bypass rápido de demostración
    ├── Register.jsx     # HU1: Formulario público de registro de pacientes
    ├── AdminPanel.jsx   # HU2: Panel exclusivo de Administrador (Especialidades)
    ├── SecretarioPanel.jsx # HU3: Panel exclusivo de Secretario (Asignar Horarios)
    ├── PacientePanel.jsx # HU4: Panel del Paciente (Stepper interactivo de reserva)
    └── EspecialistaPanel.jsx # Vista del Especialista Médico (Consulta agenda y marcar completadas)
```

---

## 🧪 Guía de Evaluación del Sprint 1

Para facilitar una evaluación exhaustiva de todas las reglas del negocio sin tener que cerrar e iniciar sesión repetidamente, hemos incorporado una **Barra de Demostración Superior (Role Switcher)**. Con un solo clic puedes alternar entre las identidades pre-cargadas y comprobar el comportamiento:

### 1. HU1 - Registrar Usuario (Público)
- **Ruta**: `/register` o haz clic en "Registrarse" o "Crear Cuenta Paciente" en el Landing.
- **Qué Probar**:
  - Intenta enviar campos vacíos (el frontend bloqueará el envío).
  - Intenta registrarte con el correo de prueba existente `paciente_test@gmail.com` (arrojará un error de correo ya registrado).
  - Registra un nuevo paciente con datos válidos (por ejemplo, cédula `V-24555888` y correo `prueba@gmail.com`).
  - **Resultado**: El sistema validará el formato nacional de Cédula (V- o E-), guardará el perfil en el estado local con el rol de `"Paciente"` por defecto e iniciará sesión automáticamente, redirigiéndote al panel del paciente.

### 2. HU2 - Agregar Especialidad (Admin)
- **Bypass Rápido**: Haz clic en el botón **Administrador** de la barra superior.
- **Ruta**: `/admin`.
- **Qué Probar**:
  - Intenta crear una especialidad dejando vacío el selector de "Especialista Inicial" (el sistema arrojará un error de obligatoriedad, cumpliendo la regla de que **ninguna especialidad puede existir vacía**).
  - Intenta crear una especialidad válida asignando a cualquiera de los médicos disponibles.
  - **Resultado**: La especialidad se creará, se enlazará automáticamente al médico seleccionado en el estado global, y se reflejará inmediatamente en el buscador de citas del paciente. El contador superior muestra el total actual sobre el **límite máximo de 50 especialidades**.

### 3. HU3 - Asignar Horarios (Secretario)
- **Bypass Rápido**: Haz clic en el botón **Secretario** de la barra superior.
- **Ruta**: `/secretario`.
- **Qué Probar**:
  - **Límite de Horas Continuas**: Intenta asignar al Dr. Alejandro Ravelo un bloque desde las `08:00` hasta las `14:00` (6 horas). El sistema bloqueará la acción indicando que los bloques continuos no pueden superar las 5 horas.
  - **Rango de Horario Clínico**: Intenta colocar una hora de inicio a las `04:00` o una hora de fin a las `23:30`. El sistema lo rechazará indicando que las horas deben estar estrictamente en el rango de **5:00 a.m. a 11:00 p.m.**
  - **Detección de Colisiones**: Intenta asignar al Dr. Alejandro Ravelo en el consultorio "Cons. A-12" el día **Lunes** de `09:00` a `12:00` (ya tiene asignado de `08:00` a `13:00` ese día).
  - **Resultado**: El motor de validaciones de `AppContext.jsx` detectará el solapamiento en minutos y arrojará un banner de conflicto: *"...ya tiene asignado un consultorio/bloque en este horario el día Lunes"*.

### 4. HU4 - Realizar Cita (Paciente y Secretario)
- **Bypass Rápido (Límite Citas)**: Haz clic en el botón **Paciente (Con Cita)** (Elena Rivas).
- **Ruta**: `/paciente`.
- **Qué Probar (Regla Crítica de 1 Cita Activa)**:
  - Al ingresar como Elena Rivas, verás de inmediato su cita programada activa. El sistema bloqueará por completo el flujo de reserva informándote que ya tiene una cita activa.
  - Haz clic en **Cancelar Cita Activa para Liberar Cupo** (se simulará la eliminación de forma asíncrona de manera optimizada y elegante).
  - Una vez cancelada la cita activa, el sistema desbloqueará automáticamente el Stepper de Reserva paso a paso.
  - Completa los pasos: Selecciona Especialidad → Selecciona Médico → Elige el Turno Semanal del médico, selecciona la fecha y escoge la ranura de 1 hora.
  - Haz clic en **Reservar y Registrar Cita Presencial**. Verás la animación premium de procesamiento de red y, en menos de 1.5s, obtendrás tu comprobante médico.
  - Intenta regresar y verás que ahora el agendamiento está nuevamente bloqueado, demostrando la consistencia de la regla de negocio.

---

*Desarrollado con pasión, enfocado en código limpio, modularidad y excelencia de diseño UX para el Centro Médico Ávila, Caracas.*
