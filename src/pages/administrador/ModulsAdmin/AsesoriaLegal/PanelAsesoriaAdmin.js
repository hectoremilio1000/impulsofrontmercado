// src/pages/administrador/ModulsAdmin/AsesoriaLegal/PanelAsesoriaAdmin.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, message } from "antd";
import { useAuth } from "../../../../components/AuthContext";

function PanelAsesoriaAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Cargar la lista de tickets de asesoría legal (del admin)
  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await axios.get(`${apiUrl}/legal-tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        setTickets(response.data.data);
      } else {
        message.error("Error al cargar tus solicitudes de asesoría legal");
      }
    } catch (error) {
      console.error("Error al cargar tickets:", error);
      message.error("Error de conexión al cargar solicitudes de asesoría");
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Columnas para la tabla
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Asunto",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 120,
    },
    {
      title: "Usuario ID",
      dataIndex: "userId",
      key: "user_id",
      width: 100,
    },
    {
      title: "Nombre de Usuario",
      key: "userName",
      render: (_, record) => {
        // record.user es el objeto con los datos del usuario (por preload en backend)
        return record.user ? record.user.name : "Sin nombre";
      },
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Mis Solicitudes de Asesoría Legal
      </h2>

      <Table
        dataSource={tickets}
        columns={columns}
        rowKey="id"
        loading={loadingTickets}
        pagination={{ pageSize: 6 }}
      />
    </div>
  );
}

export default PanelAsesoriaAdmin;
