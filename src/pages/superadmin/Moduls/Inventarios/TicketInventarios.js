// src/pages/InventariosForm.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Form, Input, Select, Button, message, Upload } from "antd";

const { TextArea } = Input;
const { Option } = Select;

function InventariosForm() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const isSuperadmin = auth.user?.rol?.name === "superadmin";
  const currentUserId = auth.user?.id;

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(currentUserId || null);

  // Campos del formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tipoInventario, setTipoInventario] = useState("un_producto");
  const [priority, setPriority] = useState("normal");

  // Para un archivo
  const [file, setFile] = useState(null);

  // Cargar usuarios si superadmin
  useEffect(() => {
    if (isSuperadmin) {
      axios
        .get(`${apiUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const allUsers = res.data.data || [];
          setUsers(allUsers);
          if (allUsers.length > 0) {
            setSelectedUser(allUsers[0].id);
          }
        })
        .catch((err) => {
          console.error("Error cargando usuarios:", err);
          message.error("Error cargando lista de usuarios");
        });
    }
  }, [isSuperadmin, apiUrl, token]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

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

      if (selectedUser) {
        formData.append("user_id", selectedUser);
      }

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
        // Reset
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
        Nuevo Ticket de Inventario
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        {isSuperadmin && (
          <Form.Item label="Seleccionar Usuario">
            <Select
              value={selectedUser ?? ""}
              onChange={(val) => setSelectedUser(val)}
            >
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.name} (ID: {u.id})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

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

export default InventariosForm;
