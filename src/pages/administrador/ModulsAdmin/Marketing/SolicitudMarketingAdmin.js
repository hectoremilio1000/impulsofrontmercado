import React, { useState } from "react";
import axios from "axios";
import { Form, Input, InputNumber, Button, message } from "antd";
import { useAuth } from "../../../../components/AuthContext";

const { TextArea } = Input;

function SolicitudMarketingAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // ID del Admin logueado
  const currentUserId = auth.user?.id;

  // Campos del formulario
  const [campaignType, setCampaignType] = useState("Google");
  const [objective, setObjective] = useState("");
  const [budget, setBudget] = useState(0);

  // Para manejar el archivo adjunto
  const [attachmentFile, setAttachmentFile] = useState(null);

  /**
   * Capturamos el archivo con <input type="file" />
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachmentFile(e.target.files[0]);
    }
  };

  /**
   * Envía el formulario al backend: POST /marketing-tickets/uploadSingle
   */
  const handleSubmit = async () => {
    // Validar campos mínimos
    if (!campaignType || !objective) {
      message.warning("Faltan campos: Tipo de campaña, Objetivo");
      return;
    }
    if (!attachmentFile) {
      message.warning("Por favor selecciona un archivo para adjuntar");
      return;
    }

    try {
      const formData = new FormData();
      // Campos
      formData.append("campaign_type", campaignType);
      formData.append("objective", objective);
      formData.append("budget", budget.toString());
      // Forzamos user_id = actual admin
      formData.append("user_id", currentUserId);

      // Archivo
      formData.append("attachment", attachmentFile);

      const url = `${apiUrl}/marketing-tickets/uploadSingle`;
      const res = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Sin "Content-Type"; Axios lo maneja
        },
      });

      if (res.data.status === "success") {
        message.success("Ticket de marketing creado exitosamente");
        // Reset form
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
        Nueva Solicitud de Marketing (Admin)
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        {/* Tipo de Campaña */}
        <Form.Item label="Tipo de Campaña" required>
          <select
            value={campaignType}
            onChange={(e) => setCampaignType(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="Google">Google</option>
            <option value="TikTok">TikTok</option>
            <option value="Meta">Meta (Facebook/Instagram)</option>
            <option value="Otro">Otro</option>
          </select>
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
            <p style={{ marginTop: 8 }}>
              Archivo seleccionado: {attachmentFile.name}
            </p>
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Crear Ticket
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default SolicitudMarketingAdmin;
