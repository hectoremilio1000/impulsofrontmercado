// src/pages/superadmin/Moduls/AyudaIA/PanelIA.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spin, message, DatePicker, Space, Button } from "antd";
import { useAuth } from "../../../../components/AuthContext";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

function PanelIA() {
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3333";

  const [recommendations, setRecommendations] = useState([]); // dataset completo
  const [filteredRecs, setFilteredRecs] = useState([]); // dataset filtrado
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([]); // rango seleccionado

  // ---- info del usuario ----------------------------------------------------
  const { auth } = useAuth();
  const currentUserId = auth.user?.id;
  const isSuperAdmin = auth.user?.rolId === 1;

  // ---- carga inicial -------------------------------------------------------
  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRecommendations() {
    try {
      setLoading(true);

      const resp = await axios.get(`${apiUrl}/recommendations`);
      if (resp.data.status !== "success")
        throw new Error(resp.data.message || "Error al cargar recomendaciones");

      let recs = resp.data.data;

      // filtra según rol
      if (!isSuperAdmin) recs = recs.filter((r) => r.userId === currentUserId);

      // ordena DESC por fecha de creación
      recs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setRecommendations(recs);
      setFilteredRecs(recs); // muestra todo al inicio
    } catch (err) {
      console.error("Error fetchRecommendations:", err);
      setError(err.message);
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ---- filtrado por rango de fechas ---------------------------------------
  const handleDateFilter = () => {
    if (dateRange.length === 2) {
      const [start, end] = dateRange;
      const filtered = recommendations.filter((rec) => {
        const created = dayjs(rec.createdAt);
        return (
          created.isAfter(start.startOf("day")) &&
          created.isBefore(end.endOf("day"))
        );
      });
      setFilteredRecs(filtered);
    } else {
      setFilteredRecs(recommendations);
    }
  };

  const resetFilter = () => {
    setDateRange([]);
    setFilteredRecs(recommendations);
  };

  // ---- columnas de la tabla -----------------------------------------------
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      width: 150,
      sorter: (a, b) => dayjs(a.fecha).unix() - dayjs(b.fecha).unix(),
    },
    { title: "Tipo", dataIndex: "tipo", key: "tipo", width: 110 },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      width: 200,
      render: (nombre) => nombre || "N/A",
    },
    {
      title: "Texto",
      dataIndex: "text",
      key: "text",
      render: (txt) => (
        <div style={{ whiteSpace: "pre-wrap", overflowY: "auto" }}>{txt}</div>
      ),
    },
  ];

  // ---- transforma recs -> dataSource --------------------------------------
  const dataSource = filteredRecs.map((rec) => {
    let tipo = "Desconocido";
    let nombre = "";

    if (rec.prospectId && rec.prospect) {
      tipo = "Prospecto";
      const { firstName, lastName } = rec.prospect;
      nombre =
        [firstName, lastName].filter(Boolean).join(" ") ||
        `ID Prospecto ${rec.prospectId}`;
    } else if (rec.userId && rec.user) {
      tipo = "Usuario";
      nombre = rec.user.name || `ID Usuario ${rec.userId}`;
    }

    return {
      key: rec.id,
      id: rec.id,
      fecha: dayjs(rec.createdAt).format("YYYY-MM-DD HH:mm"),
      tipo,
      nombre,
      text: rec.text,
    };
  });

  // ---- estados de carga / error -------------------------------------------
  if (loading)
    return (
      <div className="flex justify-center items-center py-10">
        <Spin size="large" tip="Cargando recomendaciones..." />
      </div>
    );

  if (error) return <p className="text-red-600">{error}</p>;

  // ---- render --------------------------------------------------------------
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Panel IA – Recomendaciones</h1>

      {/* ---------- filtro de fechas ---------- */}
      <Space className="mb-4" size="middle">
        <RangePicker
          value={dateRange}
          onChange={(vals) => setDateRange(vals || [])}
          format="YYYY-MM-DD"
        />
        <Button type="primary" onClick={handleDateFilter}>
          Filtrar
        </Button>
        <Button onClick={resetFilter}>Reset</Button>
      </Space>

      {/* ------------- tabla ------------------ */}
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
        scroll={{ x: "1000px" }}
        bordered
      />
    </div>
  );
}

export default PanelIA;
