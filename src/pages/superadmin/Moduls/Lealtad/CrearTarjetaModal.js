import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Typography, message } from "antd";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

const { Text } = Typography;

export default function CrearTarjetaModal({
  programId,
  visible,
  onClose,
  onSuccess,
  ownerId, // ← viene del padre
}) {
  const { auth } = useAuth();
  const [form] = Form.useForm();
  const [ownerName, setOwnerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  /* ───────── cargar dueño ───────── */
  const fetchOwner = async () => {
    if (!ownerId) return;
    try {
      const { data } = await axios.get(`${apiUrl}/users/${ownerId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const user = data?.data ?? data;
      setOwnerName(user?.name || `User ID: ${ownerId}`);
      const firstCompany = user?.companies?.[0];
      setCompanyName(firstCompany ? firstCompany.name : "—");
    } catch (err) {
      console.error("fetchOwner =>", err);
      setOwnerName(`User ID: ${ownerId}`);
      setCompanyName("—");
    }
  };

  useEffect(() => {
    if (visible) {
      fetchOwner();
      form.resetFields();
      form.setFieldsValue({ user_id: ownerId }); // se envía oculto
    }
    // eslint-disable-next-line
  }, [visible, ownerId]);

  /* ───────── enviar ───────── */
  const handleFinish = async (values) => {
    try {
      const payload = {
        program_id: programId,
        user_id: values.user_id, // oculto
        customer_name: values.customer_name,
        is_active: true,
      };

      await axios.post(`${apiUrl}/loyalty/cards`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      message.success("Tarjeta creada correctamente");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error("handleFinish =>", err);
      message.error("Error al crear tarjeta");
    }
  };

  /* ───────── UI ───────── */
  return (
    <Modal
      title="Crear Tarjeta"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        {/* Nombre libre del cliente */}
        <Form.Item
          label="Cliente (nombre del comensal)"
          name="customer_name"
          rules={[{ required: true, message: "Ingresa el nombre del cliente" }]}
        >
          <Input />
        </Form.Item>

        {/* Dueño: solo lectura */}
        <Form.Item label="Usuario (dueño del restaurante)">
          <Text strong>{ownerName}</Text>
          <br />
          <Text type="secondary">ID: {ownerId}</Text>
          <br />

          <Text type="secondary">Empresa: {companyName}</Text>
        </Form.Item>

        {/* user_id oculto para el backend */}
        <Form.Item name="user_id" hidden>
          <Input type="hidden" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
