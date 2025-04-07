import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

function ContactAdminPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleGoHome = () => {
    // Cerrar sesión y dirigir al inicio
    logout();
    navigate("/login");
  };

  const handleGoWhatsApp = () => {
    // Cerrar sesión antes de abrir WhatsApp
    logout();
    // Abrir WhatsApp en otra pestaña
    window.open("https://wa.me/5521293811", "_blank", "noreferrer");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Tu cuenta está en revisión
        </h1>
        <p className="text-gray-700 mb-6 text-center">
          Por favor, contacta a tu administrador para más detalles o regresa al
          inicio.
        </p>
        <div className="flex justify-center space-x-4">
          {/* Botón de WhatsApp */}
          <button
            onClick={handleGoWhatsApp}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Ir a WhatsApp
          </button>
          {/* Botón para regresar al inicio */}
          <button
            onClick={handleGoHome}
            className="bg-dark-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactAdminPage;
