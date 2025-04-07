import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Form, Input, Button, Select, message } from "antd";

const { TextArea } = Input;
const { Option } = Select;

function SolicitudFinanciamiento() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // Verificar si el usuario es superadmin
  const isSuperadmin = auth.user?.rol?.name === "superadmin";
  const currentUserId = auth.user?.id;

  // Campos del formulario
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  // Manejo de usuario seleccionado si eres superadmin
  const [selectedUser, setSelectedUser] = useState(currentUserId);
  const [users, setUsers] = useState([]);

  // Cargar lista de usuarios si superadmin
  useEffect(() => {
    if (isSuperadmin) {
      axios
        .get(`${apiUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data && res.data.data) {
            setUsers(res.data.data);
            if (res.data.data.length > 0) {
              setSelectedUser(res.data.data[0].id);
            }
          }
        })
        .catch((err) => {
          console.error("Error cargando usuarios:", err);
          message.error("Error al cargar usuarios");
        });
    }
  }, [isSuperadmin, token, apiUrl]);

  const handleSubmit = async () => {
    if (!amount || !reason) {
      message.warning("Completa el monto y la razón del financiamiento");
      return;
    }

    try {
      const body = {
        amount,
        reason,
      };
      // Si superadmin => asignar user_id
      if (isSuperadmin && selectedUser) {
        body.user_id = selectedUser;
      }

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
        Nueva Solicitud de Financiamiento
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        {/* Si superadmin, mostrar dropdown de usuarios */}
        {isSuperadmin && (
          <Form.Item label="Selecciona Usuario">
            <Select
              value={selectedUser}
              onChange={(val) => setSelectedUser(val)}
              style={{ width: "100%" }}
            >
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.name || u.email} (ID {u.id})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

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

export default SolicitudFinanciamiento;
