import React, { useEffect } from "react";
import { Modal, Form, InputNumber, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import axios from "axios";

function CoachingSessionModal({
  visible,
  onCancel,
  onSaved,
  subscriptionId,
  editSession,
}) {
  const [form] = Form.useForm();
  const apiUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    if (editSession) {
      // Setear campos en el form
      form.setFieldsValue({
        session_date: dayjs(editSession.sessionDate),
        type: editSession.type,
        hours: editSession.hours,
      });
    } else {
      form.resetFields();
    }
  }, [editSession, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        subscription_id: subscriptionId,
        session_date: values.session_date.format("YYYY-MM-DD HH:mm:ss"),
        type: values.type,
        hours: values.hours,
      };

      if (editSession) {
        // Update
        await axios.put(`${apiUrl}/coaching-sessions/${editSession.id}`, {
          // ojo: en el update solo mandas { session_date, type, hours }
          session_date: payload.session_date,
          type: payload.type,
          hours: payload.hours,
        });
        message.success("Sesión actualizada");
      } else {
        // Create
        await axios.post(`${apiUrl}/coaching-sessions`, payload);
        message.success("Sesión creada");
      }

      onSaved();
    } catch (error) {
      console.error(error);
      message.error("No se pudo guardar la sesión");
    }
  };

  return (
    <Modal
      title={editSession ? "Editar Sesión" : "Nueva Sesión"}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="session_date"
          label="Fecha y Hora"
          rules={[{ required: true, message: "Seleccione fecha/hora" }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          name="type"
          label="Tipo"
          rules={[{ required: true, message: "Seleccione tipo" }]}
        >
          <Select>
            <Select.Option value="presencial">Presencial</Select.Option>
            <Select.Option value="virtual">Virtual</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="hours"
          label="Horas"
          rules={[{ required: true, message: "Ingrese horas" }]}
        >
          <InputNumber min={0.5} step={0.5} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CoachingSessionModal;
