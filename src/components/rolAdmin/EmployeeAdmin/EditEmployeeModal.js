// src/components/employees/EditEmployeeModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, message } from "antd";
import axios from "axios";
import { useAuth } from "../../AuthContext";

const EditEmployeeModal = ({
  visible,
  onCancel,
  onSuccess,
  employeeData, // objeto con { id, name, email, phone, companyId, ... }
}) => {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employeeData) {
      // Inicializa los valores del formulario
      form.setFieldsValue({
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone, // <-- Campo para WhatsApp/Phone
      });
    }
  }, [employeeData, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("[EditEmployeeModal] => values =>", values);
      setLoading(true);

      // PUT /companies/:companyId/employees/:employeeId
      await axios.put(
        `${apiUrl}/companies/${employeeData.companyId}/employees/${employeeData.id}`,
        {
          name: values.name,
          email: values.email,
          phone: values.phone, // <--- Añadimos "phone"
        },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      message.success("Empleado actualizado");
      onSuccess(); // Notifica que se guardó
    } catch (error) {
      console.error("[EditEmployeeModal] Error update =>", error);
      message.error("No se pudo editar el empleado");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  if (!employeeData) return null;

  return (
    <Modal
      title="Editar Empleado"
      visible={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleOk}>
          Guardar
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true, message: "Ingresa el nombre" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Correo"
          rules={[
            { required: true, message: "Ingresa el email" },
            { type: "email", message: "El email no es válido" },
          ]}
        >
          <Input />
        </Form.Item>

        {/* Campo de WhatsApp / Teléfono */}
        <Form.Item name="phone" label="WhatsApp" rules={[{ required: false }]}>
          <Input placeholder="5512345678" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditEmployeeModal;
