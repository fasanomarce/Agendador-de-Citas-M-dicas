import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Heart, 
  Baby, 
  Activity, 
  Bone, 
  UserCheck 
} from 'lucide-react';

export default function Landing() {
  const { especialidades, especialistas } = useContext(AppContext);

  const getSpecialtyIcon = (id) => {
    switch (id) {
      case 'ESP-01': return <Activity className="w-6 h-6 text-clinica-500" />;
      case 'ESP-02': return <Heart className="w-6 h-6 text-rose-500" />;
      case 'ESP-03': return <Baby className="w-6 h-6 text-sky-500" />;
      case 'ESP-04': return <Bone className="w-6 h-6 text-amber-500" />;
      default: return <ShieldCheck className="w-6 h-6 text-clinica-500" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Background blobs for premium depth */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-gradient-to-br from-clinica-200/40 to-cyan-200/20 rounded-full blur-3xl opacity-70 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200/30 to-purple-200/20 rounded-full blur-3xl opacity-50 -translate-x-1/4 translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            
            {/* Texto Hero */}
            <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-clinica-100 text-clinica-800 rounded-full text-xs font-semibold border border-clinica-200">
                <MapPin className="w-3.5 h-3.5" />
                <span>San Bernardino, Caracas (Al pie del Ávila)</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Tu Salud en Manos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-clinica-600 to-clinica-400">Especialistas</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                Agenda tus consultas médicas de forma rápida, segura y sin complicaciones. Exclusivo para la comunidad caraqueña con atención de primera clase.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
                <Link
                  to="/paciente"
                  className="w-full sm:w-auto text-center px-8 py-3.5 bg-gradient-to-r from-clinica-600 to-clinica-500 text-white font-medium rounded-2xl shadow-lg shadow-clinica-500/20 hover:shadow-xl hover:shadow-clinica-500/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Agendar Cita Ahora
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto text-center px-8 py-3.5 bg-white text-slate-700 font-medium rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all duration-200"
                >
                  Crear Cuenta Paciente
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 w-full max-w-md border-t border-slate-200/80">
                <div>
                  <span className="block text-2xl font-bold text-slate-900">{especialidades.length}</span>
                  <span className="text-xs text-slate-500">Especialidades</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900">{especialistas.length}</span>
                  <span className="text-xs text-slate-500">Médicos Activos</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900">100%</span>
                  <span className="text-xs text-slate-500">Presencial Caracas</span>
                </div>
              </div>

            </div>

            {/* Ilustración / Tarjeta Visual de Ávila */}
            <div className="md:col-span-5 relative flex justify-center">
              <div className="w-full max-w-[380px] p-6 glass-card rounded-3xl shadow-premium border border-white/60 relative overflow-hidden group hover:shadow-glass-hover transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100 rounded-full blur-2xl -z-10 opacity-70"></div>
                
                <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-md">
                    <Activity className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Reserva tu Cita</h3>
                    <p className="text-[11px] text-slate-500">En menos de 5 minutos</p>
                  </div>
                </div>

                <div className="py-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">1</div>
                    <span className="text-xs text-slate-600 font-medium">Selecciona la Especialidad Médica</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">2</div>
                    <span className="text-xs text-slate-600 font-medium">Escoge tu Especialista de confianza</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">3</div>
                    <span className="text-xs text-slate-600 font-medium">Elige el bloque horario disponible</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[11px] text-slate-500 font-medium block">Atención Rápida Garantizada</span>
                  <span className="text-xs font-bold text-clinica-700 block mt-0.5">Centro Médico Ávila</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="bg-slate-100/60 py-16 border-t border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nuestras Especialidades</h2>
            <p className="text-sm text-slate-600">Contamos con médicos altamente capacitados para tu bienestar integral en Caracas.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {especialidades.map((esp) => (
              <div 
                key={esp.id} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-slate-50 rounded-xl w-fit mb-4">
                    {getSpecialtyIcon(esp.id)}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">{esp.nombre}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{esp.descripcion}</p>
                </div>
                <span className="text-[11px] font-semibold text-clinica-600">Servicio Disponible</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-clinica-900 to-clinica-800 rounded-3xl text-white p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold">¿Tienes dudas sobre los consultorios?</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Nuestra clínica cuenta con personal listo para orientarte. Recuerda que no realizamos cobros en línea; todo el proceso de facturación presencial se procesa al momento de tu cita.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs">Lun a Vie: 5:00 am - 11:00 pm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs">Seguro de Salud Aceptado</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <Link
                  to="/login"
                  className="px-8 py-3.5 bg-cyan-400 text-slate-950 font-bold rounded-2xl hover:bg-cyan-300 hover:shadow-lg transition-all duration-200"
                >
                  Acceder a la Plataforma
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
