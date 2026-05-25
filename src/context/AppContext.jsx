import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// Datos iniciales de prueba (Seed Data)
const INITIAL_SPECIALTIES = [
  { id: 'ESP-01', nombre: 'Medicina General', descripcion: 'Atención primaria y diagnóstico integral' },
  { id: 'ESP-02', nombre: 'Cardiología', descripcion: 'Salud cardiovascular, hipertensión y arritmias' },
  { id: 'ESP-03', nombre: 'Pediatría', descripcion: 'Cuidado y control del niño sano y patologías infantiles' },
  { id: 'ESP-04', nombre: 'Traumatología', descripcion: 'Tratamiento de fracturas y lesiones osteomusculares' },
];

const INITIAL_SPECIALISTS = [
  {
    id: 'M-01',
    nombre: 'Alejandro',
    apellido: 'Ravelo',
    especialidades: ['ESP-01', 'ESP-02'],
    consultorio: 'Cons. A-12, Piso 1',
    horariosAsignados: [
      { id: 'H-1', dia: 'Lunes', horaInicio: '08:00', horaFin: '13:00', especialidadId: 'ESP-01', consultorio: 'Cons. A-12, Piso 1' },
      { id: 'H-2', dia: 'Miércoles', horaInicio: '14:00', horaFin: '19:00', especialidadId: 'ESP-02', consultorio: 'Cons. A-12, Piso 1' },
    ]
  },
  {
    id: 'M-02',
    nombre: 'Gabriela',
    apellido: 'Mendoza',
    especialidades: ['ESP-02', 'ESP-03'],
    consultorio: 'Cons. B-05, Planta Baja',
    horariosAsignados: [
      { id: 'H-3', dia: 'Martes', horaInicio: '09:00', horaFin: '14:00', especialidadId: 'ESP-03', consultorio: 'Cons. B-05, Planta Baja' },
      { id: 'H-4', dia: 'Jueves', horaInicio: '08:00', horaFin: '12:00', especialidadId: 'ESP-02', consultorio: 'Cons. B-05, Planta Baja' },
    ]
  },
  {
    id: 'M-03',
    nombre: 'Carlos',
    apellido: 'Yánez',
    especialidades: ['ESP-04'],
    consultorio: 'Cons. C-22, Piso 2',
    horariosAsignados: [
      { id: 'H-5', dia: 'Viernes', horaInicio: '10:00', horaFin: '15:00', especialidadId: 'ESP-04', consultorio: 'Cons. C-22, Piso 2' },
    ]
  },
  {
    id: 'M-04',
    nombre: 'Vanessa',
    apellido: 'Silva',
    especialidades: ['ESP-01'],
    consultorio: 'Cons. D-08, Piso 3',
    horariosAsignados: [
      { id: 'H-6', dia: 'Lunes', horaInicio: '14:00', horaFin: '19:00', especialidadId: 'ESP-01', consultorio: 'Cons. D-08, Piso 3' },
    ]
  }
];

const INITIAL_USERS = [
  { cedula: 'V-12345678', nombre: 'Andrés', apellido: 'Ávila', correo: 'admin@avila.com', clave: '123456', rol: 'Admin' },
  { cedula: 'V-87654321', nombre: 'María', apellido: 'Pérez', correo: 'secretaria@avila.com', clave: '123456', rol: 'Secretario' },
  { cedula: 'V-11223344', nombre: 'Juan', apellido: 'Lovera', correo: 'paciente_test@gmail.com', clave: '123456', rol: 'Paciente' },
  { cedula: 'V-99887766', nombre: 'Elena', apellido: 'Rivas', correo: 'paciente_con_cita@gmail.com', clave: '123456', rol: 'Paciente' },
  { cedula: 'M-01', nombre: 'Dr. Alejandro', apellido: 'Ravelo', correo: 'ravelo@avila.com', clave: '123456', rol: 'Especialista' },
  { cedula: 'M-02', nombre: 'Dra. Gabriela', apellido: 'Mendoza', correo: 'mendoza@avila.com', clave: '123456', rol: 'Especialista' }
];

const INITIAL_APPOINTMENTS = [
  {
    id: 'C-001',
    pacienteId: 'V-99887766', // Elena Rivas ya tiene una cita activa
    especialistaId: 'M-01',
    especialidadId: 'ESP-01',
    fecha: '2026-05-28',
    diaSemana: 'Jueves',
    horario: '08:00 a.m. - 09:00 a.m.',
    consultorio: 'Cons. A-12, Piso 1',
    estado: 'Activa'
  }
];

