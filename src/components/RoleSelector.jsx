import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Shield, Users, User, ClipboardList, Activity } from 'lucide-react';

export default function RoleSelector() {
  const { currentUsuario, setCurrentUsuario, usuarios } = useContext(AppContext);

  const rolesDemo = [
    {
      label: 'Paciente (Sin Cita)',
      correo: 'paciente_test@gmail.com',
      icon: <User className="w-4 h-4" />,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
    },
    {
      label: 'Paciente (Con Cita)',
      correo: 'paciente_con_cita@gmail.com',
      icon: <ClipboardList className="w-4 h-4" />,
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
    },
    {
      label: 'Secretario',
      correo: 'secretaria@avila.com',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
    },
    {
      label: 'Administrador',
      correo: 'admin@avila.com',
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
    },
    {
      label: 'Especialista (Médico)',
      correo: 'ravelo@avila.com',
      icon: <Activity className="w-4 h-4" />,
      color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
    }
  ];

  const handleSwitch = (correo) => {
    const targetUser = usuarios.find(u => u.correo === correo);
    if (targetUser) {
      setCurrentUsuario(targetUser);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 py-2.5 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 animate-ping rounded-full bg-cyan-400 opacity-75"></span>
          <span className="font-semibold text-cyan-400 tracking-wider uppercase text-[10px]">Entorno de Demostración</span>
          <span className="text-slate-400">| Simula cambiar de rol instantáneamente:</span>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          {rolesDemo.map((item, idx) => {
            const isActive = currentUsuario?.correo === item.correo;
            return (
              <button
                key={idx}
                onClick={() => handleSwitch(item.correo)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold scale-105 shadow-sm shadow-cyan-500/20'
                    : `bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500`
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
