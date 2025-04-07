import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Form, Input, Select, Button, message } from "antd";

const { TextArea } = Input;
const { Option } = Select;

function TicketsWeb() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const isSuperadmin = auth.user?.rol?.name === "superadmin";
  const currentUserId = auth.user?.id;

  // Estado local
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Para un (1) archivo
  const [singleFile, setSingleFile] = useState(null);

  // Cargar usuarios si es superadmin
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
          message.error("Error cargando la lista de usuarios");
        });
    } else {
      if (currentUserId) {
        setSelectedUser(currentUserId);
      }
    }
  }, [isSuperadmin, currentUserId, token, apiUrl]);

  // Manejador del input type="file"
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSingleFile(e.target.files[0]);
    }
  };

  // Submit final
  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      message.warning("Por favor llena Título y Descripción");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      if (selectedUser) {
        formData.append("user_id", selectedUser);
      }

      // Archivo
      if (singleFile) {
        formData.append("attachment", singleFile);
      }

      const res = await axios.post(`${apiUrl}/tickets-web`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' => Axios lo infiere
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
        Nueva Solicitud (Sistema Web)
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        {/* Usuario si superadmin */}
        {isSuperadmin && (
          <Form.Item label="Escoge el Usuario" required>
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
            Crear
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default TicketsWeb;
