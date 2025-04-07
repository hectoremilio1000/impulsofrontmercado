import React, { useEffect, useState } from "react";
import {
  Table,
  Select,
  Button,
  message,
  Dropdown,
  Menu,
  Modal,
  Input,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

// Opcional: si deseas un textarea para "objective" largo
const { TextArea } = Input;
const { Option } = Select;

function PanelMarketing() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtro por usuario
  const [selectedUserFilter, setSelectedUserFilter] = useState(null);

  // Para mostrar un adjunto (en un modal, si gustas)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState(null);

  // Cargar tickets y usuarios al inicio
  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, []);

  // GET /api/marketingTickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/marketingTickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        // res.data.data => array con los tickets
        setTickets(res.data.data);
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

  // GET /api/users
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

  /**
   * Actualiza el status de un ticket
   */
  const handleChangeStatus = async (ticket, newStatus) => {
    try {
      // PUT /api/marketingTickets/:id
      const url = `${apiUrl}/marketingTickets/${ticket.id}`;
      await axios.put(
        url,
        { status: newStatus }, // solo cambiamos el status
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Actualizamos el state local
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: newStatus } : t))
      );
      message.success("Estado del ticket actualizado");
    } catch (error) {
      console.error("Error al cambiar estado del ticket:", error);
      message.error("No se pudo cambiar el estado");
    }
  };

  // Para abrir un modal con el primer adjunto (o cualquiera)
  const handleOpenAttachment = (filePath) => {
    setCurrentAttachment(filePath);
    setIsModalVisible(true);
  };

  // Filtrado en memoria por usuario
  const filteredData = tickets.filter((tk) => {
    if (selectedUserFilter && tk.user_id !== selectedUserFilter) {
      return false;
    }
    return true;
  });

  /**
   * Columnas de la tabla
   */
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
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
      title: "Campaña",
      dataIndex: "campaignType",
      width: 120,
    },
    {
      title: "Objetivo",
      dataIndex: "objective",
      // O si quieres cortarlo:
      render: (text) => {
        if (!text) return "";
        if (text.length > 60) {
          return text.slice(0, 60) + "...";
        }
        return text;
      },
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
      // Recuerda que attachments es un JSON con array o string, tipo: ["storage/uploads/marketing/xyz.png"]
      render: (val) => {
        if (!val) return "Sin adjuntos";
        let attachmentsArray = [];
        try {
          attachmentsArray = JSON.parse(val); // si es JSON válido
        } catch (e) {
          // por si val es simple string
          attachmentsArray = [val];
        }

        if (attachmentsArray.length === 0) {
          return "Sin adjuntos";
        }

        return attachmentsArray.map((filePath, idx) => {
          // Ajusta la ruta para que sea accesible:
          // Ej: `${apiUrl}/${filePath}` si tu backend sirve /storage/...
          // O si tienes /api/storage/uploads/marketing/...
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
      render: (_, record) => {
        const menu = (
          <Menu
            onClick={({ key }) => handleChangeStatus(record, key)}
            items={[
              { key: "new", label: "new" },
              { key: "in_progress", label: "in_progress" },
              { key: "completed", label: "completed" },
              { key: "cancelled", label: "cancelled" },
              { key: "rejected", label: "rejected" },
            ]}
          />
        );
        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Panel de Marketing</h2>

      {/* Filtro por usuario */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Filtrar por Usuario: </label>
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
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      {/* Modal para ver adjuntos en un iframe (o image/video) */}
      <Modal
        open={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        width="80%"
        bodyStyle={{ height: "80vh" }}
      >
        {currentAttachment ? (
          // Ejemplo: si el adjunto es imagen => <img src={currentAttachment} ... />
          // Si es pdf => <iframe src="..." .../>
          // Por simplicidad: iframe (lo usa para PDFs e imágenes)
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

export default PanelMarketing;
