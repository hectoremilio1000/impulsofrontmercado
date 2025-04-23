import React, { useState, useEffect } from "react";
import { Select, Form } from "antd";
import axios from "axios";
import { useAuth } from "../../../AuthContext"; // Ajusta la ruta si fuera necesario

const { Option } = Select;

/**
 * Componente para seleccionar:
 * 1) Usuario,
 * 2) De los usuarios, las empresas asociadas,
 * 3) De esas empresas, los puestos asociados.
 *
 * onChange: callback que retorna { userId, companyId, positionId }
 */
function SelectUserCompanyPosition({ onChange }) {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const [positions, setPositions] = useState([]);
  const [selectedPositionId, setSelectedPositionId] = useState(null);

  // 1) Cargar la lista de usuarios al montar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const resp = await axios.get(`${apiUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.data.status === "success") {
          setUsers(resp.data.data); // Ajusta según la forma en que tu API devuelva los datos
        }
      } catch (error) {
        console.error("Error fetching users =>", error);
      }
    };
    fetchUsers();
  }, [apiUrl, token]);

  // 2) Cargar empresas de un usuario seleccionado
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!selectedUserId) return;

      try {
        // EJEMPLO de endpoint: GET /users/:userId/companies
        const resp = await axios.get(
          `${apiUrl}/users/${selectedUserId}/companies`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (resp.data.status === "success") {
          setCompanies(resp.data.data);
        }
      } catch (error) {
        console.error("Error fetching companies =>", error);
      }
    };
    fetchCompanies();
  }, [apiUrl, token, selectedUserId]);

  // 3) Cargar puestos según el usuario y empresa seleccionados
  useEffect(() => {
    const fetchPositions = async () => {
      if (!selectedUserId || !selectedCompanyId) return;

      try {
        // EJEMPLO de endpoint: GET /users/:userId/companies/:companyId/positions
        const resp = await axios.get(`${apiUrl}/positions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.data.status === "success") {
          setPositions(resp.data.data);
        }
      } catch (error) {
        console.error("Error fetching positions =>", error);
      }
    };
    fetchPositions();
  }, [apiUrl, token, selectedUserId, selectedCompanyId]);

  // Handlers
  const handleUserChange = (userId) => {
    setSelectedUserId(userId);
    setSelectedCompanyId(null);
    setCompanies([]);
    setSelectedPositionId(null);
    setPositions([]);

    // Notificamos el cambio con todos los valores actuales
    onChange?.({
      userId,
      companyId: null,
      positionId: null,
    });
  };

  const handleCompanyChange = (companyId) => {
    setSelectedCompanyId(companyId);
    setSelectedPositionId(null);
    setPositions([]);

    onChange?.({
      userId: selectedUserId,
      companyId,
      positionId: null,
    });
  };

  const handlePositionChange = (positionId) => {
    setSelectedPositionId(positionId);

    onChange?.({
      userId: selectedUserId,
      companyId: selectedCompanyId,
      positionId,
    });
  };

  return (
    <>
      <Form.Item label="Seleccionar Usuario">
        <Select
          placeholder="Elige un usuario"
          value={selectedUserId}
          onChange={handleUserChange}
          style={{ width: "100%" }}
        >
          {users.map((u) => (
            <Option key={u.id} value={u.id}>
              {u.name} (ID {u.id})
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Seleccionar Empresa">
        <Select
          placeholder="Elige una empresa"
          value={selectedCompanyId}
          onChange={handleCompanyChange}
          style={{ width: "100%" }}
          disabled={!selectedUserId}
        >
          {companies.map((c) => (
            <Option key={c.id} value={c.id}>
              {c.name} (ID {c.id})
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Seleccionar Puesto">
        <Select
          placeholder="Elige un puesto"
          value={selectedPositionId}
          onChange={handlePositionChange}
          style={{ width: "100%" }}
          disabled={!selectedCompanyId}
        >
          {positions.map((p) => (
            <Option key={p.id} value={p.id}>
              {p.nombre}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
}

export default SelectUserCompanyPosition;
