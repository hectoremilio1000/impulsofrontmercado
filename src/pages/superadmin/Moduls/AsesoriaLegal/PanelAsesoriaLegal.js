// src/pages/superadmin/Moduls/AsesoriaLegal/PanelAsesoriaLegal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Table, message, Dropdown, Button, Modal, Select } from "antd";
import { MoreOutlined } from "@ant-design/icons";

function PanelAsesoriaLegal() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Para editar el estado del ticket
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Cargar la lista de tickets de asesoría legal
  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await axios.get(`${apiUrl}/legal-tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        console.log(response.data.data);
        setTickets(response.data.data);
      } else {
        message.error("Error al cargar solicitudes de asesoría legal");
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
    // eslint-disable-next-line
  }, []);

  // =============================================================
  // 1) Manejo de Modal para editar estado
  // =============================================================
  const openEditStatusModal = (record) => {
    setEditTicket(record);
    setNewStatus(record.status); // Valor inicial
    setIsEditModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!editTicket) return;
    try {
      const resp = await axios.put(
        `${apiUrl}/legal-tickets/${editTicket.id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (resp.data.status === "success") {
        message.success("Estado actualizado correctamente");
        fetchTickets();
        setIsEditModalOpen(false);
        setEditTicket(null);
      } else {
        message.error("No se pudo actualizar el estado");
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      message.error("Error al actualizar el estado");
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditTicket(null);
  };

  // =============================================================
  // 2) Definir el menú de acciones (3 puntos)
  // =============================================================
  const getActionsMenu = (record) => {
    return [
      {
        key: "1",
        label: (
          <div onClick={() => openEditStatusModal(record)}>Editar Estado</div>
        ),
      },
      // Aquí podrías agregar otras acciones, como "Ver Detalle", "Eliminar", etc.
    ];
  };

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
      render: (text, record) => {
        return record.user ? record.user.name : "Sin nombre";
      },
    },
    // =============================================================
    // 3) Agregar columna de Acciones
    // =============================================================
    {
      title: "Acciones",
      key: "acciones",
      width: 80,
      render: (text, record) => (
        <Dropdown menu={{ items: getActionsMenu(record) }} trigger={["click"]}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Panel de Solicitudes de Asesoría Legal
      </h2>

      <Table
        dataSource={tickets}
        columns={columns}
        rowKey="id"
        loading={loadingTickets}
        pagination={{ pageSize: 6 }}
      />

      {/* MODAL PARA EDITAR ESTADO */}
      <Modal
        title="Editar Estado del Ticket"
        open={isEditModalOpen}
        onCancel={handleCancelEdit}
        onOk={handleUpdateStatus}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <p>
          Cambia el estado del ticket ID: <b>{editTicket?.id}</b>
        </p>
        <Select
          style={{ width: "100%" }}
          value={newStatus}
          onChange={(val) => setNewStatus(val)}
        >
          <Select.Option value="new">new</Select.Option>
          <Select.Option value="in_progress">in_progress</Select.Option>
          <Select.Option value="completed">completed</Select.Option>
          <Select.Option value="cancelled">cancelled</Select.Option>
        </Select>
      </Modal>
    </div>
  );
}

export default PanelAsesoriaLegal;
