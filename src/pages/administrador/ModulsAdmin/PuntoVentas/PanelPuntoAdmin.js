import React, { useEffect, useState } from "react";
import { Table, Button, message, Modal } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

function PanelPuntoAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // ID del usuario actual (Admin)
  const currentUserId = auth.user?.id;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal para ver foto
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFoto, setCurrentFoto] = useState(null);

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // GET /api/punto-venta-tickets
      const res = await axios.get(`${apiUrl}/punto-venta-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setTickets(res.data.data || []);
      } else {
        message.error("Error al obtener tickets de punto de venta");
      }
    } catch (error) {
      console.error("Error al obtener tickets:", error);
      message.error("Error de servidor al obtener tickets de punto de venta");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar en front: solo tickets donde tk.userId === currentUserId
  const myTickets = tickets.filter((tk) => tk.userId === currentUserId);

  // Abrir foto en un modal
  const handleOpenFoto = (fotoPath) => {
    setCurrentFoto(fotoPath);
    setIsModalVisible(true);
  };

  // Columnas
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      fixed: "left",
    },
    {
      title: "Título",
      dataIndex: "tituloProblema",
    },
    {
      title: "Urgencia",
      dataIndex: "urgencia",
      width: 100,
    },
    {
      title: "WhatsApp",
      dataIndex: "whatsapp",
      render: (val) =>
        val ? (
          <a href={`https://wa.me/${val}`} target="_blank" rel="noreferrer">
            {val}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      width: 120,
    },
    {
      title: "Foto",
      dataIndex: "foto",
      render: (val) => {
        if (!val) return "Sin foto";
        // Ruta completa:
        const fullUrl = `${apiUrl}/${val}`;
        return (
          <Button type="link" onClick={() => handleOpenFoto(fullUrl)}>
            Ver Foto
          </Button>
        );
      },
    },
    {
      title: "Acciones",
      dataIndex: "actions",
      render: () => (
        <Button icon={<MoreOutlined />} disabled>
          {/* Admin no cambia estado, solo visualiza */}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>
        Panel Punto de Venta (Admin)
      </h2>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={myTickets}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 800 }}
      />

      {/* Modal para foto */}
      <Modal
        open={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        width="70%"
        bodyStyle={{ textAlign: "center" }}
      >
        {currentFoto ? (
          <img
            src={currentFoto}
            alt="FotoTicket"
            style={{ maxWidth: "100%", maxHeight: "80vh" }}
          />
        ) : (
          <p>Sin foto</p>
        )}
      </Modal>
    </div>
  );
}

export default PanelPuntoAdmin;
