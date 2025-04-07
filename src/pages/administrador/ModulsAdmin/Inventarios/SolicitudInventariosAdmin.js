import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Form, Input, Select, Button, message } from "antd";

const { TextArea } = Input;
const { Option } = Select;

function SolicitudInventariosAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // ID del usuario actual (Admin)
  const currentUserId = auth.user?.id;

  // Campos del formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tipoInventario, setTipoInventario] = useState("un_producto");
  const [priority, setPriority] = useState("normal");

  // Manejo de un archivo (opcional)
  const [file, setFile] = useState(null);

  // Capturar archivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!title.trim()) {
      message.warning("Falta el título");
      return;
    }

    if (!tipoInventario) {
      message.warning("Selecciona el tipo de inventario");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tipo_inventario", tipoInventario);
      formData.append("priority", priority);

      // Forzamos user_id al Admin actual
      formData.append("user_id", currentUserId);

      if (file) {
        formData.append("attachment", file);
      }

      const res = await axios.post(`${apiUrl}/inventarios`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status === "success") {
        message.success("Ticket de inventario creado");
        // Limpiar campos
        setTitle("");
        setDescription("");
        setTipoInventario("un_producto");
        setPriority("normal");
        setFile(null);
      } else {
        message.error(res.data.message || "Error al crear inventario");
      }
    } catch (error) {
      console.error("Error al crear inventario:", error);
      message.error("Error de servidor al crear inventario");
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
        Nuevo Ticket de Inventario (Admin)
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Título" required>
          <Input
            placeholder="Ej: Inventario Semanal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="¿Qué inventario quieres hacer?" required>
          <Select
            value={tipoInventario}
            onChange={(val) => setTipoInventario(val)}
          >
            <Option value="un_producto">Un producto en especial</Option>
            <Option value="varios">Varios productos</Option>
            <Option value="todos">Todos</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Descripción (opcional)">
          <TextArea
            rows={4}
            placeholder="Detalle adicional..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Prioridad" required>
          <Select value={priority} onChange={(val) => setPriority(val)}>
            <Option value="baja">Baja</Option>
            <Option value="normal">Normal</Option>
            <Option value="alta">Alta</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Adjuntar archivo (opcional)">
          <input type="file" onChange={handleFileChange} />
          {file && <p style={{ marginTop: 8 }}>Archivo: {file.name}</p>}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Crear
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default SolicitudInventariosAdmin;
