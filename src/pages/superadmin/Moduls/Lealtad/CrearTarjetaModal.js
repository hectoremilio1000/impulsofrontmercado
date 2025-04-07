import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

export default function CrearTarjetaModal({
  programId,
  visible,
  onClose,
  onSuccess,
}) {
  const { auth } = useAuth();
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]); // lista de usuarios para el <Select>
  const apiUrl = process.env.REACT_APP_API_URL;

  // Cargar lista de usuarios al abrir
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error("fetchUsers =>", err);
      message.error("Error al cargar usuarios");
    }
  };

  useEffect(() => {
    if (visible) {
      fetchUsers();
      form.resetFields(); // limpia el formulario
    }
    // eslint-disable-next-line
  }, [visible]);

  // Crear la tarjeta al enviar el form
  const handleFinish = async (values) => {
    try {
      const payload = {
        program_id: programId,
        user_id: values.user_id, // <--- dueños (ID de user)
        customer_name: values.customer_name,
        is_active: true,
      };

      // POST /loyalty/cards
      await axios.post(`${apiUrl}/loyalty/cards`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      message.success("Tarjeta creada correctamente");
      form.resetFields();
      if (onSuccess) onSuccess(); // avisa al padre que se creó la tarjeta
      if (onClose) onClose(); // cierra el modal
    } catch (err) {
      console.error("handleFinish =>", err);
      message.error("Error al crear tarjeta");
    }
  };

  return (
    <Modal
      title="Crear Tarjeta"
      visible={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <Form.Item
          label="Cliente (nombre libre)"
          name="customer_name"
          rules={[{ required: true, message: "Ingresa el nombre del cliente" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Usuario (dueño de la tarjeta)"
          name="user_id"
          rules={[{ required: true, message: "Elige el usuario dueño" }]}
        >
          <Select placeholder="Selecciona un usuario">
            {users.map((u) => (
              <Select.Option key={u.id} value={u.id}>
                {u.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
