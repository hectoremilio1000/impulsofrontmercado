import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Input, Select, Button, message, InputNumber } from "antd";
import { useAuth } from "../../../../components/AuthContext";

const { TextArea } = Input;
const { Option } = Select;

function TicketsMarketing() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // ¿Es superadmin?
  const isSuperadmin = auth.user?.rol?.name === "superadmin";
  const currentUserId = auth.user?.id;

  // Lista de usuarios (sólo si superadmin)
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Campos del formulario
  const [campaignType, setCampaignType] = useState("Google");
  const [objective, setObjective] = useState("");
  const [budget, setBudget] = useState(0);

  // Estado para un solo archivo (adjunto)
  const [attachmentFile, setAttachmentFile] = useState(null);

  // Cargar usuarios si eres superadmin
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
            setSelectedUserId(allUsers[0].id);
          }
        })
        .catch((err) => {
          console.error("Error cargando usuarios:", err);
          message.error("No se pudo cargar la lista de usuarios");
        });
    } else {
      setSelectedUserId(currentUserId);
    }
  }, [isSuperadmin, currentUserId, token, apiUrl]);

  /**
   * Manejador para capturar el archivo desde <input type="file" />
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachmentFile(e.target.files[0]);
    }
  };

  /**
   * Envía el formulario al backend
   */
  const handleSubmit = async () => {
    // Validaciones mínimas
    if (!campaignType || !objective) {
      message.warning("Faltan campos: campaign_type, objective");
      return;
    }

    if (!attachmentFile) {
      message.warning("Por favor selecciona un archivo para adjuntar");
      return;
    }

    try {
      // Construir FormData
      const formData = new FormData();
      formData.append("campaign_type", campaignType);
      formData.append("objective", objective);
      formData.append("budget", budget.toString());

      if (selectedUserId) {
        formData.append("user_id", selectedUserId);
      }

      // Adjuntar el archivo (campo "attachment")
      formData.append("attachment", attachmentFile);

      // Debug opcional
      // for (const pair of formData.entries()) {
      //   console.log("FormData =>", pair[0], pair[1]);
      // }

      // Llamada a la ruta que maneja un solo archivo
      const url = `${apiUrl}/marketing-tickets/uploadSingle`;
      const res = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // No fijar Content-Type manualmente; Axios lo hace automáticamente
        },
      });

      if (res.data.status === "success") {
        message.success("Ticket de marketing creado con 1 adjunto");
        // Reset del formulario
        setCampaignType("Google");
        setObjective("");
        setBudget(0);
        setAttachmentFile(null);
      } else {
        message.error(res.data.message || "Error al crear el ticket");
      }
    } catch (error) {
      console.error("Error creando ticket de marketing:", error);
      message.error("Ocurrió un error al crear el ticket");
    }
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        background: "#fff",
        padding: 24,
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Nuevo Ticket de Marketing (un solo archivo)
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        {/* Si eres superadmin, selector de usuario */}
        {isSuperadmin && (
          <Form.Item label="Selecciona Usuario/Restaurantero">
            <Select
              value={selectedUserId}
              onChange={(val) => setSelectedUserId(val)}
              style={{ width: "100%" }}
            >
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.name} (ID: {u.id})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* Tipo de Campaña */}
        <Form.Item label="Tipo de Campaña" required>
          <Select
            value={campaignType}
            onChange={(val) => setCampaignType(val)}
            style={{ width: "100%" }}
          >
            <Option value="Google">Google</Option>
            <Option value="TikTok">TikTok</Option>
            <Option value="Meta">Meta (Facebook/Instagram)</Option>
            <Option value="Otro">Otro</Option>
          </Select>
        </Form.Item>

        {/* Objetivo */}
        <Form.Item label="Objetivo de la Campaña" required>
          <TextArea
            rows={4}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Describe el objetivo o metas de la campaña..."
          />
        </Form.Item>

        {/* Presupuesto */}
        <Form.Item label="Presupuesto (MXN)" required>
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            value={budget}
            onChange={(val) => setBudget(val)}
          />
        </Form.Item>

        {/* Archivo adjunto */}
        <Form.Item label="Adjuntar un archivo (imagen, video, etc.)" required>
          <input type="file" onChange={handleFileChange} />
          {attachmentFile && (
            <p style={{ marginTop: 8 }}>Archivo: {attachmentFile.name}</p>
          )}
        </Form.Item>

        {/* Botón */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Crear Ticket
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default TicketsMarketing;