export const AppProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState(() => {
    const local = localStorage.getItem('avila_users');
    return local ? JSON.parse(local) : INITIAL_USERS;
  });

  const [especialidades, setEspecialidades] = useState(() => {
    const local = localStorage.getItem('avila_specialties');
    return local ? JSON.parse(local) : INITIAL_SPECIALTIES;
  });

  const [especialistas, setEspecialistas] = useState(() => {
    const local = localStorage.getItem('avila_specialists');
    return local ? JSON.parse(local) : INITIAL_SPECIALISTS;
  });

  const [citas, setCitas] = useState(() => {
    const local = localStorage.getItem('avila_appointments');
    return local ? JSON.parse(local) : INITIAL_APPOINTMENTS;
  });

  const [currentUsuario, setCurrentUsuario] = useState(() => {
    const local = localStorage.getItem('avila_logged_user');
    // Por defecto, pre-iniciamos como el Paciente de Prueba para facilitar el uso
    return local ? JSON.parse(local) : INITIAL_USERS[2];
  });

  // Guardar en LocalStorage cada vez que cambien los estados
  useEffect(() => {
    localStorage.setItem('avila_users', JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    localStorage.setItem('avila_specialties', JSON.stringify(especialidades));
  }, [especialidades]);

  useEffect(() => {
    localStorage.setItem('avila_specialists', JSON.stringify(especialistas));
  }, [especialistas]);

  useEffect(() => {
    localStorage.setItem('avila_appointments', JSON.stringify(citas));
  }, [citas]);

  useEffect(() => {
    localStorage.setItem('avila_logged_user', JSON.stringify(currentUsuario));
  }, [currentUsuario]);

  // HU1 - Registrar Paciente
  const registrarUsuario = (nuevoUsuario) => {
    // Validaciones
    const { nombre, apellido, cedula, correo, clave } = nuevoUsuario;
    if (!nombre || !apellido || !cedula || !correo || !clave) {
      return { success: false, message: 'Todos los campos son obligatorios.' };
    }

    // Correo único
    const existeCorreo = usuarios.some(u => u.correo.toLowerCase() === correo.toLowerCase());
    if (existeCorreo) {
      return { success: false, message: 'El correo electrónico ya está registrado.' };
    }

    // Cédula única
    const existeCedula = usuarios.some(u => u.cedula === cedula);
    if (existeCedula) {
      return { success: false, message: 'La cédula de identidad ya está registrada.' };
    }

    const usuarioFinal = {
      ...nuevoUsuario,
      rol: 'Paciente' // Por defecto paciente
    };

    setUsuarios(prev => [...prev, usuarioFinal]);
    return { success: true, message: 'Registro completado exitosamente.' };
  };

  // HU2 - Agregar Especialidad (Admin)
  const agregarEspecialidad = (nombre, descripcion, especialistaId) => {
    if (!nombre || !descripcion || !especialistaId) {
      return { success: false, message: 'Debe ingresar nombre, descripción y asignar al menos un especialista obligatoriamente.' };
    }

    // Límite de 50 especialidades
    if (especialidades.length >= 50) {
      return { success: false, message: 'Se ha alcanzado el límite máximo de 50 especialidades en el sistema.' };
    }

    // Especialidad duplicada
    const existeEsp = especialidades.some(e => e.nombre.toLowerCase() === nombre.toLowerCase());
    if (existeEsp) {
      return { success: false, message: 'Esta especialidad médica ya está registrada.' };
    }

    const newId = `ESP-${String(especialidades.length + 1).padStart(2, '0')}`;
    const nuevaEspecialidad = { id: newId, nombre, descripcion };

    // Actualizar especialidad en el especialista asignado
    setEspecialistas(prev => prev.map(m => {
      if (m.id === especialistaId) {
        return {
          ...m,
          especialidades: [...new Set([...m.especialidades, newId])]
        };
      }
      return m;
    }));

    setEspecialidades(prev => [...prev, nuevaEspecialidad]);
    return { success: true, message: `Especialidad "${nombre}" agregada exitosamente con especialista asignado.` };
  };

  // HU3 - Asignar Horarios (Secretario)
  const asignarHorario = (especialistaId, dia, horaInicio, horaFin, consultorio, especialidadId) => {
    if (!especialistaId || !dia || !horaInicio || !horaFin || !consultorio || !especialidadId) {
      return { success: false, message: 'Todos los campos son obligatorios para asignar el horario.' };
    }

    // Conversión a minutos para validaciones
    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);
    const totalMinutosInicio = hIni * 60 + mIni;
    const totalMinutosFin = hFin * 60 + mFin;

    // Rango entre 5:00 a.m. (300 min) y 11:00 p.m. (1380 min)
    const minPermitido = 5 * 60; // 5:00 am
    const maxPermitido = 23 * 60; // 11:00 pm

    if (totalMinutosInicio < minPermitido || totalMinutosFin > maxPermitido) {
      return { success: false, message: 'Los horarios deben estar estrictamente en el rango de 5:00 a.m. a 11:00 p.m.' };
    }

    if (totalMinutosInicio >= totalMinutosFin) {
      return { success: false, message: 'La hora de inicio debe ser menor a la hora de fin.' };
    }

    // Bloque continuo máximo de 5 horas (300 minutos)
    const duracionMinutos = totalMinutosFin - totalMinutosInicio;
    if (duracionMinutos > 300) {
      return { success: false, message: 'La duración del bloque continuo no puede exceder las 5 horas.' };
    }

    // Buscar el especialista
    const medico = especialistas.find(m => m.id === especialistaId);
    if (!medico) {
      return { success: false, message: 'Especialista no encontrado.' };
    }

    // Validar duplicidad/choque en dos especialidades/consultorios al mismo tiempo
    const hayConflicto = medico.horariosAsignados.some(bloque => {
      if (bloque.dia !== dia) return false;

      const [bHIni, bMIni] = bloque.horaInicio.split(':').map(Number);
      const [bHFin, bMFin] = bloque.horaFin.split(':').map(Number);
      const bMinInicio = bHIni * 60 + bMIni;
      const bMinFin = bHFin * 60 + bMFin;

      // Solapamiento de intervalos
      return totalMinutosInicio < bMinFin && bMinInicio < totalMinutosFin;
    });

    if (hayConflicto) {
      return {
        success: false,
        message: `Conflicto de Horario: El Dr(a). ${medico.nombre} ${medico.apellido} ya tiene asignado un consultorio/bloque en este horario el día ${dia}.`
      };
    }

    // Agregar nuevo bloque
    const newHorarioId = `H-${Date.now()}`;
    const nuevoHorario = {
      id: newHorarioId,
      dia,
      horaInicio,
      horaFin,
      especialidadId,
      consultorio
    };

    setEspecialistas(prev => prev.map(m => {
      if (m.id === especialistaId) {
        return {
          ...m,
          horariosAsignados: [...m.horariosAsignados, nuevoHorario]
        };
      }
      return m;
    }));

    return { success: true, message: 'Horario asignado de forma exitosa sin conflictos.' };
  };

  // HU4 - Realizar Cita
  const agendarCita = (pacienteCedula, especialistaId, especialidadId, fecha, horarioSlot, consultorio, diaSemana) => {
    return new Promise((resolve) => {
      // Simular latencia de red de 1.2 segundos para una UX premium
      setTimeout(() => {
        // Validar una sola cita activa por paciente
        const tieneCitaActiva = citas.some(c => c.pacienteId === pacienteCedula && c.estado === 'Activa');
        if (tieneCitaActiva) {
          resolve({
            success: false,
            message: 'Operación denegada: Ya posee una (1) cita activa en el sistema. Debe cancelar la actual para agendar una nueva.'
          });
          return;
        }

        const nuevaCita = {
          id: `C-${Date.now()}`,
          pacienteId: pacienteCedula,
          especialistaId,
          especialidadId,
          fecha,
          diaSemana,
          horario: horarioSlot,
          consultorio,
          estado: 'Activa'
        };

        setCitas(prev => [nuevaCita, ...prev]);
        resolve({ success: true, message: 'Su cita ha sido agendada con éxito en el Centro Médico Ávila.' });
      }, 1200);
    });
  };

  // Cancelar Cita
  const cancelarCita = (citaId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCitas(prev => prev.map(c => {
          if (c.id === citaId) {
            return { ...c, estado: 'Cancelada' };
          }
          return c;
        }));
        resolve({ success: true, message: 'La cita ha sido cancelada exitosamente.' });
      }, 800);
    });
  };

  // Completar Cita (Médico)
  const completarCita = (citaId) => {
    setCitas(prev => prev.map(c => {
      if (c.id === citaId) {
        return { ...c, estado: 'Completada' };
      }
      return c;
    }));
    return { success: true, message: 'Cita marcada como completada con éxito.' };
  };

  // Login simulado
  const login = (correo, clave) => {
    const user = usuarios.find(u => u.correo.toLowerCase() === correo.toLowerCase() && u.clave === clave);
    if (user) {
      setCurrentUsuario(user);
      return { success: true, user };
    }
    return { success: false, message: 'Credenciales inválidas. Intente de nuevo.' };
  };

  const logout = () => {
    setCurrentUsuario(null);
  };

  return (
    <AppContext.Provider value={{
      usuarios,
      especialidades,
      especialistas,
      citas,
      currentUsuario,
      setCurrentUsuario,
      registrarUsuario,
      agregarEspecialidad,
      asignarHorario,
      agendarCita,
      cancelarCita,
      completarCita,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};
