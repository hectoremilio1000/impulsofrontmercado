import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Table, message } from "antd";

function PanelFinanciamientoAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // ID del usuario actual (Admin)
  const currentUserId = auth.user?.id;

  // Cargar solicitudes
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/financing-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "success") {
        // Filtramos solo las solicitudes del usuario actual
        const allRequests = res.data.data || [];
        const myRequests = allRequests.filter(
          (req) => req.userId === currentUserId
        );

        setRequests(myRequests);
      } else {
        message.error("Error al cargar solicitudes");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  // Columnas
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Monto Solicitado",
      dataIndex: "amount",
      key: "amount",
      render: (val) => `$ ${val}`,
    },
    {
      title: "Razón",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (val) => {
        if (val === "pending") return "Pendiente";
        if (val === "approved") return "Aprobada";
        if (val === "rejected") return "Rechazada";
        return val;
      },
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Panel de Financiamiento (Admin)
      </h2>

      <Table
        dataSource={requests}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}

export default PanelFinanciamientoAdmin;
