import React, { useEffect, useState } from "react";
import { Table, Button, message, Modal } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

function PanelMarketingAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // ID del usuario actual
  const currentUserId = auth.user?.id;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal para ver un adjunto
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState(null);

  // 1. Cargar todos los tickets
  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/marketingTickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        // Guarda la lista completa
        setTickets(res.data.data || []);
      } else {
        message.error("Error al obtener tickets de marketing");
      }
    } catch (error) {
      console.error("Error al obtener tickets de marketing:", error);
      message.error("Error de servidor al obtener tickets de marketing");
    } finally {
      setLoading(false);
    }
  };

  // 2. Filtrar en front: solo los del usuario actual
  const myTickets = tickets.filter((tk) => tk.userId === currentUserId);

  // 3. Adjuntos: abrir modal
  const handleOpenAttachment = (filePath) => {
    setCurrentAttachment(filePath);
    setIsModalVisible(true);
  };

  // Columnas de la tabla
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      fixed: "left",
    },
    {
      title: "Campaña",
      dataIndex: "campaignType",
      width: 120,
    },
    {
      title: "Objetivo",
      dataIndex: "objective",
      render: (text) => (text?.length > 60 ? text.slice(0, 60) + "..." : text),
    },
    {
      title: "Presupuesto",
      dataIndex: "budget",
      width: 100,
      render: (val) => (val ? `$${val}` : "$0"),
    },
    {
      title: "Estado",
      dataIndex: "status",
      width: 120,
    },
    {
      title: "Adjuntos",
      dataIndex: "attachments",
      render: (val) => {
        if (!val) return "Sin adjuntos";

        let attachmentsArray = [];
        try {
          attachmentsArray = JSON.parse(val); // por si está en formato JSON
        } catch {
          // si no es JSON, lo tratamos como string
          attachmentsArray = [val];
        }

        if (attachmentsArray.length === 0) {
          return "Sin adjuntos";
        }

        return attachmentsArray.map((filePath, idx) => {
          const fullUrl = `${apiUrl}/${filePath}`;
          return (
            <div key={idx}>
              <Button type="link" onClick={() => handleOpenAttachment(fullUrl)}>
                Ver Adjunto {idx + 1}
              </Button>
            </div>
          );
        });
      },
    },
    {
      title: "Creado",
      dataIndex: "createdAt",
      width: 150,
      render: (val) => {
        if (!val) return "-";
        const fecha = new Date(val);
        return fecha.toLocaleString("es-MX", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      title: "Acciones",
      dataIndex: "actions",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Button icon={<MoreOutlined />} disabled>
          {/* El admin normal no hace cambios, solo visualiza */}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 22, marginBottom: 16 }}>
        Panel de Marketing (Admin)
      </h2>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={myTickets}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1200 }}
      />

      {/* Modal para ver adjuntos */}
      <Modal
        open={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        width="80%"
        bodyStyle={{ height: "80vh" }}
      >
        {currentAttachment ? (
          <iframe
            src={currentAttachment}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Adjunto"
          />
        ) : (
          <p>Sin adjunto</p>
        )}
      </Modal>
    </div>
  );
}

export default PanelMarketingAdmin;
