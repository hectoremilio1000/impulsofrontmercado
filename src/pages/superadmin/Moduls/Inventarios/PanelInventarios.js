// src/pages/PanelInventarios.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import {
  Table,
  Select,
  Button,
  message,
  Modal,
  Dropdown,
  Menu,
  Tag,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";

const PanelInventarios = () => {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUser, setFilterUser] = useState("");

  // Modal para ver archivo
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFileUrl, setCurrentFileUrl] = useState("");

  const fetchInventarios = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/inventarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setData(res.data.data);
      } else {
        message.error("Error al obtener inventarios");
      }
    } catch (error) {
      console.error("Error fetch inventarios:", error);
      message.error("Error de servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventarios();
    // eslint-disable-next-line
  }, []);

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `${apiUrl}/inventarios/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Status actualizado");
      fetchInventarios();
    } catch (error) {
      console.error("Error cambiando status", error);
      message.error("No se pudo cambiar status");
    }
  };

  const handleOpenFile = (fileUrl) => {
    setCurrentFileUrl(fileUrl);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Usuario",
      dataIndex: ["user", "name"],
      render: (val) => val || "Sin usuario",
    },
    {
      title: "Título",
      dataIndex: "title",
    },
    {
      title: "Tipo Inventario",
      dataIndex: "tipoInventario",
    },
    {
      title: "Prioridad",
      dataIndex: "priority",
    },
    {
      title: "Archivos",
      dataIndex: "attachments",
      render: (attachments) => {
        if (!attachments) return "Sin archivos";
        let arr = [];
        try {
          arr = JSON.parse(attachments);
        } catch (err) {
          arr = [];
        }
        if (arr.length === 0) return "Sin archivos";

        return arr.map((path, idx) => {
          // Ajusta la ruta real según cómo sirvas tus archivos
          const fullUrl = `${apiUrl}/${path}`;
          return (
            <Button
              key={idx}
              type="link"
              onClick={() => handleOpenFile(fullUrl)}
            >
              Ver archivo {idx + 1}
            </Button>
          );
        });
      },
    },
    {
      title: "Status",
      dataIndex: "status",
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
      render: (val) => new Date(val).toLocaleString(),
      width: 160,
    },
    {
      title: "Acciones",
      render: (text, record) => {
        const menu = (
          <Menu onClick={({ key }) => handleChangeStatus(record.id, key)}>
            <Menu.Item key="pending">Pending</Menu.Item>
            <Menu.Item key="in_progress">In Progress</Menu.Item>
            <Menu.Item key="completed">Completed</Menu.Item>
            <Menu.Item key="rejected">Rejected</Menu.Item>
          </Menu>
        );
        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // Filtrar en memoria
  const filteredData = data.filter((item) => {
    let pass = true;
    if (filterStatus && item.status !== filterStatus) pass = false;
    if (filterUser && item.user?.name !== filterUser) pass = false;
    return pass;
  });

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Panel de Inventarios</h2>

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Select
          placeholder="Filtrar por Status"
          allowClear
          style={{ width: 180 }}
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
          {[...new Set(data.map((r) => r.user?.name).filter(Boolean))].map(
            (name) => (
              <Select.Option key={name} value={name}>
                {name}
              </Select.Option>
            )
          )}
        </Select>

        <Button onClick={fetchInventarios}>Refrescar</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={filteredData}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        width="70%"
        bodyStyle={{ textAlign: "center" }}
      >
        {currentFileUrl ? (
          <img
            src={currentFileUrl}
            alt="ArchivoInventario"
            style={{ maxWidth: "100%", maxHeight: "80vh" }}
          />
        ) : (
          <p>Sin archivo</p>
        )}
      </Modal>
    </div>
  );
};

export default PanelInventarios;
