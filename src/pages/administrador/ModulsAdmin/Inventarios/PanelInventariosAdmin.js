import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Table, Button, message, Modal, Tag } from "antd";

function PanelInventariosAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // ID del usuario actual (Admin)
  const currentUserId = auth.user?.id;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado del modal para ver archivo adjunto
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFileUrl, setCurrentFileUrl] = useState("");

  // Cargar inventarios al montar
  useEffect(() => {
    fetchInventarios();
    // eslint-disable-next-line
  }, []);

  const fetchInventarios = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/inventarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setData(res.data.data || []);
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

  // Filtrar solo los inventarios del usuario actual
  const myInventarios = data.filter((item) => item.userId === currentUserId);

  // Abrir modal para ver archivo
  const handleOpenFile = (fileUrl) => {
    setCurrentFileUrl(fileUrl);
    setIsModalVisible(true);
  };

  // Columnas
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
      title: "Tipo Inventario",
      dataIndex: "tipoInventario",
    },
    {
      title: "Descripción",
      dataIndex: "description",
    },
    {
      title: "Prioridad",
      dataIndex: "priority",
    },
    {
      title: "Adjuntos",
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
    },
    {
      title: "Creado",
      dataIndex: "createdAt",
      width: 160,
      render: (val) => new Date(val).toLocaleString(),
    },
    {
      title: "Acciones",
      render: () => (
        <Button disabled>
          {/* Admin no cambia el estado, solo visualiza */}
          Ver / Editar
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>
        Panel de Inventarios (Admin)
      </h2>

      <Button onClick={fetchInventarios} style={{ marginBottom: 16 }}>
        Refrescar
      </Button>

      <Table
        rowKey="id"
        dataSource={myInventarios}
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
}

export default PanelInventariosAdmin;
