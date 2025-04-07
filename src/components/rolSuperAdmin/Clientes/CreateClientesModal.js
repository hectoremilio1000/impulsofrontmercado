// file: src/components/user/CreateUserModal.jsx
import React, { useState } from "react";
import { Modal, Input, Button, message } from "antd";
import { FaCopy, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import dayjs from "dayjs";

import { generateRandomUuid } from "../../../utils/generateRandomUuid";
import { useAuth } from "../../AuthContext";

const CreateUserModal = ({ visible, onCancel, onSuccess }) => {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  // Form data: rol_id fijo en 2 (Administrador)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "12345678",
    rol_id: 2,
    whatsapp: "",
  });

  const handleChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const copiarCredentials = (field) => {
    navigator.clipboard.writeText(formData[field] || "");
    message.success("Copiado al portapapeles");
  };

  const createUsuario = async () => {
    if (!formData.email) {
      message.error("El email es requerido");
      return;
    }
    setLoading(true);
    try {
      const newData = { ...formData };
      newData.fecha_created = dayjs().format("YYYY-MM-DD HH:mm:ss");
      newData.uuid = generateRandomUuid(5);

      // POST /api/newuser
      const resp = await axios.post(`${apiUrl}/newuser`, newData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      // Validación de la respuesta del backend
      if (resp.data.status === "success" && resp.data.code === 201) {
        // Devuelve la data del nuevo usuario
        const newUserId = resp.data.data.id;
        const newUserName = resp.data.data.name; // <-- su nombre en la respuesta
        // Pasamos ambos al padre
        onSuccess(newUserId, newUserName);
      } else {
        message.error(resp.data.message || "Error al crear usuario");
      }
    } catch (error) {
      console.error(error);
      message.error("Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Crear Usuario (Administrador)"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <div className="grid gap-3">
        <div>
          <label>Nombre Completo</label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nombre(s) y apellidos"
          />
        </div>
        <div>
          <label>Whatsapp</label>
          <Input
            value={formData.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            placeholder="e.g. 5523273811"
          />
        </div>
        <div>
          <label>Email</label>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="usuario@gmail.com"
            />
            <Button onClick={() => copiarCredentials("email")}>
              <FaCopy />
            </Button>
          </div>
        </div>
        <div>
          <label>Password</label>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              type={openPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            <Button onClick={() => setOpenPassword(!openPassword)}>
              {openPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
            <Button onClick={() => copiarCredentials("password")}>
              <FaCopy />
            </Button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Cancelar
        </Button>
        <Button type="primary" onClick={createUsuario} loading={loading}>
          Crear
        </Button>
      </div>
    </Modal>
  );
};

export default CreateUserModal;
