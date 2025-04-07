// src/pages/superadmin/Moduls/Encuestas/TablaRespuestas.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs"; // Si deseas usar dayjs para filtrar por fecha
import { Table, Select, DatePicker, Button, message } from "antd";
import { useAuth } from "../../../../components/AuthContext";
import EncuestaDetalle from "./EncuestaDetalle";

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function TablaRespuestas() {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(false);

  // Datos globales
  const [users, setUsers] = useState([]);
  const [allSurveys, setAllSurveys] = useState([]);
  const [allResponses, setAllResponses] = useState([]);

  // Filtros
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);

  // Resultado filtrado
  const [filteredSurveys, setFilteredSurveys] = useState([]);

  // Encuesta seleccionada para visualizar en detalle
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      setLoading(true);
      console.log("fetchAllData => iniciando peticiones al backend");

      // 1) Cargar usuarios
      const respUsers = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      console.log("fetchAllData => /users =>", respUsers.data);
      // Asumiendo que vienen en respUsers.data.data
      setUsers(respUsers.data.data || []);

      // 2) Cargar TODAS las encuestas
      const respSurveys = await axios.get(`${apiUrl}/surveys`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      console.log("fetchAllData => /surveys =>", respSurveys.data);
      setAllSurveys(respSurveys.data || []);

      // 3) Cargar TODAS las respuestas
      const respResponses = await axios.get(`${apiUrl}/survey-responses`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      console.log("fetchAllData => /survey-responses =>", respResponses.data);
      setAllResponses(respResponses.data || []);

      console.log("fetchAllData => terminado con éxito");
    } catch (err) {
      console.error("fetchAllData => ERROR:", err);
      message.error("Error cargando datos globales");
    } finally {
      setLoading(false);
    }
  }

  // Función para aplicar filtros (por usuario, fechas, etc.)
  function handleFilter() {
    console.log(
      "handleFilter => selectedUserId:",
      selectedUserId,
      "dateRange:",
      dateRange
    );

    let temp = [...allSurveys];

    // Filtro por usuario (survey.userId)
    if (selectedUserId) {
      temp = temp.filter((s) => s.userId === selectedUserId);
    }

    // (Opcional) Filtrar también por fecha de creación
    // si tus encuestas tienen un campo createdAt:
    /*
    const [start, end] = dateRange;
    if (start && end) {
      temp = temp.filter((enc) => {
        const createdDate = dayjs(enc.createdAt);
        return createdDate.isBetween(start, end, "day", "[]");
      });
    }
    */

    setFilteredSurveys(temp);
    setSelectedSurvey(null);
    console.log("handleFilter => encuestas resultantes:", temp);
  }

  const columnsSurveys = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Título",
      dataIndex: "title",
    },
    {
      title: "Código",
      dataIndex: "code",
      width: 140,
    },
    {
      title: "Acciones",
      width: 100,
      render: (record) => (
        <Button
          onClick={async () => {
            try {
              // Llamada a /api/surveys/:id para obtener
              // la encuesta con sus preguntas
              const resp = await axios.get(`${apiUrl}/surveys/${record.id}`, {
                headers: { Authorization: `Bearer ${auth.token}` },
              });
              setSelectedSurvey(resp.data);
            } catch (err) {
              console.error("Error trayendo encuesta con preguntas:", err);
              message.error("No se pudo cargar la encuesta seleccionada");
            }
          }}
        >
          Ver
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <h2>Panel de Respuestas (Front-Filtered)</h2>

      {/* Filtros */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        {/* Filtro por usuario */}
        <Select
          style={{ width: 200 }}
          placeholder="Seleccionar Usuario"
          allowClear
          onChange={(val) => {
            setSelectedUserId(val);
          }}
        >
          {users.map((u) => (
            <Option key={u.id} value={u.id}>
              {u.name} (ID: {u.id})
            </Option>
          ))}
        </Select>

        {/* Filtro por rango de fechas */}
        <RangePicker
          onChange={(vals) => {
            setDateRange(vals);
          }}
          placeholder={["Fecha inicio", "Fecha fin"]}
        />

        <Button type="primary" onClick={handleFilter} loading={loading}>
          Filtrar
        </Button>
      </div>

      {/* Tabla de encuestas filtradas */}
      <Table
        columns={columnsSurveys}
        dataSource={filteredSurveys}
        rowKey="id"
        loading={loading}
        size="small"
        style={{ marginBottom: 24 }}
      />

      {/* 
        Si el usuario seleccionó una encuesta,
        mostramos el detalle y gráficas
      */}
      {selectedSurvey && (
        <EncuestaDetalle
          survey={selectedSurvey}
          allResponses={allResponses}
          dateRange={dateRange}
        />
      )}
    </div>
  );
}
