import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import RoleSelector from './components/RoleSelector';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Vistas
import Landing from './views/Landing';
import Login from './views/Login';
import Register from './views/Register';
import AdminPanel from './views/AdminPanel';
import SecretarioPanel from './views/SecretarioPanel';
import PacientePanel from './views/PacientePanel';
import EspecialistaPanel from './views/EspecialistaPanel';

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Selector de simulación de roles rápido */}
      <RoleSelector />
      
      {/* Navegación Clínica */}
      <Navbar />

      {/* Área de Contenido Principal */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Vistas protegidas simuladas */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/secretario" element={<SecretarioPanel />} />
          <Route path="/paciente" element={<PacientePanel />} />
          <Route path="/especialista" element={<EspecialistaPanel />} />
        </Routes>
      </main>

      {/* Footer del Centro Médico */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
