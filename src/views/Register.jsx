import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Activity, User, CreditCard, Mail, Lock, ShieldAlert, CheckCircle } from 'lucide-react';

export default function Register() {
  const { registrarUsuario, login } = useContext(AppContext);
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [tipoCedula, setTipoCedula] = useState('V');
  const [numCedula, setNumCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    // Validar campos obligatorios
    if (!nombre || !apellido || !numCedula || !correo || !clave) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    // Validar formato numérico de cédula
    const cedulaLimpia = numCedula.replace(/\D/g, ''); // Solo números
    if (cedulaLimpia.length < 6 || cedulaLimpia.length > 9) {
      setError('Por favor ingrese un número de cédula válido (entre 6 y 9 dígitos).');
      return;
    }

    const cedulaCompleta = `${tipoCedula}-${cedulaLimpia}`;

    // Validar correo básico
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
      setError('Por favor ingrese un correo electrónico válido.');
      return;
    }

    if (clave.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    const nuevoUsuario = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      cedula: cedulaCompleta,
      correo: correo.trim().toLowerCase(),
      clave: clave
    };

    const res = registrarUsuario(nuevoUsuario);
    if (res.success) {
      setExito('¡Registro exitoso! Iniciando sesión automáticamente...');
      
      // Auto login e ir al panel de paciente
      setTimeout(() => {
        login(nuevoUsuario.correo, nuevoUsuario.clave);
        navigate('/paciente');
      }, 1500);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/3 right-1/4 -z-10 w-[450px] h-[450px] bg-clinica-100 rounded-full blur-3xl opacity-40"></div>

      <div className="w-full max-w-lg space-y-8 glass-card p-8 rounded-3xl border border-white/60 shadow-premium">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-tr from-clinica-600 to-clinica-400 rounded-2xl flex items-center justify-center text-white shadow-md">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="mt-5 text-3xl font-extrabold text-slate-900 tracking-tight">Crear Cuenta</h2>
          <p className="mt-1 text-xs text-slate-500">
            Formulario público de registro exclusivo para Pacientes
          </p>
        </div>

        {/* Feedback visual */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-start gap-2 animate-shake">
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

        {/* Formulario */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nombre
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Juan"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Apellido
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Lovera"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Cédula de Identidad (ID)
            </label>
            <div className="flex gap-2">
              <select
                value={tipoCedula}
                onChange={(e) => setTipoCedula(e.target.value)}
                className="block py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500"
              >
                <option value="V">V (Venezolano)</option>
                <option value="E">E (Extranjero)</option>
              </select>
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={numCedula}
                  onChange={(e) => setNumCedula(e.target.value)}
                  placeholder="12345678"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500 focus:bg-white transition-all"
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Ingrese solo los números correspondientes a su documento nacional de identidad.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Correo Único
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="juan.lovera@ejemplo.com"
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="••••••"
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-clinica-500/20 focus:border-clinica-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-clinica-600 to-clinica-500 text-white rounded-2xl text-sm font-semibold shadow-md shadow-clinica-500/15 hover:shadow-lg hover:shadow-clinica-500/25 hover:-translate-y-0.5 transition-all duration-200 mt-2"
          >
            Registrarse y Entrar
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-semibold text-clinica-600 hover:text-clinica-700 underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
