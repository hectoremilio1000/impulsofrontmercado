// src/pages/rrhh/TrainingPathsList.jsx
import React, { useEffect, useState } from "react";
import { Table, message, Button, Modal, Form, Input } from "antd";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

export default function TrainingPathsList() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(false);

  // Para controlar el modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Form de Ant Design
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPaths();
  }, []);

  const fetchPaths = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/training-paths`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setPaths(res.data.data);
      } else {
        message.error("Error al obtener TrainingPaths");
      }
    } catch (error) {
      console.error("Error al obtener TrainingPaths:", error);
      message.error("Error de servidor al listar paths");
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal
  const handleOpenModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  // Al hacer submit del form => crear la ruta
  const handleCreatePath = async (values) => {
    try {
      // values => { title, description, role_name }
      const res = await axios.post(
        `${apiUrl}/training-paths`,
        {
          title: values.title,
          description: values.description,
          role_name: values.role_name,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.status === "success") {
        message.success("Ruta creada correctamente");
        setIsModalVisible(false);
        fetchPaths(); // recargar la lista
      } else {
        message.error("Error al crear la ruta: " + (res.data.message || ""));
      }
    } catch (error) {
      console.error("Error al crear ruta:", error);
      message.error("Error de servidor al crear ruta");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Título", dataIndex: "title", width: 200 },
    {
      title: "Descripción",
      dataIndex: "description",
    },
    {
      title: "Rol",
      dataIndex: "role_name",
      width: 120,
    },
  ];

  return (
    <div>
      <h3>Lista de Rutas de Capacitación</h3>
      {/* Botón para abrir modal */}
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={handleOpenModal}
      >
        Crear Ruta
      </Button>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={paths}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />

      <Modal
        title="Nueva Ruta de Capacitación"
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={null} // Usaremos el submit del form
      >
        <Form form={form} layout="vertical" onFinish={handleCreatePath}>
          <Form.Item
            label="Título"
            name="title"
            rules={[{ required: true, message: "Ingresa el título" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Descripción"
            name="description"
            rules={[{ required: true, message: "Ingresa la descripción" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Rol al que va dirigido"
            name="role_name"
            rules={[{ required: true, message: "Indica el rol" }]}
          >
            <Input placeholder="Ej: mesero, cocinero, etc." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Crear
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={handleCloseModal}>
              Cancelar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
