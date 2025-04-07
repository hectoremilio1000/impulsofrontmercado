// src/components/employees/CreateEmployeeModal.jsx
import React, { useState } from "react";
import { Modal, Button, Form, Input, Select, message } from "antd";
import axios from "axios";
import { useAuth } from "../../AuthContext";

const { Option } = Select;

const CreateEmployeeModal = ({ visible, onCancel, onSuccess }) => {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // El admin puede tener varias empresas
  const companies = auth.user?.companies || [];

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!values.companyId) {
        return message.error("Debes seleccionar la empresa");
      }
      setLoading(true);

      // Petición POST a /companies/:companyId/employees
      await axios.post(
        `${apiUrl}/companies/${values.companyId}/employees`,
        {
          name: values.name,
          email: values.email,
          phone: values.phone,
          position: values.position,

          // Si deseas mandar password para el nuevo usuario
          // (si no, en el backend se pone '123456' por defecto)
          password: values.password || "",
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      message.success("Empleado creado exitosamente");
      form.resetFields();
      onSuccess(); // notifica al padre que se creó
    } catch (error) {
      console.error("[CreateEmployeeModal] Error create =>", error);
      message.error("No se pudo crear el empleado");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Crear Nuevo Empleado"
      visible={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button
          key="create"
          type="primary"
          onClick={handleOk}
          loading={loading}
        >
          Crear
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {/* Empresa */}
        <Form.Item
          name="companyId"
          label="Empresa"
          rules={[{ required: true, message: "Selecciona la empresa" }]}
        >
          <Select placeholder="Selecciona la empresa">
            {companies.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name} (ID: {c.id})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Nombre */}
        <Form.Item
          name="name"
          label="Nombre del Empleado"
          rules={[{ required: true, message: "Ingresa el nombre" }]}
        >
          <Input />
        </Form.Item>

        {/* Email */}
        <Form.Item
          name="email"
          label="Email del Empleado"
          rules={[
            { required: true, message: "Ingresa el email" },
            { type: "email", message: "El email no es válido" },
          ]}
        >
          <Input />
        </Form.Item>

        {/* Teléfono */}
        <Form.Item name="phone" label="Teléfono / WhatsApp">
          <Input />
        </Form.Item>

        {/* Puesto */}
        <Form.Item
          name="position"
          label="Puesto"
          rules={[{ required: true, message: "Selecciona un puesto" }]}
        >
          <Select placeholder="Selecciona un puesto">
            <Option value="Mesero">Mesero</Option>
            <Option value="Gerente">Gerente</Option>
            <Option value="Barman">Barman</Option>
            <Option value="Cocinero">Cocinero</Option>
            <Option value="Lavaloza">Lavaloza</Option>
            <Option value="Ayudante de Cocina">Ayudante de Cocina</Option>
          </Select>
        </Form.Item>

        {/* Password (opcional) */}
        {/*
        <Form.Item name="password" label="Contraseña">
          <Input.Password />
        </Form.Item>
        */}
      </Form>
    </Modal>
  );
};

export default CreateEmployeeModal;
