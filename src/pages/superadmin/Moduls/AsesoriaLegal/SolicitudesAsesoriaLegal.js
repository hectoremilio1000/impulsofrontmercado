import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Form, Input, Select, Button, message } from "antd";

const { TextArea } = Input;
const { Option } = Select;

function SolicitudesAsesoriaLegal() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // Verificamos si el usuario es superadmin:
  const isSuperadmin = auth.user?.rol?.name === "superadmin";
  // ID del usuario logueado
  const currentUserId = auth.user?.id;

  // ESTADOS PARA LA CREACIÓN DE SOLICITUD
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // ESTADO PARA LA LISTA DE USUARIOS (solo si superadmin)
  const [users, setUsers] = useState([]);

  // CARGAR LISTA DE USUARIOS SI ES SUPERADMIN
  useEffect(() => {
    if (isSuperadmin) {
      axios
        .get(`${apiUrl}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const allUsers = res.data.data || [];
          setUsers(allUsers);
          // Seleccionamos el primero por defecto (opcional) o dejamos null
          if (allUsers.length > 0) {
            setSelectedUser(allUsers[0].id);
          }
        })
        .catch((err) => {
          console.error("Error cargando usuarios:", err);
          message.error("Error cargando la lista de usuarios");
        });
    } else {
      // Si no es superadmin, forzamos el user actual
      if (currentUserId) {
        setSelectedUser(currentUserId);
      }
    }
  }, [isSuperadmin, currentUserId, apiUrl, token]);

  // CREAR NUEVA SOLICITUD
  const handleSubmit = async () => {
    if (!subject || !description) {
      message.warning("Por favor, llena el asunto y la descripción");
      return;
    }

    try {
      // Construimos objeto con los campos
      const body = {
        subject,
        description,
      };

      // Si es superadmin y seleccionó un usuario => asignar
      if (selectedUser) {
        body.user_id = selectedUser;
      }

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
        if (!isSuperadmin) {
          setSelectedUser(currentUserId || null);
        }
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
        {/* Select de Usuario (solo si superadmin) */}
        {isSuperadmin && (
          <Form.Item label="Escoge el Usuario" required>
            <Select
              value={selectedUser ?? ""}
              onChange={(val) => setSelectedUser(val)}
            >
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.name || u.email} (ID {u.id})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

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

export default SolicitudesAsesoriaLegal;
