// src/pages/UserDetail.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../components/AuthContext";
import { Card, Spin, Input, Divider } from "antd";
import { AiOutlineSearch } from "react-icons/ai";
import { FaBuilding } from "react-icons/fa"; // <-- Importamos este icono

const UserDetail = () => {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Estado para el buscador de empresas
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompanies, setFilterCompanies] = useState([]);

  // =========================================================================
  // 1) Cargar datos del usuario (con subscription, companies, módulos, etc.)
  // =========================================================================
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${apiUrl}/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      console.log("===== API /me Response =====");
      console.log("Full response data:", resp.data);
      console.log("User data:", resp.data.user);

      setUser(resp.data.user);
      console.log("Usuario guardado en state:", resp.data.user);
    } catch (error) {
      console.error("Error al obtener usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 2) Al tener user, ajustamos las empresas filtradas
  // =========================================================================
  useEffect(() => {
    if (!user?.companies) return;
    console.log("Empresas del usuario:", user.companies);
    setFilterCompanies(user.companies);
  }, [user]);

  // =========================================================================
  // 3) Filtrar empresas al cambiar searchTerm
  // =========================================================================
  useEffect(() => {
    if (!user?.companies) return;

    if (!searchTerm) {
      setFilterCompanies(user.companies);
    } else {
      const result = user.companies.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilterCompanies(result);
    }
  }, [searchTerm, user]);

  // =========================================================================
  // Render: Loading / Error / Vista
  // =========================================================================
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spin tip="Cargando usuario..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>No se encontró el usuario</p>
      </div>
    );
  }

  // =========================================================================
  // Tomar datos de la suscripción y plan
  // =========================================================================
  const planName = user.subscription?.plan?.name || "N/A";
  const maxModules = user.subscription?.plan?.maxModules || 0;
  const coachingUsed = user.subscription?.coachingUsed || 0;
  const coachingIncluded = user.subscription?.coachingIncluded || 0;

  // Módulos de la suscripción (si aplica)
  const subscriptionModules = user.subscription?.modules || [];
  console.log("Módulos de la suscripción:", subscriptionModules);

  // =========================================================================
  // Render principal
  // =========================================================================
  return (
    <div className="w-full min-h-screen bg-white flex flex-col py-8 px-6">
      <div className="w-full max-w-3xl mx-auto">
        {/* Datos del usuario */}
        <Card className="mb-6 shadow">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">
            {user.name} (ID: {user.id})
          </h1>
          <p className="text-gray-600 mb-1">
            <b>Rol:</b> {user.rol?.name}
          </p>
          <p className="text-gray-600 mb-1">
            <b>Email:</b> {user.email}
          </p>
          <p className="text-gray-600 mb-1">
            <b>WhatsApp:</b> {user.whatsapp || "N/D"}
          </p>

          <Divider />

          {/* Suscripción */}
          <h3 className="text-lg font-bold text-gray-700 mb-1">Suscripción</h3>
          {user.subscription ? (
            <div className="text-gray-700">
              <p>
                Plan actual: <b>{planName}</b> — Máx. <b>{maxModules}</b>{" "}
                módulos
              </p>
              <p>
                Coaching usado: <b>{coachingUsed}</b> /{" "}
                <b>{coachingIncluded}</b>
              </p>

              {/* Lista de módulos */}
              {subscriptionModules.length > 0 ? (
                <div className="mt-4">
                  <h4 className="font-bold">Módulos en esta suscripción:</h4>
                  <ul className="list-disc list-inside">
                    {subscriptionModules.map((mod) => (
                      <li key={mod.id}>
                        {mod.name} (ID: {mod.id})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500 mt-2">
                  No hay módulos en la suscripción.
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No tiene suscripción</p>
          )}
        </Card>

        {/* Buscador de empresas */}
        <div className="mb-4">
          <Input
            size="large"
            placeholder="Busca tus empresas"
            prefix={<AiOutlineSearch className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!border !rounded-full !border-gray-300 !shadow-sm"
          />
        </div>

        {/* Listado de empresas */}
        <Card title="Empresas" className="shadow">
          {filterCompanies.length > 0 ? (
            <div className="space-y-3">
              {filterCompanies.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded border border-gray-200 flex items-center gap-3
                             hover:shadow transition-all hover:-translate-y-1"
                >
                  {/* Logo o icono */}
                  {c.logo ? (
                    <img
                      src={c.logo}
                      alt="Logo Empresa"
                      className="w-10 h-10 object-cover"
                      onError={(e) => {
                        // Si falla la carga del logo, usamos un icono por defecto.
                        e.currentTarget.onerror = null; // Previene loop infinito
                        e.currentTarget.src = ""; // Vaciamos el src para disparar el else
                      }}
                    />
                  ) : (
                    <FaBuilding className="text-2xl" />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-700">{c.name}</h4>
                    <p className="text-sm text-gray-500">{c.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay empresas con ese nombre</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserDetail;
