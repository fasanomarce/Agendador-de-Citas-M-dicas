import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, Plus, CheckCircle, ShieldAlert, Clock, MapPin, CalendarDays, UserCheck } from 'lucide-react';

export default function SecretarioPanel() {
  const { 
    currentUsuario, 
    especialistas, 
    especialidades, 
    asignarHorario 
  } = useContext(AppContext);

  // Form State
  const [especialistaId, setEspecialistaId] = useState('');
  const [dia, setDia] = useState('');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('12:00');
  const [consultorio, setConsultorio] = useState('');
  const [especialidadId, setEspecialidadId] = useState('');

  // Specialties filtered for the selected specialist
  const [filteredSpecialties, setFilteredSpecialties] = useState([]);

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Seguridad
  if (!currentUsuario || currentUsuario.rol !== 'Secretario') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-3xl p-8 shadow-sm flex flex-col items-center gap-4">
          <ShieldAlert className="w-16 h-16 text-amber-600 animate-bounce" />
          <h2 className="text-2xl font-black">Acceso Restringido - Secretaría</h2>
          <p className="text-sm text-slate-600 max-w-md">
            Esta sección es exclusiva para el rol de **Secretario**. Por favor, utiliza la barra superior de demostración para cambiar de rol.
          </p>
        </div>
      </div>
    );
  }

  // Filtrar especialidades cuando se cambia de médico
  useEffect(() => {
    if (especialistaId) {
      const medico = especialistas.find(m => m.id === especialistaId);
      if (medico) {
        const esps = especialidades.filter(e => medico.especialidades.includes(e.id));
        setFilteredSpecialties(esps);
        if (esps.length > 0) {
          setEspecialidadId(esps[0].id);
        } else {
          setEspecialidadId('');
        }
      }
    } else {
      setFilteredSpecialties([]);
      setEspecialidadId('');
    }
  }, [especialistaId, especialistas, especialidades]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!especialistaId || !dia || !horaInicio || !horaFin || !consultorio.trim() || !especialidadId) {
      setError('Por favor, complete todos los campos del formulario.');
      return;
    }

    const res = asignarHorario(
      especialistaId,
      dia,
      horaInicio,
      horaFin,
      consultorio.trim(),
      especialidadId
    );

    if (res.success) {
      setExito(res.message);
      // Resetear algunos campos
      setDia('');
      setConsultorio('');
    } else {
      setError(res.message);
    }
  };

  const getEspecialidadNombre = (id) => {
    const esp = especialidades.find(e => e.id === id);
    return esp ? esp.nombre : 'General';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-clinica-800 text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-300" />
            <span className="text-xs uppercase font-bold tracking-wider text-blue-300">Gestión de Secretaría</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Asignación de Horarios y Consultorios</h1>
          <p className="text-xs text-slate-300">
            Control de disponibilidad horaria para médicos y consultores médicos del Centro Médico Ávila.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Formulario Asignación Horaria HU3 */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Programar Turno de Especialista</h2>
              <p className="text-xs text-slate-500 mt-0.5">Controla la agenda y previene choques en salas médicas.</p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {exito && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-2xl flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{exito}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Médico Especialista
                </label>
                <select
                  required
                  value={especialistaId}
                  onChange={(e) => setEspecialistaId(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500"
                >
                  <option value="">-- Seleccionar Médico --</option>
                  {especialistas.map(m => (
                    <option key={m.id} value={m.id}>
                      Dr(a). {m.nombre} {m.apellido}
                    </option>
                  ))}
                </select>
              </div>

              {especialistaId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Especialidad a Asignar en este Bloque
                  </label>
                  <select
                    required
                    value={especialidadId}
                    onChange={(e) => setEspecialidadId(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500"
                  >
                    {filteredSpecialties.map(e => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Día
                  </label>
                  <select
                    required
                    value={dia}
                    onChange={(e) => setDia(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500"
                  >
                    <option value="">-- Seleccione --</option>
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                    <option value="Sábado">Sábado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Consultorio / Sala
                  </label>
                  <input
                    type="text"
                    required
                    value={consultorio}
                    onChange={(e) => setConsultorio(e.target.value)}
                    placeholder="ej. Cons. A-12"
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    required
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hora de Fin
                  </label>
                  <input
                    type="time"
                    required
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Restricciones Médicas:</span>
                <p>• Los turnos deben registrarse entre las **5:00 a.m. y 11:00 p.m.**</p>
                <p>• Un bloque continuo no puede superar las **5 horas**.</p>
                <p>• El sistema validará activamente que el especialista no coincida en el mismo horario en consultorios paralelos.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Asignar Turno Horario
              </button>

            </form>
          </div>
        </div>

        {/* Visualizador de Horarios en Tiempo Real */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Agenda Activa de Especialistas</h2>
              <p className="text-xs text-slate-500 mt-0.5">Control de cobertura y detección de colisiones de turnos.</p>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[520px] pr-2">
              {especialistas.map(medico => (
                <div 
                  key={medico.id}
                  className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200/60 transition-all"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">Dr(a). {medico.nombre} {medico.apellido}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{medico.consultorio}</span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {medico.horariosAsignados.length > 0 ? (
                      medico.horariosAsignados.map(bloque => (
                        <div 
                          key={bloque.id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white border border-slate-200/60 rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="font-bold text-slate-700 min-w-[70px]">{bloque.dia}</span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-600">{getEspecialidadNombre(bloque.especialidadId)}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{bloque.horaInicio} - {bloque.horaFin}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-100">
                              <MapPin className="w-3 h-3 text-cyan-500" />
                              <span>{bloque.consultorio}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic block py-1">No posee bloques horarios asignados.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
