import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, Plus, CheckCircle, ShieldAlert, Users, Award, BadgeCheck } from 'lucide-react';

export default function AdminPanel() {
  const { 
    currentUsuario, 
    especialidades, 
    especialistas, 
    agregarEspecialidad 
  } = useContext(AppContext);

  // Form State
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [especialistaId, setEspecialistaId] = useState('');

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Guardia de Seguridad simulada
  if (!currentUsuario || currentUsuario.rol !== 'Admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-3xl p-8 shadow-sm flex flex-col items-center gap-4">
          <ShieldAlert className="w-16 h-16 text-amber-600 animate-bounce" />
          <h2 className="text-2xl font-black">Acceso Restringido - Administrador</h2>
          <p className="text-sm text-slate-600 max-w-md">
            Esta sección es exclusiva para el rol de **Administrador**. Por favor, utiliza la barra superior de demostración para cambiar de rol.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!nombre.trim() || !descripcion.trim() || !especialistaId) {
      setError('Todos los campos son obligatorios. Recuerde que debe seleccionar al menos un especialista existente.');
      return;
    }

    const res = agregarEspecialidad(nombre.trim(), descripcion.trim(), especialistaId);
    
    if (res.success) {
      setExito(res.message);
      setNombre('');
      setDescripcion('');
      setEspecialistaId('');
    } else {
      setError(res.message);
    }
  };

  // Obtener los especialistas asignados a una especialidad
  const getEspecialistasAsignados = (espId) => {
    return especialistas.filter(m => m.especialidades.includes(espId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 to-clinica-900 text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-300" />
            <span className="text-xs uppercase font-bold tracking-wider text-purple-300">Panel Administrativo</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Gestión de Clínica y Especialidades</h1>
          <p className="text-xs text-slate-300">
            Administra el portafolio médico y controla el cumplimiento de las normativas de registro.
          </p>
        </div>

        {/* Métrica Limite Especialidades */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-4 rounded-2xl flex items-center gap-4 shrink-0">
          <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-300">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-purple-300">Límite Especialidades</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black">{especialidades.length}</span>
              <span className="text-xs font-semibold text-slate-300">/ 50</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Formulario HU2 */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Agregar Nueva Especialidad</h2>
              <p className="text-xs text-slate-500 mt-0.5">Regla: Una especialidad no puede crearse sin un especialista inicial.</p>
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
                  Nombre de la Especialidad
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Neurología"
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Descripción
                </label>
                <textarea
                  required
                  rows="3"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="ej. Diagnóstico y tratamiento de trastornos del cerebro y sistema nervioso..."
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500 focus:bg-white transition-all"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Especialista Inicial (Obligatorio)
                </label>
                <select
                  required
                  value={especialistaId}
                  onChange={(e) => setEspecialistaId(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500"
                >
                  <option value="">-- Seleccione un especialista --</option>
                  {especialistas.map(m => (
                    <option key={m.id} value={m.id}>
                      Dr(a). {m.nombre} {m.apellido} ({m.consultorio})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">Regla Crítica: Asigna obligatoriamente el especialista responsable inicial de este servicio.</span>
              </div>

              <button
                type="submit"
                disabled={especialidades.length >= 50}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-sm font-semibold shadow-md shadow-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Registrar Especialidad
              </button>
            </form>
          </div>
        </div>

        {/* Listado Especialidades */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Especialidades Activas</h2>
              <p className="text-xs text-slate-500 mt-0.5">Control de cobertura médica en la Región Metropolitana.</p>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
              {especialidades.map(esp => {
                const medicosAsignados = getEspecialistasAsignados(esp.id);
                return (
                  <div 
                    key={esp.id} 
                    className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200/80 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex px-2 py-0.5 bg-slate-200 rounded text-[9px] font-bold text-slate-600 uppercase mb-1.5">{esp.id}</span>
                        <h3 className="font-bold text-slate-900 text-sm">{esp.nombre}</h3>
                        <p className="text-xs text-slate-500 leading-normal mt-1">{esp.descripcion}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Especialistas Asignados:</span>
                      
                      <div className="flex flex-wrap gap-2">
                        {medicosAsignados.length > 0 ? (
                          medicosAsignados.map(m => (
                            <span 
                              key={m.id} 
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs font-semibold"
                            >
                              <BadgeCheck className="w-3.5 h-3.5" />
                              Dr(a). {m.nombre} {m.apellido}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-semibold text-rose-600 uppercase">Sin especialista (Violación de Regla de Negocio)</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
