// components/rolSuperAdmin/RRHH/Checklists/useFetchChecklists.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../AuthContext";

export default function UseFetchChecklists() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // Filtros
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedPositionId, setSelectedPositionId] = useState(null);

  // Catálogos
  const [usersRol2, setUsersRol2] = useState([]);
  const [companiesOfUser, setCompaniesOfUser] = useState([]);
  const [positions, setPositions] = useState([]);

  // Data
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);

  /** ------------------------------------------- */
  /** Cargar usuarios con rol 2 al montar         */
  /** ------------------------------------------- */
  useEffect(() => {
    const fetchUsers = async () => {
      const resp = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsersRol2(resp.data.data.filter((u) => u.role_id === 2));
    };
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  /** ------------------------------------------- */
  /** Cambia usuario → obtén empresas             */
  /** ------------------------------------------- */
  useEffect(() => {
    if (!selectedUserId) {
      setCompaniesOfUser([]);
      return;
    }
    const fetchCompanies = async () => {
      const resp = await axios.get(
        `${apiUrl}/users/${selectedUserId}/companies`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCompaniesOfUser(resp.data.data);
    };
    fetchCompanies();
    // eslint-disable-next-line
  }, [selectedUserId]);

  /** ------------------------------------------- */
  /** Cambia empresa → obtén puestos              */
  /** ------------------------------------------- */
  useEffect(() => {
    if (!selectedCompanyId) {
      setPositions([]);
      return;
    }
    const fetchPositions = async () => {
      const resp = await axios.get(
        `${apiUrl}/users/${selectedUserId}/companies/${selectedCompanyId}/positions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPositions(resp.data.data);
    };
    fetchPositions();
    // eslint-disable-next-line
  }, [selectedCompanyId]);

  /** ------------------------------------------- */
  /** Filtro final → obtener checklists           */
  /** ------------------------------------------- */
  const fetchChecklists = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${apiUrl}/rrhh-checklists`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          companyId: selectedCompanyId,
          positionId: selectedPositionId,
        },
      });
      setChecklists(resp.data.data);
    } finally {
      setLoading(false);
    }
  };

  // refetch cuando cambian filtros
  useEffect(() => {
    fetchChecklists();
    // eslint-disable-next-line
  }, [selectedCompanyId, selectedPositionId]);

  return {
    usersRol2,
    companiesOfUser,
    positions,
    selectedUserId,
    setSelectedUserId,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedPositionId,
    setSelectedPositionId,
    loading,
    checklists,
    refetch: fetchChecklists,
  };
}
