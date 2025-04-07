import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message } from "antd";
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
  const [program, setProgram] = useState(null); // datos del programa
  const apiUrl = process.env.REACT_APP_API_URL;

  console.log(auth.user_id);

  // Cargar info del programa al abrir el modal
  useEffect(() => {
    if (visible && programId) {
      fetchProgram();
      form.resetFields(); // limpiar form
    }
    // eslint-disable-next-line
  }, [visible, programId]);

  const fetchProgram = async () => {
    try {
      const res = await axios.get(`${apiUrl}/loyalty/programs/${programId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setProgram(res.data);
    } catch (err) {
      console.error("fetchProgram =>", err);
      message.error("Error al cargar el programa");
    }
  };

  // Crear la tarjeta al enviar el form
  const handleFinish = async (values) => {
    try {
      if (!program) {
        message.error("No se ha cargado el programa");
        return;
      }

      const payload = {
        program_id: program.id,
        user_id: program.userId, // <-- usamos el usuario dueño del programa
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
      </Form>
    </Modal>
  );
}
