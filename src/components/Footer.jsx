import React from 'react';
import { MapPin, Phone, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div>
            <span className="font-bold text-slate-100 text-base">
              Centro Médico <span className="text-cyan-400 font-black">Ávila</span>
            </span>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Plataforma de Autogestión Médica exclusiva para la Región Metropolitana de Caracas, Distrito Capital.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Av. Panteón, San Bernardino, Caracas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>+58 (212) 555-0199</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sistema Acreditado</span>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800/80 mt-6 pt-4 text-center text-[10px] text-slate-500">
          © {new Date().getFullYear()} Centro Médico Ávila. Todos los derechos reservados. Idioma oficial: Español (Venezuela).
        </div>
      </div>
    </footer>
  );
}
