import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import {
  Table,
  Tag,
  Space,
  Select,
  Button,
  message,
  Modal,
  Dropdown,
  Menu,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";

const PanelSistemaWeb = () => {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // Estados de datos
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros en memoria
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUser, setFilterUser] = useState("");

  // Estados para el modal de ver foto/archivo
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFoto, setCurrentFoto] = useState(null);

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  // Cargar tickets
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${apiUrl}/tickets-web`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(resp.data.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      message.error("Error cargando los tickets");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambiar status cuando se selecciona en el menú
   */
  const handleChangeStatus = async (requestId, newStatus) => {
    try {
      await axios.put(
        `${apiUrl}/tickets-web/${requestId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Status actualizado");
      fetchRequests();
    } catch (error) {
      console.error("Error actualizando status:", error);
      message.error("No se pudo actualizar el status");
    }
  };

  // Abrir modal para ver imagen/archivo
  const handleOpenAttachment = (fileUrl) => {
    setCurrentFoto(fileUrl);
    setIsModalVisible(true);
  };

  // Columnas de la tabla
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Usuario",
      dataIndex: ["user", "name"],
      key: "user_name",
      // o (text, record) => record.user?.name
    },
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Archivos",
      dataIndex: "attachments",
      key: "attachments",
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
                Ver foto {idx + 1}
              </Button>
            </div>
          );
        });
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "blue";
        if (status === "completed") color = "green";
        else if (status === "rejected") color = "red";
        else if (status === "pending") color = "volcano";
        else if (status === "in_progress") color = "orange";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: "Pending", value: "pending" },
        { text: "In Progress", value: "in_progress" },
        { text: "Completed", value: "completed" },
        { text: "Rejected", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Creado",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (val) => new Date(val).toLocaleString(),
    },
    {
      title: "Acciones",
      key: "actions",
      // En lugar de botones directos, usamos un Dropdown con 3 puntos
      render: (text, record) => {
        const menu = (
          <Menu
            onClick={({ key }) => handleChangeStatus(record.id, key)}
            items={[
              { key: "pending", label: "Pending" },
              { key: "in_progress", label: "In Progress" },
              { key: "completed", label: "Completed" },
              { key: "rejected", label: "Rejected" },
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

  // Filtro adicional en memoria
  const filteredData = requests.filter((item) => {
    let pass = true;
    if (filterStatus && item.status !== filterStatus) pass = false;
    if (filterUser && item.user?.name !== filterUser) pass = false;
    return pass;
  });

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>
        Panel de Solicitudes (Sistema Web)
      </h1>

      {/* Filtros */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Select
          placeholder="Filtrar Status"
          allowClear
          style={{ width: 150 }}
          onChange={(val) => setFilterStatus(val)}
        >
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="in_progress">In Progress</Select.Option>
          <Select.Option value="completed">Completed</Select.Option>
          <Select.Option value="rejected">Rejected</Select.Option>
        </Select>

        <Select
          placeholder="Filtrar por Usuario"
          allowClear
          style={{ width: 200 }}
          onChange={(val) => setFilterUser(val)}
        >
          {[...new Set(requests.map((r) => r.user?.name).filter(Boolean))].map(
            (name) => (
              <Select.Option key={name} value={name}>
                {name}
              </Select.Option>
            )
          )}
        </Select>

        <Button onClick={fetchRequests}>Refrescar</Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 900 }}
      />

      {/* Modal para la foto/archivo */}
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
            alt="ArchivoTicket"
            style={{ maxWidth: "100%", maxHeight: "80vh" }}
          />
        ) : (
          <p>Sin archivo</p>
        )}
      </Modal>
    </div>
  );
};

export default PanelSistemaWeb;
