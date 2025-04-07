import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Form, Input, Button, message } from "antd";

const { TextArea } = Input;

function SolicitudWebAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // ID del usuario logueado (Admin)
  const currentUserId = auth.user?.id;

  // Estado local
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [singleFile, setSingleFile] = useState(null);

  /**
   * Manejador para el input de archivo
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSingleFile(e.target.files[0]);
    }
  };

  /**
   * Envía el formulario al backend
   */
  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      message.warning("Por favor llena Título y Descripción");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      // Forzamos a user_id del admin actual
      formData.append("user_id", currentUserId);

      if (singleFile) {
        formData.append("attachment", singleFile);
      }

      const res = await axios.post(`${apiUrl}/tickets-web`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status === "success") {
        message.success("Solicitud creada correctamente");
        // reset
        setTitle("");
        setDescription("");
        setSingleFile(null);
      } else {
        message.error(res.data.message || "Error al crear la solicitud");
      }
    } catch (error) {
      console.error("Error creando solicitud:", error);
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
        Nueva Solicitud (Sistema Web) - Admin
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Título" required>
          <Input
            placeholder="Ej: Cambiar tipografía"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Descripción" required>
          <TextArea
            rows={4}
            placeholder="Describe lo que deseas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Adjuntar archivo (opcional)">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.pdf"
            onChange={handleFileChange}
          />
          {singleFile && (
            <p style={{ marginTop: 8 }}>Archivo: {singleFile.name}</p>
          )}
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

export default SolicitudWebAdmin;
