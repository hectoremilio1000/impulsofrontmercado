// src/pages/administrador/ModulsAdmin/AyudaIA/PanelIAAdmin.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spin, message } from "antd";
import { useAuth } from "../../../../components/AuthContext";

function PanelIAAdmin() {
  const { auth } = useAuth(); // Para obtener token y datos del usuario (incluido rolId, id)
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3333";

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Al montar el componente, cargamos las recomendaciones
  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line
  }, []);

  async function fetchRecommendations() {
    try {
      setLoading(true);
      // Llamada GET con Bearer token en el header
      const resp = await axios.get(`${apiUrl}/recommendations`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (resp.data.status === "success") {
        setRecommendations(resp.data.data);
      } else {
        throw new Error(resp.data.message || "Error al cargar recomendaciones");
      }
    } catch (err) {
      console.error("Error fetchRecommendations:", err);
      setError(err.message);
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 1. Obtenemos el rol y el id del usuario autenticado
  const userRolId = auth.user?.rolId; // Ej: 1 = superadmin, 2 = admin
  const userId = auth.user?.id;

  // 2. Filtramos o no, dependiendo del rol
  let filteredRecommendations = [];
  if (userRolId === 1) {
    // Si es superadmin, mostramos todo
    filteredRecommendations = recommendations;
  } else {
    // Si NO es superadmin, mostramos solo las que tengan user_id = userId
    filteredRecommendations = recommendations.filter(
      (item) => item.userId === userId
    );
  }

  // 3. Construimos el dataSource con el array ya filtrado
  const dataSource = filteredRecommendations.map((rec) => {
    let tipo = "Desconocido";
    let nombre = "";

    if (rec.prospectId && rec.prospect) {
      tipo = "Prospecto";
      const { first_name, last_name } = rec.prospect;
      nombre =
        [first_name, last_name].filter(Boolean).join(" ") ||
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

  // Definimos las columnas de la tabla AntD
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
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
      title: "Recomendación - Estudio de Mercado",
      dataIndex: "text",
      key: "text",
      render: (text) => (
        <div
          style={{
            whiteSpace: "pre-wrap",
            maxHeight: "500px",
            overflowY: "auto",
          }}
        >
          {text}
        </div>
      ),
    },
  ];

  // Render condicional
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

  // Render final con la tabla
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">
        Panel IA Admin - Recomendaciones
      </h1>
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

export default PanelIAAdmin;
