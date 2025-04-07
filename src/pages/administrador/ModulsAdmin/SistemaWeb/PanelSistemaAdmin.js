import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Table, Tag, Select, Button, message, Modal } from "antd";

function PanelSistemaAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // ID del usuario actual (Admin)
  const currentUserId = auth.user?.id;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtro de estado en memoria
  const [filterStatus, setFilterStatus] = useState("");

  // Modal para ver adjunto (imagen/archivo)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState(null);

  // Cargar tickets una vez
  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  // GET /tickets-web
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${apiUrl}/tickets-web`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.status === "success") {
        setRequests(resp.data.data || []);
      } else {
        message.error("Error al obtener solicitudes de Sistema Web");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      message.error("Error cargando los tickets");
    } finally {
      setLoading(false);
    }
  };

  // Filtramos primero SOLO los tickets del usuario actual
  const myRequests = requests.filter((item) => item.userId === currentUserId);

  // Filtro adicional por status
  const finalData = myRequests.filter((item) => {
    if (filterStatus && item.status !== filterStatus) return false;
    return true;
  });

  // Abrir modal con adjunto
  const handleOpenAttachment = (fileUrl) => {
    setCurrentAttachment(fileUrl);
    setIsModalVisible(true);
  };

  // Columnas de la tabla
  const columns = [
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
      title: "Descripción",
      dataIndex: "description",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Adjuntos",
      dataIndex: "attachments",
      render: (val) => {
        if (!val) return "Sin adjuntos";
        let attachmentsArray = [];
        try {
          attachmentsArray = JSON.parse(val); // Por si es JSON
        } catch {
          attachmentsArray = [val]; // Si es string simple
        }

        if (!attachmentsArray.length) return "Sin adjuntos";

        return attachmentsArray.map((filePath, idx) => {
          const fullUrl = `${apiUrl}/${filePath}`;
          return (
            <div key={idx}>
              <Button type="link" onClick={() => handleOpenAttachment(fullUrl)}>
                Ver Archivo {idx + 1}
              </Button>
            </div>
          );
        });
      },
    },
    {
      title: "Estado",
      dataIndex: "status",
      width: 100,
      render: (status) => {
        // Opcional: coloreado con Tag
        let color = "blue";
        if (status === "completed") color = "green";
        else if (status === "rejected") color = "red";
        else if (status === "in_progress") color = "orange";
        else if (status === "pending") color = "volcano";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Creado",
      dataIndex: "createdAt",
      width: 140,
      render: (val) => {
        if (!val) return "-";
        return new Date(val).toLocaleString();
      },
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>
        Panel de Solicitudes (Sistema Web) - Admin
      </h2>

      {/* Filtro de estado */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Select
          placeholder="Filtrar por Status"
          allowClear
          style={{ width: 180 }}
          value={filterStatus || undefined}
          onChange={(val) => setFilterStatus(val || "")}
        >
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="in_progress">In Progress</Select.Option>
          <Select.Option value="completed">Completed</Select.Option>
          <Select.Option value="rejected">Rejected</Select.Option>
        </Select>

        <Button onClick={fetchRequests}>Refrescar</Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={finalData}
        loading={loading}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 800 }}
      />

      {/* Modal para ver adjunto */}
      <Modal
        open={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        width="70%"
        bodyStyle={{ textAlign: "center" }}
      >
        {currentAttachment ? (
          <img
            src={currentAttachment}
            alt="ArchivoTicket"
            style={{ maxWidth: "100%", maxHeight: "80vh" }}
          />
        ) : (
          <p>Sin archivo</p>
        )}
      </Modal>
    </div>
  );
}

export default PanelSistemaAdmin;
