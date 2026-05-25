import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, CheckCircle, ShieldAlert, Activity, Calendar, Clock, MapPin, BadgeCheck } from 'lucide-react';

export default function EspecialistaPanel() {
  const { currentUsuario, citas, especialistas, completarCita, usuarios } = useContext(AppContext);
  const [exito, setExito] = useState('');

  // Guardia de Seguridad
  if (!currentUsuario || currentUsuario.rol !== 'Especialista') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-3xl p-8 shadow-sm flex flex-col items-center gap-4">
          <ShieldAlert className="w-16 h-16 text-amber-600 animate-bounce" />
          <h2 className="text-2xl font-black">Acceso Restringido - Especialista Médico</h2>
          <p className="text-sm text-slate-600 max-w-md">
            Esta sección es exclusiva para el rol de **Especialista (Médico)**. Por favor, utiliza la barra superior de demostración para cambiar de rol.
          </p>
        </div>
      </div>
    );
  }

  // Encontrar la ficha del especialista asociada a este usuario médico
  const medicoInfo = especialistas.find(m => `Dr. ${m.nombre}` === currentUsuario.nombre || m.id === 'M-01'); // Fallback Dr Ravelo para demo

  // Filtrar citas asignadas a este médico
  const citasDelMedico = citas.filter(c => c.especialistaId === medicoInfo?.id);

  const handleCompletar = (citaId) => {
    const res = completarCita(citaId);
    if (res.success) {
      setExito('La cita médica ha sido marcada como Completada con éxito.');
      setTimeout(() => setExito(''), 3000);
    }
  };

  const getPacienteNombreCompleto = (cedula) => {
    const u = usuarios.find(x => x.cedula === cedula);
    return u ? `${u.nombre} ${u.apellido}` : cedula;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-rose-900 to-clinica-900 text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"></div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-300" />
            <span className="text-xs uppercase font-bold tracking-wider text-rose-300">Agenda Médica del Especialista</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Dr(a). {medicoInfo?.nombre} {medicoInfo?.apellido}</h1>
          <p className="text-xs text-slate-300">
            Consulta tus bloques de guardia y gestiona el estado de tus consultas clínicas diarias.
          </p>
        </div>
      </div>

      {exito && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{exito}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Guardia / Horarios Semanales */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Mis Bloques de Guardia</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tus turnos semanales asignados en consultorio.</p>
            </div>

            <div className="space-y-2.5">
              {medicoInfo?.horariosAsignados.map(bloque => (
                <div 
                  key={bloque.id} 
                  className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 block">{bloque.dia}</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {bloque.horaInicio} - {bloque.horaFin}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl font-semibold">
                    <MapPin className="w-3 h-3" /> {bloque.consultorio.split(',')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Listado de Pacientes en Agenda */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pacientes Programados</h2>
              <p className="text-xs text-slate-500 mt-0.5">Lista de consultas asignadas y su estado clínico actual.</p>
            </div>

            <div className="space-y-3.5">
              {citasDelMedico.length > 0 ? (
                citasDelMedico.map(cita => (
                  <div 
                    key={cita.id} 
                    className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{getPacienteNombreCompleto(cita.pacienteId)}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">(C.I. {cita.pacienteId})</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {cita.fecha} ({cita.diaSemana})</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {cita.horario}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {cita.consultorio}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {cita.estado === 'Activa' ? (
                        <>
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">Pendiente</span>
                          <button
                            onClick={() => handleCompletar(cita.id)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                          >
                            Marcar Completada
                          </button>
                        </>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          cita.estado === 'Completada' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          <BadgeCheck className="w-4 h-4 shrink-0" />
                          {cita.estado}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 italic">
                  No posee citas asignadas en su historial.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
