# Especificaciones Formales de Historias de Usuario
## Proyecto: Agendador de Citas Médicas
**Autor:** Antigravity (Ingeniero de Requisitos & Project Manager Ágil)  
**Fecha:** 27 de mayo de 2026  
**Versión:** 1.0  
**Estado:** Refinado y Listo para Integración  

---

### Introducción y Alineación de Calidad (ISO 25010)

Estas especificaciones se han redactado en estricta coherencia con el **Brief Ágil**, la **Especificación de Requisitos de Software (ERS)** y los componentes del repositorio actual. Para garantizar un producto de software premium, robusto y centrado en el usuario, se han integrado de forma transversal las siguientes características y métricas de calidad basadas en la norma **ISO 25010**:

1. **Eficiencia de Desempeño (Performance Efficiency):**
   * **Tiempo de respuesta:** La persistencia y el procesamiento de transacciones críticas (como el registro de usuarios y modificación de datos) deben realizarse en tiempos óptimos (ej. $\le 2$ segundos bajo carga nominal).
2. **Seguridad (Security):**
   * **Confidencialidad y Autenticidad:** Cifrado de credenciales de acceso (contraseñas) y validación activa de sesión basada en roles (Paciente / Secretario).
   * **Integridad (Sanitización):** Protección de entradas contra inyecciones SQL/NoSQL o Cross-Site Scripting (XSS).
3. **Usabilidad / Aprendizabilidad (Usability / Learnability):**
   * **Estética e Interfaz Intuitiva:** Interfaces diseñadas bajo principios ergonómicos, validación reactiva en línea (inline validation) y placeholders informativos para guiar al usuario.
4. **Fiabilidad (Reliability):**
   * **Tolerancia a Fallos:** Prevención proactiva del guardado ante formatos de datos inválidos, asegurando que la base de datos se mantenga en un estado consistente.

---

### HISTORIA DE USUARIO A: Registrar Usuario (Refinamiento y Ajuste)

La siguiente especificación refina el esbozo inicial de la ERS para asegurar su consistencia con las clases del repositorio y los estándares del equipo de desarrollo (Luis Alfaro, Marcello Fasano, Xian León, Sebastian Ramírez).

| [1 Historia de Usuario] | [2 Conversación] | [3 Criterios de Aceptación] |
| :--- | :--- | :--- |
| **Identificador:** HU-01<br>**Épica:** Gestión de Usuarios<br>**Título:** Registrar Usuario<br><br>**Declaración:**<br>Como **Usuario visitante (público)**,<br>quiero **registrarme en el sistema**,<br>para **acceder a las funciones de gestión de citas y perfiles**.<br><br>**Descripción:**<br>Permite a los usuarios externos crear una cuenta en la plataforma desde la pantalla pública, completando su perfil básico para interactuar con la agenda de citas. | **Referencia de Diseño:**<br>* `agregar usuario.pdf` (Diagrama de Actividades de Registro de Usuario).<br><br>**Participantes de Alineación:**<br>* Luis Alfaro (PM/Lead)<br>* Marcello Fasano (Dev)<br>* Xian León (QA)<br>* Sebastian Ramírez (Dev)<br>* Antigravity (Analista)<br><br>**Reglas de Negocio Globales (RNG):**<br>* **RNG-01 (Unicidad de Correo):** El sistema debe validar en tiempo real o previo a la persistencia que el correo electrónico ingresado no exista previamente en la base de datos.<br>* **RNG-02 (Asignación de Rol por Defecto):** Al realizarse el registro desde la interfaz pública, el sistema debe asignar de forma obligatoria e inmutable el rol de **"Paciente"**.<br>* **RNG-03 (Campos Mandatorios):** Los atributos `nombre`, `apellido`, `cédula/ID`, `correo` y `contraseña` son estrictamente obligatorios. | **CA-01 (Validación de Vacíos e Incompletitud):** El sistema debe impedir el registro y bloquear el botón "Confirmar" si algún campo obligatorio se encuentra vacío, mostrando una alerta visual descriptiva junto al campo correspondiente.<br><br>**CA-02 (Validación de Formato de Datos):** Las entradas de datos deben cumplir con expresiones regulares específicas:<br>* Correo electrónico: estructura válida `usuario@dominio.com`.<br>* Cédula/ID: solo dígitos numéricos (mínimo 8 caracteres).<br><br>**CA-03 (Métrica de Eficiencia de Desempeño - ISO 25010):** El sistema debe procesar el registro, cifrar la contraseña y retornar la respuesta de persistencia en la base de datos en un tiempo máximo de **2.0 segundos** (Métrica de Eficiencia).<br><br>**CA-04 (Notificación de Éxito):** Al registrar con éxito, se debe desplegar un mensaje emergente (Toast/Modal) interactivo e intuitivo confirmando la creación exitosa antes de redirigir al Login.<br><br>**CA-05 (Seguridad de Credenciales):** La contraseña nunca se guardará en texto plano; se aplicará un algoritmo de hashing seguro en el Backend. |

