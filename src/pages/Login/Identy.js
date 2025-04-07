import axios from "axios";
import React, { useState } from "react";
// Importar componentes de antd
import { Spin, message, Button } from "antd";
import { useNavigate } from "react-router-dom";

const Identy = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false); // Para saber si ya se envió
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const handleSendCode = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/forgotPassword`, { email });
      if (res.data.success) {
        // Duración de 5 segundos (por defecto es 3)
        message.success("Correo enviado. Revisa tu bandeja.", 5);
        setSent(true);
      }
    } catch (error) {
      console.log(error);
      message.error(
        "Error al enviar correo. " + (error.response?.data?.message || ""),
        5
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    // Volver al login, o donde desees
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50">
      {/* Spin envuelve la tarjeta para mostrar el indicador "Procesando..." */}
      <Spin spinning={loading} tip="Procesando...">
        <div className="w-full max-w-md bg-white p-6 rounded shadow">
          <h1 className="text-xl font-bold text-center mb-4">
            Para reestablecer tu contraseña, ingresa tu correo electrónico para
            enviar un código de recuperación
          </h1>
          <div className="mb-4">
            <label className="block mb-2" htmlFor="email">
              Correo electrónico
            </label>
            <input
              className="w-full p-2 bg-gray-200 rounded"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sent || loading} // Deshabilitado si ya se envió o está cargando
            />
          </div>
          {/* Botón para enviar código */}
          <button
            onClick={handleSendCode}
            className="w-full px-3 py-2 bg-dark-purple text-white rounded"
            disabled={!email || sent || loading} // Deshabilitar si no hay email o ya se envió
          >
            Enviar código
          </button>

          {/* Botón adicional para volver al inicio */}
          <div className="mt-4 flex justify-center">
            <Button onClick={handleGoBack} disabled={loading}>
              Volver al Inicio
            </Button>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default Identy;
