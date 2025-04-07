import { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { useAuth } from "../../../AuthContext";

/**
 * Custom hook para el Panel de Manuales.
 * Paso a paso:
 *  1) Cargar TODOS los usuarios con rol=2
 *  2) Cuando selecciones uno, cargar sus empresas
 *  3) Cuando selecciones una empresa, cargar puestos
 *  4) Cuando selecciones un puesto, cargar manuales
 */
export function FetchPanelManuales() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // --------------------------
  //  ESTADOS DE SELECCIÓN
  // --------------------------
  // 1) Usuario con rol=2
  const [selectedUserId, setSelectedUserId] = useState(null);

  // 2) Empresa de ese usuario
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // 3) Puesto (position)
  const [selectedPositionId, setSelectedPositionId] = useState(null);

  // --------------------------
  //  CATÁLOGOS / LISTAS
  // --------------------------
  // a) Lista de usuarios rol=2
  const [usersRol2, setUsersRol2] = useState([]);
  // b) Empresas de un usuario X
  const [companiesOfUser, setCompaniesOfUser] = useState([]);
  // c) Puestos de la empresa seleccionada
  const [positions, setPositions] = useState([]);
  // d) Manuales finales
  const [manuals, setManuals] = useState([]);

  // Loading para la tabla/lista de manuales (o puedes usar un loading general)
  const [loading, setLoading] = useState(false);

  // --------------------------
  //  USE EFFECTS
  // --------------------------
  // Al montar: cargar la lista de usuarios rol=2
  useEffect(() => {
    fetchUsersRol2();
    // eslint-disable-next-line
  }, []);

  // Cada vez que cambie `selectedUserId`, cargar las empresas de ese usuario
  useEffect(() => {
    if (!selectedUserId) {
      setCompaniesOfUser([]);
      setSelectedCompanyId(null);
      setPositions([]);
      setManuals([]);
      return;
    }
    fetchCompaniesOfUser(selectedUserId);
    // eslint-disable-next-line
  }, [selectedUserId]);

  // Cada vez que cambie `selectedCompanyId`, cargar puestos de esa empresa
  useEffect(() => {
    if (!selectedCompanyId) {
      setPositions([]);
      setSelectedPositionId(null);
      setManuals([]);
      return;
    }
    fetchPositions(selectedCompanyId);
    // eslint-disable-next-line
  }, [selectedCompanyId]);

  // Cada vez que cambie el `selectedPositionId`, cargar manuales
  useEffect(() => {
    if (!selectedPositionId || !selectedCompanyId) {
      setManuals([]);
      return;
    }
    fetchManuals(selectedCompanyId, selectedPositionId);
    // eslint-disable-next-line
  }, [selectedPositionId]);

  // --------------------------
  //  FUNCIONES DE FETCH
  // --------------------------

  /**
   * Carga todos los usuarios con rol=2.
   * Asumimos que tu endpoint permite filtrar con ?rol=2
   * Ej: GET /api/users?rol=2
   */
  const fetchUsersRol2 = async () => {
    try {
      const resp = await axios.get(`${apiUrl}/users`, {
        params: { rol: 2 },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data && Array.isArray(resp.data)) {
        setUsersRol2(resp.data);
      } else if (
        resp.data.status === "success" &&
        Array.isArray(resp.data.data)
      ) {
        // Si tu backend regresa { status: "success", data: [...] }
        setUsersRol2(resp.data.data);
      } else {
        // Estructura desconocida
        setUsersRol2([]);
      }
    } catch (error) {
      console.error("[fetchUsersRol2] Error =>", error);
      message.error("Error al cargar usuarios (rol=2)");
    }
  };

  /**
   * Carga las empresas a las que un usuario (rol=2) tiene acceso.
   * Ej: GET /api/users/:userId/companies
   */
  const fetchCompaniesOfUser = async (userId) => {
    try {
      const resp = await axios.get(`${apiUrl}/users/${userId}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data?.status === "success") {
        setCompaniesOfUser(resp.data.data);
      } else if (Array.isArray(resp.data)) {
        setCompaniesOfUser(resp.data);
      } else {
        setCompaniesOfUser([]);
      }
    } catch (error) {
      console.error("[fetchCompaniesOfUser] Error =>", error);
      message.error("Error al cargar las empresas del usuario seleccionado");
    }
  };

  /**
   * Carga los puestos (positions) de la empresa.
   * Asumimos que tu ruta GET /api/positions?companyId=XX
   */
  const fetchPositions = async (companyId) => {
    try {
      const resp = await axios.get(`${apiUrl}/positions`, {
        params: { companyId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data?.status === "success") {
        setPositions(resp.data.data);
      } else if (Array.isArray(resp.data)) {
        setPositions(resp.data);
      } else {
        setPositions([]);
      }
    } catch (error) {
      console.error("[fetchPositions] Error =>", error);
      message.error("Error al cargar puestos de la empresa seleccionada");
    }
  };

  /**
   * Carga los manuales para una combinación de empresa + puesto.
   * Ej: GET /api/training-manuals?companyId=XX&positionId=YY
   */
  const fetchManuals = async (companyId, positionId) => {
    setLoading(true);
    try {
      const resp = await axios.get(`${apiUrl}/training-manuals`, {
        params: { companyId, positionId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data?.status === "success") {
        setManuals(resp.data.data);
      } else if (Array.isArray(resp.data)) {
        setManuals(resp.data);
      } else {
        setManuals([]);
      }
    } catch (error) {
      console.error("[fetchManuals] Error =>", error);
      message.error("Error al cargar manuales");
    } finally {
      setLoading(false);
    }
  };

  // Exportamos todo lo que el componente final necesita:
  return {
    // Estados de selección
    selectedUserId,
    setSelectedUserId,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedPositionId,
    setSelectedPositionId,

    // Catálogos
    usersRol2,
    companiesOfUser,
    positions,
    manuals,

    // Loading
    loading,

    // Funciones de fetch (por si se quieren disparar manualmente)
    fetchUsersRol2,
    fetchCompaniesOfUser,
    fetchPositions,
    fetchManuals,
  };
}
