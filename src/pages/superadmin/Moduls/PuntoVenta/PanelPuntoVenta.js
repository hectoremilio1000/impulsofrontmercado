// file: PanelPuntoVenta.jsx
import React, { useEffect, useState } from "react";
import { Table, Select, Button, message, Dropdown, Menu, Modal } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

const { Option } = Select;

function PanelPuntoVenta() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtro por usuario
  const [selectedUserFilter, setSelectedUserFilter] = useState(null);

  // Modal para ver la foto (si es imagen)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFoto, setCurrentFoto] = useState(null);

  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // GET /api/punto-venta-tickets
      const res = await axios.get(`${apiUrl}/punto-venta-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setTickets(res.data.data);
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

  const handleChangeStatus = async (ticket, newStatus) => {
    try {
      // PUT /api/punto-venta-tickets/:id
      const url = `${apiUrl}/punto-venta-tickets/${ticket.id}`;
      await axios.put(
        url,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar state local
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: newStatus } : t))
      );
      message.success("Estado actualizado");
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      message.error("No se pudo cambiar el estado");
    }
  };

  // Filtrado en memoria por user
  const filteredData = tickets.filter((tk) => {
    if (selectedUserFilter && tk.user_id !== selectedUserFilter) {
      return false;
    }
    return true;
  });

  // Abrir foto en un modal (si la foto es imagen)
  const handleOpenFoto = (fotoPath) => {
    setCurrentFoto(fotoPath);
    setIsModalVisible(true);
  };

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
      render: (val) => {
        const userObj = users.find((u) => u.id === val);
        return userObj ? userObj.name : `User #${val}`;
      },
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
      title: "Status",
      dataIndex: "status",
      width: 120,
    },
    {
      title: "Foto",
      dataIndex: "foto",
      render: (val) => {
        if (!val) return "Sin foto";
        // Ruta completa (asumiendo que tu Adonis sirve /api/...):
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
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Panel Punto de Venta</h2>

      {/* Filtro por usuario */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Filtrar por Usuario:</label>
        <Select
          allowClear
          placeholder="Selecciona un usuario"
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

export default PanelPuntoVenta;
