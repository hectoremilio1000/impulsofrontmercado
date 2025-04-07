// src/pages/administrador/ModulsAdmin/AsesoriaLegal/SolicitudLegalAdmin.jsx
import React, { useState } from "react";
import axios from "axios";
import { Form, Input, Button, message } from "antd";
import { useAuth } from "../../../../components/AuthContext";

const { TextArea } = Input;

function SolicitudLegalAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // Campos para la nueva solicitud
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  // Al enviar el formulario
  const handleSubmit = async () => {
    if (!subject || !description) {
      message.warning("Por favor, llena el asunto y la descripción");
      return;
    }

    try {
      // Construimos el objeto con los campos
      const body = {
        subject,
        description,
        // El user_id NO se envía directamente, el backend usará el del usuario logueado
        // a menos que tu backend permita/requiera mandar el user_id (ver LegalTicketsController).
      };

      const response = await axios.post(`${apiUrl}/legal-tickets`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === "success") {
        message.success("Solicitud de asesoría creada correctamente");
        // Limpiar campos
        setSubject("");
        setDescription("");
      } else {
        message.error("No se pudo crear la solicitud de asesoría legal");
      }
    } catch (error) {
      console.error("Error al crear solicitud:", error);
      message.error("Error al crear la solicitud");
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        background: "#fff",
        padding: 24,
        borderRadius: 8,
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Nueva Solicitud de Asesoría Legal
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Asunto" required>
          <Input
            placeholder="Ej: Permisos legales, etc."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Descripción detallada" required>
          <TextArea
            rows={4}
            placeholder="Describe el problema legal que necesitas consultar..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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

export default SolicitudLegalAdmin;
