// src/pages/superadmin/Moduls/AyudaIA/PanelIA.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spin, message } from "antd";
import { useAuth } from "../../../../components/AuthContext";

function PanelIA() {
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3333";
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1) Obtenemos info del user (rol, id, etc.)
  const { auth } = useAuth();
  const currentUserId = auth.user?.id;
  // IMPORTANTE: si el superadmin en tu DB es rol_id=1:
  const isSuperAdmin = auth.user?.rolId === 1;

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRecommendations() {
    try {
      setLoading(true);

      // Obtenemos todas las recomendaciones
      const resp = await axios.get(`${apiUrl}/recommendations`);

      if (resp.data.status === "success") {
        const allRecs = resp.data.data;

        // Si es superadmin => mostrar todas
        if (isSuperAdmin) {
          setRecommendations(allRecs);
        } else {
          // Si NO es superadmin => filtrar solo las del usuario actual
          const myRecs = allRecs.filter((rec) => rec.userId === currentUserId);
          setRecommendations(myRecs);
        }
      } else {
        throw new Error(resp.data.message || "Error al cargar recomendaciones");
      }
    } catch (err) {
      console.error("Error fetchAllRecommendations:", err);
      setError(err.message);
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Columnas de la tabla
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      width: 100,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      width: 180,
      render: (nombre) => (nombre ? nombre : "N/A"),
    },
    {
      title: "Texto",
      dataIndex: "text",
      key: "text",
      render: (text) => (
        <div
          style={{
            whiteSpace: "pre-wrap",
            overflowY: "auto",
          }}
        >
          {text}
        </div>
      ),
    },
  ];

  // Mapeo de recomendations al dataSource
  const dataSource = recommendations.map((rec) => {
    let tipo = "Desconocido";
    let nombre = "";

    // Ajustar a firstName/lastName (tal como vienen en tu JSON)
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
      tipo,
      nombre,
      text: rec.text,
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spin size="large" tip="Cargando recomendaciones..." />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Panel IA - Recomendaciones</h1>
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
