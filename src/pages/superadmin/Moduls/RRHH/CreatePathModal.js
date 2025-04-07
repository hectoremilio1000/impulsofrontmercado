// src/pages/rrhh/CreatePathModal.jsx
import React, { useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

const { Option } = Select;

export default function CreatePathModal({ open, onCancel, onCreated }) {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // POST /api/training-paths
      const res = await axios.post(
        `${apiUrl}/training-paths`,
        {
          title: values.title,
          description: values.description,
          role_name: values.role_name, // si quieres asignar a "mesero" o "barista"
          // companyId: (opcional) si la ruta pertenece a una empresa
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.status === "success") {
        message.success("Ruta creada correctamente");
        // Llamamos onCreated para recargar la tabla
        if (onCreated) onCreated();
      } else {
        message.error(res.data.message || "Error al crear la ruta");
      }
    } catch (error) {
      console.error("Error al crear ruta:", error);
      message.error("Error de servidor al crear ruta");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) onCancel();
  };

  return (
    <Modal
      title="Crear Nueva Ruta"
      open={open}
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Crear"
      cancelText="Cancelar"
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Título"
          name="title"
          rules={[{ required: true, message: "Ingresa el título de la ruta" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Descripción" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Rol Asignado" name="role_name">
          <Select placeholder="Selecciona el rol al que va dirigida">
            <Option value="mesero">Mesero</Option>
            <Option value="cocinero">Cocinero</Option>
            <Option value="barista">Barista</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
