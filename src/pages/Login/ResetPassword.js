import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Spin, message } from "antd";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    // Si viene como query param ?token=abc123
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [location.search]);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${apiUrl}/resetPassword`, {
        token,
        newPassword,
      });
      if (res.data.success) {
        message.success("¡Contraseña actualizada con éxito!");
        navigate("/login");
      } else {
        message.error("No se pudo actualizar la contraseña.");
      }
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50">
      {/* Spin envuelve el contenido y muestra un indicador si loading=true */}
      <Spin spinning={loading} tip="Procesando...">
        <div className="w-full max-w-md bg-white p-6 rounded shadow">
          <h1 className="text-xl font-bold text-center mb-4">
            Ingresa tu Token y Contraseña Nueva
          </h1>

          {success && (
            <p className="bg-green-100 text-green-600 p-2 rounded mb-4">
              {success}
            </p>
          )}
          {error && (
            <p className="bg-red-100 text-red-600 p-2 rounded mb-4">{error}</p>
          )}

          <form onSubmit={handleReset}>
            <div className="mb-4">
              <label className="block mb-2" htmlFor="token">
                Token
              </label>
              <input
                id="token"
                type="text"
                className="w-full p-2 bg-gray-200 rounded"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ej: abc123..."
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2" htmlFor="newPassword">
                Nueva Contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                className="w-full p-2 bg-gray-200 rounded"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-3 py-2 bg-dark-purple text-white rounded"
            >
              Actualizar Contraseña
            </button>
          </form>
        </div>
      </Spin>
    </div>
  );
}
