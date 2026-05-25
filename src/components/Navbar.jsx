import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  Activity, 
  LogOut, 
  Calendar, 
  ShieldCheck, 
  Users2, 
  Stethoscope, 
  Clock, 
  UserCircle 
} from 'lucide-react';

export default function Navbar() {
  const { currentUsuario, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'Admin':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-purple-200">Administrador</span>;
      case 'Secretario':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">Secretario</span>;
      case 'Especialista':
        return <span className="bg-rose-100 text-rose-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-rose-200">Médico Especialista</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">Paciente</span>;
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel sticky top-[42px] z-40 w-full shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-tr from-clinica-600 to-clinica-400 rounded-xl text-white shadow-md shadow-clinica-500/20 group-hover:scale-105 transition-transform duration-200">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <span className="font-semibold text-lg text-clinica-900 tracking-tight">
                Centro Médico <span className="text-clinica-500 font-bold">Ávila</span>
              </span>
            </Link>
          </div>

          {/* Menú de Navegación según Rol */}
          <div className="hidden md:flex items-center space-x-1">
            {currentUsuario && (
              <>
                {/* Paciente Links */}
                {currentUsuario.rol === 'Paciente' && (
                  <>
                    <Link
                      to="/paciente"
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive('/paciente')
                          ? 'bg-clinica-500 text-white shadow-sm shadow-clinica-500/10'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      Agendar Citas
                    </Link>
                  </>
                )}

                {/* Secretario Links */}
                {currentUsuario.rol === 'Secretario' && (
                  <>
                    <Link
                      to="/secretario"
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive('/secretario')
                          ? 'bg-clinica-500 text-white shadow-sm shadow-clinica-500/10'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      Asignar Horarios
                    </Link>
                  </>
                )}

                {/* Admin Links */}
                {currentUsuario.rol === 'Admin' && (
                  <>
                    <Link
                      to="/admin"
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive('/admin')
                          ? 'bg-clinica-500 text-white shadow-sm shadow-clinica-500/10'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4" />
                      Especialidades
                    </Link>
                  </>
                )}

                {/* Especialista Links */}
                {currentUsuario.rol === 'Especialista' && (
                  <>
                    <Link
                      to="/especialista"
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive('/especialista')
                          ? 'bg-clinica-500 text-white shadow-sm shadow-clinica-500/10'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      Mi Agenda
                    </Link>
                  </>
                )}
              </>
            )}
            
            {!currentUsuario && (
              <>
                <Link
                  to="/"
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
                >
                  Inicio
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Perfil de Usuario e Inicio/Cierre Sesión */}
          <div className="flex items-center gap-4">
            {currentUsuario ? (
              <div className="flex items-center gap-3.5">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-900 leading-tight">
                    {currentUsuario.nombre} {currentUsuario.apellido}
                  </span>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {getRoleBadge(currentUsuario.rol)}
                  </div>
                </div>
                
                <div className="p-1.5 bg-slate-100 rounded-full border border-slate-200 text-slate-600">
                  <UserCircle className="w-5 h-5" />
                </div>

                <button
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4.5 py-2 bg-gradient-to-r from-clinica-600 to-clinica-500 text-white rounded-xl text-sm font-medium shadow-md shadow-clinica-500/10 hover:shadow-lg hover:shadow-clinica-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
