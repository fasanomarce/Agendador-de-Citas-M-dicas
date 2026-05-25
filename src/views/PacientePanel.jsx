import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Trash2, 
  Heart, 
  Baby, 
  Bone, 
  ShieldCheck 
} from 'lucide-react';

export default function PacientePanel() {
  const { 
    currentUsuario, 
    citas, 
    especialistas, 
    especialidades, 
    usuarios,
    agendarCita, 
    cancelarCita 
  } = useContext(AppContext);

  // Stepper State
  const [step, setStep] = useState(1);
  
  // Selections
  const [selectedPacienteCedula, setSelectedPacienteCedula] = useState('');
  const [selectedEspecialidad, setSelectedEspecialidad] = useState(null);
  const [selectedEspecialista, setSelectedEspecialista] = useState(null);
  const [selectedFecha, setSelectedFecha] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedBloque, setSelectedBloque] = useState(null);

  // Asynchronous Loading States
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Sincronizar Cédula del paciente activo
  useEffect(() => {
    if (currentUsuario) {
      if (currentUsuario.rol === 'Paciente') {
        setSelectedPacienteCedula(currentUsuario.cedula);
      } else if (currentUsuario.rol === 'Secretario') {
        // Por defecto, seleccionar primer paciente de prueba que no sea secretario/admin
        const pacientes = usuarios.filter(u => u.rol === 'Paciente');
        if (pacientes.length > 0) {
          setSelectedPacienteCedula(pacientes[0].cedula);
        }
      }
    }
  }, [currentUsuario, usuarios]);

  // Si no está logueado
  if (!currentUsuario) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-3xl p-8 shadow-sm flex flex-col items-center gap-4">
          <AlertCircle className="w-16 h-16 text-amber-600 animate-bounce" />
          <h2 className="text-2xl font-black">Acceso Denegado</h2>
          <p className="text-sm text-slate-600 max-w-md">
            Por favor, inicia sesión para acceder a tu panel de citas médicas.
          </p>
        </div>
      </div>
    );
  }

  // Filtrar médicos según la especialidad seleccionada
  const getMedicosPorEspecialidad = () => {
    if (!selectedEspecialidad) return [];
    return especialistas.filter(m => m.especialidades.includes(selectedEspecialidad.id));
  };

  // Generar ranuras de 1 hora basadas en el bloque horario
  const generarSlotsHorarios = (bloque) => {
    if (!bloque) return [];
    const [hIni, mIni] = bloque.horaInicio.split(':').map(Number);
    const [hFin, mFin] = bloque.horaFin.split(':').map(Number);
    
    const slots = [];
    let startMin = hIni * 60 + mIni;
    const endMin = hFin * 60 + mFin;

    while (startMin + 60 <= endMin) {
      const sh = Math.floor(startMin / 60);
      const sm = startMin % 60;
      const eh = Math.floor((startMin + 60) / 60);
      const em = (startMin + 60) % 60;

      const formatTime = (h, m) => {
        const ampm = h >= 12 ? 'p.m.' : 'a.m.';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const displayM = String(m).padStart(2, '0');
        return `${displayH}:${displayM} ${ampm}`;
      };

      slots.push(`${formatTime(sh, sm)} - ${formatTime(eh, em)}`);
      startMin += 60;
    }
    return slots;
  };

  // Obtener los datos de la cita activa de este paciente si posee una
  const getCitaActiva = () => {
    return citas.find(c => c.pacienteId === selectedPacienteCedula && c.estado === 'Activa');
  };

  const citaActiva = getCitaActiva();

  // Cancelar la cita actual de forma asíncrona
  const handleCancelarCita = async (citaId) => {
    setError('');
    setProcesando(true);
    const res = await cancelarCita(citaId);
    setProcesando(false);
    if (res.success) {
      setExito(res.message);
      // Resetear estados de flujo
      setStep(1);
      setSelectedEspecialidad(null);
      setSelectedEspecialista(null);
      setSelectedFecha('');
      setSelectedSlot('');
      setSelectedBloque(null);
      setTimeout(() => setExito(''), 3000);
    } else {
      setError(res.message);
    }
  };

  // Guardar cita de forma asíncrona simulada (< 1.5 segundos)
  const handleAgendar = async () => {
    if (!selectedEspecialidad || !selectedEspecialista || !selectedFecha || !selectedSlot || !selectedBloque) {
      setError('Por favor complete todos los pasos del agendamiento.');
      return;
    }

    setError('');
    setProcesando(true);

    const res = await agendarCita(
      selectedPacienteCedula,
      selectedEspecialista.id,
      selectedEspecialidad.id,
      selectedFecha,
      selectedSlot,
      selectedEspecialista.consultorio,
      selectedBloque.dia
    );

    setProcesando(false);

    if (res.success) {
      setExito(res.message);
      setStep(4); // Ir a confirmación final
    } else {
      setError(res.message);
    }
  };

  const getEspecialidadIcon = (id) => {
    switch (id) {
      case 'ESP-01': return <Activity className="w-5 h-5 text-clinica-500" />;
      case 'ESP-02': return <Heart className="w-5 h-5 text-rose-500" />;
      case 'ESP-03': return <Baby className="w-5 h-5 text-sky-500" />;
      case 'ESP-04': return <Bone className="w-5 h-5 text-amber-500" />;
      default: return <ShieldCheck className="w-5 h-5 text-clinica-500" />;
    }
  };

  const getPacienteNombreCompleto = (cedula) => {
    const u = usuarios.find(x => x.cedula === cedula);
    return u ? `${u.nombre} ${u.apellido}` : cedula;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-clinica-900 to-clinica-800 text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-300" />
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-300">
              {currentUsuario.rol === 'Secretario' ? 'Gestión de Citas (Secretario)' : 'Portal del Paciente'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Agendar Cita Médica</h1>
          <p className="text-xs text-slate-300">
            {currentUsuario.rol === 'Secretario' 
              ? 'Agenda citas para los pacientes de la clínica verificando restricciones en tiempo real.' 
              : 'Reserva tu consulta en el Centro Médico Ávila de forma rápida y sencilla.'
            }
          </p>
        </div>
      </div>

      {/* Alerta de Éxito o Error global */}
      {exito && step !== 4 && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{exito}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selector de Pacientes si es Secretario */}
      {currentUsuario.rol === 'Secretario' && step === 1 && !citaActiva && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Seleccionar Paciente a Agendar Cita:
          </label>
          <select
            value={selectedPacienteCedula}
            onChange={(e) => setSelectedPacienteCedula(e.target.value)}
            className="block w-full sm:max-w-md px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500"
          >
            {usuarios.filter(u => u.rol === 'Paciente').map(p => (
              <option key={p.cedula} value={p.cedula}>
                {p.nombre} {p.apellido} ({p.cedula})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* RESTRICCIÓN DE CITA ACTIVA MÁXIMA (HU4) */}
      {citaActiva ? (
        <div className="grid md:grid-cols-12 gap-8">
          {/* Banner de bloqueo */}
          <div className="md:col-span-8 bg-amber-50/70 border border-amber-200 p-6 md:p-8 rounded-3xl space-y-4">
            <div className="p-3 bg-amber-100 rounded-2xl w-fit text-amber-700 animate-pulse">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900">Agendamiento Bloqueado temporalmente</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                El sistema detectó que {currentUsuario.rol === 'Secretario' ? 'el paciente seleccionado' : 'tú'} posee actualmente una **(1) cita activa** en el Centro Médico Ávila.
              </p>
              <p className="text-xs font-bold text-amber-800">
                Regla de negocio crítica del Sprint 1: Solo se permite una cita activa por usuario paciente para evitar sobrecargas y asegurar la equidad de turnos.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => handleCancelarCita(citaActiva.id)}
                disabled={procesando}
                className="inline-flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-rose-500/10 hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {procesando ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Cancelar Cita Activa para Liberar Cupo
              </button>
            </div>
          </div>

          {/* Tarjeta de Detalles de Cita Activa */}
          <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-clinica-500">Cita Activa Encontrada</span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">Confirmada</span>
              </div>

              <div className="space-y-4 mt-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Paciente:</span>
                  <span className="block text-sm font-bold text-slate-800">{getPacienteNombreCompleto(citaActiva.pacienteId)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Especialidad:</span>
                  <span className="block text-sm font-semibold text-slate-700">{especialidades.find(e => e.id === citaActiva.especialidadId)?.nombre}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Médico Tratante:</span>
                  <span className="block text-sm font-semibold text-slate-700">Dr(a). {especialistas.find(m => m.id === citaActiva.especialistaId)?.nombre} {especialistas.find(m => m.id === citaActiva.especialistaId)?.apellido}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Fecha:</span>
                      <span className="text-xs font-semibold text-slate-700">{citaActiva.fecha}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Horario:</span>
                      <span className="text-xs font-semibold text-slate-700">{citaActiva.horario}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed">
              <MapPin className="w-4 h-4 text-clinica-500 shrink-0 mt-0.5" />
              <span>Debe presentarse en el consultorio **{citaActiva.consultorio}** con 15 minutos de anticipación.</span>
            </div>
          </div>
        </div>
      ) : (
        /* FLUJO DE RESERVA ACTIVO (HU4) */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-premium overflow-hidden">
          
          {/* Stepper Header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 text-xs font-semibold text-slate-500 overflow-x-auto">
            <div className="flex items-center gap-6 shrink-0 py-1">
              <span className={`flex items-center gap-1.5 ${step >= 1 ? 'text-clinica-600 font-bold' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-clinica-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
                Especialidad
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <span className={`flex items-center gap-1.5 ${step >= 2 ? 'text-clinica-600 font-bold' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-clinica-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                Especialista
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <span className={`flex items-center gap-1.5 ${step >= 3 ? 'text-clinica-600 font-bold' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-clinica-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
                Fecha y Turno
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <span className={`flex items-center gap-1.5 ${step === 4 ? 'text-clinica-600 font-bold' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? 'bg-clinica-600 text-white' : 'bg-slate-200 text-slate-500'}`}>4</span>
                Confirmación
              </span>
            </div>
            {step < 4 && (
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold bg-slate-200/50 px-2.5 py-1 rounded-md shrink-0">
                Paso {step} de 3
              </span>
            )}
          </div>

          {/* Stepper Body */}
          <div className="p-6 md:p-8 min-h-[350px]">
            {procesando ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-12 h-12 border-4 border-clinica-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Procesando Reserva en Ávila...</span>
              </div>
            ) : (
              <>
                {/* PASO 1: SELECCIONAR ESPECIALIDAD */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Selecciona una Especialidad Médica</h2>
                      <p className="text-xs text-slate-500">¿Qué tipo de consulta o especialidad requieres el día de hoy?</p>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {especialidades.map(esp => (
                        <button
                          key={esp.id}
                          onClick={() => {
                            setSelectedEspecialidad(esp);
                            setSelectedEspecialista(null); // Limpiar médico si cambia especialidad
                            setStep(2);
                          }}
                          className="flex flex-col items-start p-5 bg-slate-50/50 hover:bg-clinica-50 border border-slate-200 hover:border-clinica-200 rounded-2xl text-left transition-all group"
                        >
                          <div className="p-3 bg-white border border-slate-100 rounded-xl group-hover:scale-105 transition-transform">
                            {getEspecialidadIcon(esp.id)}
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm mt-4">{esp.nombre}</h3>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{esp.descripcion}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PASO 2: SELECCIONAR ESPECIALISTA */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Selecciona el Especialista</h2>
                        <p className="text-xs text-slate-500">Médicos activos para la especialidad: **{selectedEspecialidad.nombre}**</p>
                      </div>
                      <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Volver
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {getMedicosPorEspecialidad().length > 0 ? (
                        getMedicosPorEspecialidad().map(medico => (
                          <button
                            key={medico.id}
                            onClick={() => {
                              setSelectedEspecialista(medico);
                              setSelectedBloque(null);
                              setSelectedSlot('');
                              setStep(3);
                            }}
                            className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-clinica-50 border border-slate-200 hover:border-clinica-200 rounded-2xl text-left transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 text-xs font-bold">
                                {medico.nombre[0]}{medico.apellido[0]}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm">Dr(a). {medico.nombre} {medico.apellido}</h3>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                  <MapPin className="w-3 h-3 text-cyan-500" />
                                  <span>{medico.consultorio}</span>
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                          </button>
                        ))
                      ) : (
                        <div className="col-span-2 py-8 text-center text-xs text-slate-400 italic">
                          No existen médicos actualmente asignados a esta especialidad médica.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PASO 3: SELECCIONAR BLOQUE, FECHA Y RANURA */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Fecha y Horario de Consulta</h2>
                        <p className="text-xs text-slate-500">Selecciona el turno disponible del Dr(a). **{selectedEspecialista.nombre} {selectedEspecialista.apellido}**</p>
                      </div>
                      <button
                        onClick={() => setStep(2)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Volver
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Lado Izquierdo: Bloques de Turnos Disponibles */}
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          1. Seleccione el Turno Semanal:
                        </label>
                        
                        <div className="space-y-2">
                          {selectedEspecialista.horariosAsignados.length > 0 ? (
                            selectedEspecialista.horariosAsignados.map(bloque => (
                              <button
                                key={bloque.id}
                                onClick={() => {
                                  setSelectedBloque(bloque);
                                  setSelectedSlot(''); // Reiniciar slot seleccionado
                                }}
                                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-xs transition-all ${
                                  selectedBloque?.id === bloque.id
                                    ? 'bg-clinica-500 text-white border-clinica-600 shadow-md shadow-clinica-500/10'
                                    : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <div className="space-y-1">
                                  <span className="font-bold block">{bloque.dia}</span>
                                  <span className={selectedBloque?.id === bloque.id ? 'text-slate-100' : 'text-slate-400'}>
                                    Horas: {bloque.horaInicio} - {bloque.horaFin}
                                  </span>
                                </div>
                                <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                                  selectedBloque?.id === bloque.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {bloque.consultorio.split(',')[0]}
                                </span>
                              </button>
                            ))
                          ) : (
                            <span className="text-xs text-rose-500 italic">Este especialista no tiene turnos programados por el Secretario esta semana.</span>
                          )}
                        </div>

                        {selectedBloque && (
                          <div className="space-y-3 pt-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                              2. Seleccione una Fecha de Consulta:
                            </label>
                            <input
                              type="date"
                              required
                              value={selectedFecha}
                              onChange={(e) => setSelectedFecha(e.target.value)}
                              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500"
                            />
                            <span className="text-[10px] text-slate-400 block">Debe seleccionar un día que corresponda al turno de **{selectedBloque.dia}** (ej. si el turno es Lunes, seleccione un Lunes en el calendario).</span>
                          </div>
                        )}
                      </div>

                      {/* Lado Derecho: Horarios Fraccionados */}
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          3. Ranuras Disponibles (Bloque de 1 Hora):
                        </label>
                        
                        {selectedBloque ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {generarSlotsHorarios(selectedBloque).map((slot, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-3 rounded-2xl border text-center text-xs font-semibold transition-all ${
                                  selectedSlot === slot
                                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="h-32 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400 italic">
                            Por favor seleccione un turno semanal en la izquierda primero.
                          </div>
                        )}

                        {selectedSlot && selectedFecha && (
                          <div className="pt-6">
                            <button
                              onClick={handleAgendar}
                              className="w-full py-3.5 bg-gradient-to-r from-clinica-600 to-clinica-500 text-white rounded-2xl text-xs font-semibold shadow-md shadow-clinica-500/10 hover:shadow-lg transition-all"
                            >
                              Reservar y Registrar Cita Presencial
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* PASO 4: CONFIRMACIÓN Y COMPROBANTE FINAL (HU4) */}
                {step === 4 && (
                  <div className="max-w-md mx-auto py-6 space-y-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle className="w-10 h-10 animate-bounce" />
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-xl font-bold text-slate-900">¡Reserva Completada!</h2>
                      <p className="text-xs text-slate-500">Se ha guardado tu cita de forma exitosa en el Centro Médico Ávila.</p>
                    </div>

                    {/* Comprobante */}
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 text-left space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Comprobante de Cita</span>
                        <span className="text-[11px] font-black text-slate-900">Nº AV-{Date.now().toString().slice(-6)}</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Paciente:</span>
                          <span className="font-bold text-slate-800">{getPacienteNombreCompleto(selectedPacienteCedula)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Especialidad:</span>
                          <span className="font-semibold text-slate-700">{selectedEspecialidad?.nombre}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Especialista:</span>
                          <span className="font-semibold text-slate-700">Dr(a). {selectedEspecialista?.nombre} {selectedEspecialista?.apellido}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Fecha:</span>
                            <span className="font-semibold text-slate-700">{selectedFecha}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Horario:</span>
                            <span className="font-semibold text-slate-700">{selectedSlot}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-cyan-50/50 border border-cyan-100 rounded-2xl flex items-start gap-2 text-[10px] text-cyan-800 leading-normal">
                        <MapPin className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                        <span>Presentarse directamente en: **{selectedEspecialista?.consultorio}**. No requiere realizar ningún abono por adelantado.</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setStep(1);
                          setSelectedEspecialidad(null);
                          setSelectedEspecialista(null);
                          setSelectedFecha('');
                          setSelectedSlot('');
                          setSelectedBloque(null);
                          setExito('');
                        }}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold transition-all"
                      >
                        Cerrar Comprobante
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      )}
      
    </div>
  );
}
