// src/pages/admin/Moduls/Encuestas/RespuestasEncuestasAdmin.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
// IMPORTA el plugin
import isBetween from "dayjs/plugin/isBetween";

import { Table, DatePicker, Button, message } from "antd";
import { useAuth } from "../../../../components/AuthContext";
import EncuestaDetalle from "./EncuestaDetalle";
// EXTIENDE dayjs
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

export default function RespuestasEncuestasAdmin() {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const currentUserId = auth.user?.id;

  // Estados
  const [loading, setLoading] = useState(false);
  const [allSurveys, setAllSurveys] = useState([]);
  const [allResponses, setAllResponses] = useState([]);

  // Filtro por fecha (opcional)
  const [dateRange, setDateRange] = useState([null, null]);

  // Encuestas filtradas
  const [filteredSurveys, setFilteredSurveys] = useState([]);

  // Encuesta seleccionada para ver en detalle
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  // Cargar datos al montar
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line
  }, []);

  // Llama a la API para traer encuestas y respuestas
  async function fetchAllData() {
    try {
      setLoading(true);
      // 1) Cargar TODAS las encuestas
      const respSurveys = await axios.get(`${apiUrl}/surveys`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setAllSurveys(respSurveys.data || []);

      // 2) Cargar TODAS las respuestas
      const respResponses = await axios.get(`${apiUrl}/survey-responses`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setAllResponses(respResponses.data || []);
    } catch (err) {
      console.error("fetchAllData => ERROR:", err);
      message.error("Error cargando datos de encuestas y/o respuestas");
    } finally {
      setLoading(false);
    }
  }

  // Aplica el filtro por fechas y userId
  function handleFilter() {
    // Filtra solo las encuestas del usuario actual
    let temp = allSurveys.filter((s) => s.userId === currentUserId);

    // Filtro por rango de fechas (si tu encuesta tiene `createdAt`)
    const [start, end] = dateRange;
    if (start && end) {
      temp = temp.filter((enc) => {
        // Convertimos enc.createdAt a dayjs:
        const createdDate = dayjs(enc.createdAt);
        return createdDate.isBetween(start, end, "day", "[]");
      });
    }

    setFilteredSurveys(temp);
    setSelectedSurvey(null);
  }

  // Columnas para la tabla de encuestas
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
      title: "Compañía",
      // asumiendo que en la encuesta tienes `survey.company`
      render: (record) =>
        record.company ? record.company.name : "Sin empresa",
      width: 150,
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
              // Obtener la encuesta (con sus preguntas) desde el backend
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
      <h2>Respuestas de Mis Encuestas</h2>

      {/* Filtros */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        {/* Rango de fechas */}
        <RangePicker
          onChange={(vals) => setDateRange(vals)}
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
