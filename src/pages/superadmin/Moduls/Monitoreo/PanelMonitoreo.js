// src/pages/superadmin/Moduls/Monitoreo/PanelMonitoreo.jsx

import React, { useEffect, useState } from "react";
import { Table, Select, Button, message, Modal, Input } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

const { Option } = Select;
const { TextArea } = Input;

function PanelMonitoreo() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtro por usuario
  const [selectedUserFilter, setSelectedUserFilter] = useState(null);

  // Estado del modal "Editar"
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editTicket, setEditTicket] = useState(null); // ticket a editar
  const [editStatus, setEditStatus] = useState("");
  const [editResolution, setEditResolution] = useState("");

  // Modal para ver adjuntos
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState(null);

  // ==========================
  // Cargar Tickets y Usuarios
  // ==========================
  useEffect(() => {
    fetchTickets();
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/camera-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setTickets(res.data.data);
      } else {
        message.error("Error al obtener tickets de monitoreo");
      }
    } catch (error) {
      console.error("Error al obtener tickets de monitoreo:", error);
      message.error("Error de servidor al obtener tickets de monitoreo");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.data) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  // ==========================
  // Filtro en memoria por user
  // ==========================
  const filteredData = tickets.filter((tk) => {
    if (selectedUserFilter && tk.user_id !== selectedUserFilter) {
      return false;
    }
    return true;
  });

  // ==========================
  // Modal de Editar
  // ==========================
  const openEditModal = (ticket) => {
    // ticket => { id, status, resolution, ... }
    setEditTicket(ticket);
    setEditStatus(ticket.status || "new");
    setEditResolution(ticket.resolution || "");
    setIsEditModalVisible(true);
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setEditTicket(null);
    setEditStatus("");
    setEditResolution("");
  };

  const handleSaveEdit = async () => {
    if (!editTicket) return;

    try {
      const url = `${apiUrl}/camera-tickets/${editTicket.id}`;
      const body = {
        status: editStatus,
        resolution: editResolution,
      };

      const resp = await axios.put(url, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.data.status === "success") {
        message.success("Ticket actualizado correctamente");
        // Actualiza en el state local
        setTickets((prev) =>
          prev.map((t) =>
            t.id === editTicket.id
              ? { ...t, status: editStatus, resolution: editResolution }
              : t
          )
        );
        handleCancelEdit();
      } else {
        message.error("No se pudo actualizar el ticket");
      }
    } catch (error) {
      console.error("Error al actualizar el ticket:", error);
      message.error("Error al actualizar el ticket");
    }
  };

  // ==========================
  // Modal para ver adjuntos
  // ==========================
  const handleOpenAttachment = (filePath) => {
    setCurrentAttachment(filePath);
    setIsModalVisible(true);
  };

  // ==========================
  // Columnas de la tabla
  // ==========================
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 50,
      fixed: "left",
    },
    {
      title: "Usuario",
      dataIndex: "userId",
      width: 120,
      render: (userId) => {
        const userObj = users.find((u) => u.id === userId);
        return userObj ? userObj.name : `Usuario #${userId}`;
      },
    },
    {
      title: "Asunto",
      dataIndex: "subject",
      width: 130,
      render: (txt) => (txt ? txt : "-"),
    },
    {
      title: "Descripción",
      dataIndex: "description",
      width: 180,
      render: (txt) => (txt ? txt : "-"),
    },
    {
      title: "Cámara",
      dataIndex: "cameraName",
      width: 120,
      render: (val) => val || "-",
    },
    {
      title: "Inicio",
      dataIndex: "startTime",
      width: 160,
      render: (val) => {
        if (!val) return "-";
        const dateObj = new Date(val);
        return dateObj.toLocaleString("es-MX", {
          hour12: false,
          dateStyle: "short",
          timeStyle: "short",
        });
      },
    },
    {
      title: "Fin",
      dataIndex: "endTime",
      width: 160,
      render: (val) => {
        if (!val) return "-";
        const dateObj = new Date(val);
        return dateObj.toLocaleString("es-MX", {
          hour12: false,
          dateStyle: "short",
          timeStyle: "short",
        });
      },
    },
    {
      title: "Estado",
      dataIndex: "status",
      width: 120,
      render: (val) => val || "-",
    },
    {
      title: "Resolución",
      dataIndex: "resolution",
      width: 180,
      render: (val) => (val ? val : "-"),
    },
    {
      title: "Adjuntos",
      dataIndex: "attachments",
      width: 140,
      render: (val) => {
        if (!val) return "Sin adjuntos";

        let attachmentsArray = [];
        if (Array.isArray(val)) {
          attachmentsArray = val;
        } else {
          // Asume que viene JSON string
          try {
            attachmentsArray = JSON.parse(val);
          } catch (e) {
            attachmentsArray = [val];
          }
        }

        if (attachmentsArray.length === 0) return "Sin adjuntos";

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
      title: "Editar",
      dataIndex: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => {
        return <Button onClick={() => openEditModal(record)}>Editar</Button>;
      },
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 22, marginBottom: 16 }}>
        Panel de Solicitudes de Monitoreo (Cámaras)
      </h2>

      {/* Filtro por usuario */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Filtrar por Usuario:</label>
        <Select
          placeholder="Selecciona un usuario"
          allowClear
          style={{ width: 220 }}
          value={selectedUserFilter}
          onChange={(val) => setSelectedUserFilter(val || null)}
        >
          {users.map((u) => (
            <Option key={u.id} value={u.id}>
              {u.name} (ID {u.id})
            </Option>
          ))}
        </Select>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 1600 }}
      />

      {/* Modal para ver adjunto */}
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

      {/* MODAL para EDITAR TICKET */}
      <Modal
        title="Editar Ticket"
        open={isEditModalVisible}
        onCancel={handleCancelEdit}
        onOk={handleSaveEdit}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <p>Estado:</p>
        <Select
          style={{ width: "100%", marginBottom: 16 }}
          value={editStatus}
          onChange={(val) => setEditStatus(val)}
        >
          <Option value="new">new</Option>
          <Option value="in_progress">in_progress</Option>
          <Option value="resolved">resolved</Option>
          <Option value="cancelled">cancelled</Option>
        </Select>

        <p>Resolución (¿qué pasó?):</p>
        <TextArea
          rows={3}
          placeholder="Explica la resolución del caso..."
          value={editResolution}
          onChange={(e) => setEditResolution(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default PanelMonitoreo;
