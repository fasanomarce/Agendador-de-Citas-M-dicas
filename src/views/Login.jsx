import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Activity, Mail, Lock, ShieldAlert, KeyRound } from 'lucide-react';

export default function Login() {
  const { login, currentUsuario } = useContext(AppContext);
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  // Si ya está logueado, redirigir según rol
  useEffect(() => {
    if (currentUsuario) {
      redirectByRole(currentUsuario.rol);
    }
  }, [currentUsuario]);

  const redirectByRole = (rol) => {
    switch (rol) {
      case 'Admin':
        navigate('/admin');
        break;
      case 'Secretario':
        navigate('/secretario');
        break;
      case 'Especialista':
        navigate('/especialista');
        break;
      default:
        navigate('/paciente');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!correo || !clave) {
      setError('Por favor complete todos los campos.');
      return;
    }

    const res = login(correo, clave);
    if (res.success) {
      redirectByRole(res.user.rol);
    } else {
      setError(res.message);
    }
  };

  // Botón rápido de demo login
  const handleQuickLogin = (email, password) => {
    const res = login(email, password);
    if (res.success) {
      redirectByRole(res.user.rol);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 -z-10 w-96 h-96 bg-clinica-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-50"></div>

      <div className="w-full max-w-md space-y-8 glass-card p-8 rounded-3xl border border-white/60 shadow-premium">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-tr from-clinica-600 to-clinica-400 rounded-2xl flex items-center justify-center text-white shadow-md">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Iniciar Sesión</h2>
          <p className="mt-1.5 text-xs text-slate-500">
            Ingresa a la plataforma del Centro Médico Ávila
          </p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-start gap-2 animate-shake">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@avila.com"
                className="block w-full pl-10.5 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                required
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="••••••"
                className="block w-full pl-10.5 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-clinica-600 to-clinica-500 text-white rounded-2xl text-sm font-semibold shadow-md shadow-clinica-500/15 hover:shadow-lg hover:shadow-clinica-500/25 hover:-translate-y-0.5 transition-all duration-200"
          >
            Acceder al Sistema
          </button>
        </form>

        {/* Separador */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-white px-3.5 text-slate-400">Acceso Rápido Demo</span>
          </div>
        </div>

        {/* Botones de Acceso Rápido */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            onClick={() => handleQuickLogin('admin@avila.com', '123456')}
            className="flex items-center justify-center gap-1.5 p-2 border border-purple-200 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-all font-medium"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Administrador
          </button>
          <button
            onClick={() => handleQuickLogin('secretaria@avila.com', '123456')}
            className="flex items-center justify-center gap-1.5 p-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all font-medium"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Secretario
          </button>
          <button
            onClick={() => handleQuickLogin('paciente_test@gmail.com', '123456')}
            className="flex items-center justify-center gap-1.5 p-2 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all font-medium"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Paciente Nuevo
          </button>
          <button
            onClick={() => handleQuickLogin('paciente_con_cita@gmail.com', '123456')}
            className="flex items-center justify-center gap-1.5 p-2 border border-amber-200 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-all font-medium"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Paciente c/ Cita
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="font-semibold text-clinica-600 hover:text-clinica-700 underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
