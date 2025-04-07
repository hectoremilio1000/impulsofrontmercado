import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Form, Input, Button, message } from "antd";

const { TextArea } = Input;

function SolicitudFinanciamientoAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // ID del Admin actual
  const userId = auth.user?.id;

  // Campos del formulario
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  // Submit
  const handleSubmit = async () => {
    if (!amount || !reason) {
      message.warning("Completa el monto y la razón del financiamiento");
      return;
    }

    try {
      // Asignar user_id al usuario actual (Admin)
      const body = {
        amount,
        reason,
        user_id: userId,
      };

      const res = await axios.post(`${apiUrl}/financing-requests`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data.status === "success") {
        message.success("Solicitud de financiamiento creada exitosamente");
        setAmount("");
        setReason("");
      } else {
        message.error("No se pudo crear la solicitud");
      }
    } catch (error) {
      console.error("Error al crear solicitud:", error);
      message.error("Error de conexión");
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        background: "#fff",
        padding: 24,
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Nueva Solicitud de Financiamiento (Admin)
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Monto Solicitado" required>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ej. 50000"
          />
        </Form.Item>

        <Form.Item label="Razón o propósito" required>
          <TextArea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="¿Para qué necesitas el financiamiento?"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Crear Solicitud
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default SolicitudFinanciamientoAdmin;