#### Dependencias (HU-01)
1. **Acceso a Interfaz Pública:** El usuario debe tener acceso sin restricciones a la interfaz de bienvenida (`registro.html` y `login.html`) expuesta públicamente.
2. **Infraestructura de Roles:** El rol `"Paciente"` debe estar previamente definido en el esquema relacional/JSON de base de datos para permitir su asignación automatizada sin errores de llave foránea o referencia.

#### Restricciones (HU-01)
1. **Seguridad (Sanitización de Datos):** Es obligatorio sanitizar todos los campos de entrada de texto libre en el backend para evitar inyecciones XSS y SQL/NoSQL antes de la evaluación de lógica de negocio.
2. **Diseño Visual Coherente:** El formulario de registro debe heredar los estilos globales predefinidos en `styles.css` del Frontend para asegurar consistencia visual y ergonomía (Usabilidad).

---

### HISTORIA DE USUARIO B: Modificar Usuario / Datos de Contacto

Esta historia expande y detalla las actividades del User Story Map del Brief relativas a la actualización de información de contacto de pacientes por parte de ellos mismos o del personal de asistencia (Secretarios).

| [1 Historia de Usuario] | [2 Conversación] | [3 Criterios de Aceptación] |
| :--- | :--- | :--- |
| **Identificador:** HU-02<br>**Épica:** Gestión de Usuarios<br>**Título:** Modificar Usuario / Datos de Contacto<br><br>**Declaración:**<br>Como **Usuario (Paciente / Secretario)**,<br>quiero **modificar los datos de perfil y contacto en el sistema**,<br>para **mantener la información de contacto actualizada**.<br><br>**Descripción:**<br>Permite que un Paciente actualice su propia información de contacto en su perfil y que un Secretario busque y actualice los datos de contacto de cualquier paciente para asegurar la comunicación en la gestión de citas. | **Referencia de Diseño:**<br>* `ModificarUsuario.pdf` (Diagrama de Actividades de Modificación).<br><br>**Participantes de Alineación:**<br>* Luis Alfaro, Marcello Fasano, Xian León, Sebastian Ramírez, Antigravity.<br><br>**Reglas de Negocio Globales (RNG):**<br>* **RNG-04 (Límite de Permisos del Paciente):** El Paciente solo puede editar sus propios datos de contacto (teléfono, correo, foto de perfil/avatar, biografía). No puede alterar su rol ni su Cédula/ID.<br>* **RNG-05 (Facultades del Secretario):** El Secretario puede buscar a cualquier Paciente y editar exclusivamente sus datos de contacto para la operatividad diaria clínica.<br>* **RNG-06 (Recertificación de Correo):** Si se altera el correo electrónico, el sistema ejecutará la regla **RNG-01** de validación de unicidad. | **CA-01 (Validación de Entradas en Modificación):** El sistema debe rechazar el guardado si los campos modificados quedan vacíos o infringen las expresiones de formato (ej. correo sin `@`, teléfono que contenga letras o longitud inválida).<br><br>**CA-02 (Notificación Inmediata):** Tras presionar "Guardar Cambios", el sistema debe notificar al usuario de forma inmediata (Toast en pantalla) si la acción fue exitosa o fallida sin refrescar la página completa.<br><br>**CA-03 (Métrica de Consistencia y Tiempo Real):** Cualquier cambio de contacto realizado debe reflejarse inmediatamente en todas las interfaces relacionadas (vistas de agendas, listas de citas del Secretario y expediente del paciente) mediante reactividad o actualización dinámica.<br><br>**CA-04 (Protección de Integridad y Robustez):** Los campos sensibles e inalterables (Cédula/ID y Rol para el Paciente) deben mostrarse deshabilitados (read-only) y con una indicación visual de bloqueo.<br><br>**CA-05 (Seguridad en la Transmisión):** Toda petición de guardado debe sanitizarse rigurosamente para evitar la inyección de payloads maliciosos. |

#### Dependencias (HU-02)
1. **Preexistencia de Datos (HU-01):** El usuario paciente debe estar registrado previamente en la base de datos.
2. **Autenticación y Control de Acceso Activo:** El usuario que ejecuta la acción de edición debe estar autenticado en el sistema. El Backend debe validar activamente el token de sesión y el Rol (Paciente o Secretario) antes de procesar cualquier modificación.

#### Restricciones (HU-02)
1. **Seguridad de Nivel de Backend:** A nivel de API/Backend, se debe implementar una capa de control de acceso que rechace cualquier intento de modificar campos prohibidos (como el ID o Rol) incluso si la petición es adulterada externamente.
2. **Diseño Web Responsive:** La interfaz de edición de perfil debe ser 100% responsiva (Mobile-First) utilizando las clases del sistema de diseño para permitir al paciente modificar sus datos cómodamente desde un smartphone.
