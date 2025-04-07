import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Input, Button, message, Select } from "antd";
import { useAuth } from "../../../../components/AuthContext";

const { TextArea } = Input;
const { Option } = Select;

function SolicitudMonitoreoAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // ID del admin logueado
  const currentUserId = auth.user?.id;

  // Campos del formulario
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [cameraName, setCameraName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Para manejar el archivo adjunto (un solo archivo)
  const [attachmentFile, setAttachmentFile] = useState(null);

  // === Manejo de empresas (que el admin pueda escoger) ===
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  /**
   * 1. Al montar el componente, cargar las empresas disponibles
   *    para este admin. Puede que tu backend devuelva solo las
   *    empresas asociadas al usuario, o todas las que existen
   *    si tu admin ve todo.
   */
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const resp = await axios.get(`${apiUrl}/companies`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (resp.data.status === "success") {
          const list = resp.data.data || [];
          setCompanies(list);
          if (list.length > 0) {
            setSelectedCompany(list[0].id);
          }
        } else {
          message.error("No se pudieron cargar las empresas");
        }
      } catch (error) {
        console.error("Error cargando empresas:", error);
        message.error("Error al cargar la lista de empresas");
      }
    }
    fetchCompanies();
  }, [apiUrl, token]);

  /**
   * 2. Capturar el archivo desde <input type="file" />
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachmentFile(e.target.files[0]);
    } else {
      setAttachmentFile(null);
    }
  };

  /**
   * 3. Enviar el formulario => POST /camera-tickets/uploadSingle
   */
  const handleSubmit = async () => {
    // Validar campos mínimos
    if (!subject || !description) {
      message.warning("Faltan campos obligatorios: Asunto y Descripción");
      return;
    }
    if (!selectedCompany) {
      message.warning("Debes seleccionar la empresa");
      return;
    }
    if (!attachmentFile) {
      message.warning("Por favor, selecciona un archivo para adjuntar");
      return;
    }

    try {
      const formData = new FormData();
      // Campos obligatorios
      formData.append("subject", subject);
      formData.append("description", description);

      // Opcionales
      if (cameraName) formData.append("camera_name", cameraName);
      if (startTime) formData.append("start_time", startTime);
      if (endTime) formData.append("end_time", endTime);

      // user_id => ID del admin
      formData.append("user_id", currentUserId);
      // company_id => la empresa que seleccionó
      formData.append("company_id", selectedCompany);

      // Archivo adjunto
      formData.append("attachment", attachmentFile);

      // Llamada al endpoint
      const url = `${apiUrl}/camera-tickets/uploadSingle`;
      const res = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 201 || res.data.status === "success") {
        message.success("Solicitud de Monitoreo creada exitosamente");
        // Resetear campos
        setSubject("");
        setDescription("");
        setCameraName("");
        setStartTime("");
        setEndTime("");
        setAttachmentFile(null);
        setSelectedCompany(companies.length > 0 ? companies[0].id : null);
      } else {
        message.error(res.data.message || "Error al crear el ticket");
      }
    } catch (error) {
      console.error("Error creando ticket de Monitoreo:", error);
      message.error("Ocurrió un error al crear la solicitud de Monitoreo");
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
        Nueva Solicitud de Monitoreo (Admin)
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        {/* Seleccionar la empresa */}
        <Form.Item label="Empresa" required>
          <Select
            placeholder="Selecciona la empresa"
            value={selectedCompany ?? ""}
            onChange={(val) => setSelectedCompany(val)}
            style={{ width: "100%" }}
          >
            {companies.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name} (ID {c.id})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Asunto */}
        <Form.Item label="Asunto" required>
          <Input
            placeholder="Ej: Revisar cámara de acceso principal..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </Form.Item>

        {/* Descripción */}
        <Form.Item label="Descripción detallada" required>
          <TextArea
            rows={4}
            placeholder="Describe qué deseas revisar en la grabación..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>

        {/* Nombre de la cámara (opcional) */}
        <Form.Item label="Nombre de la cámara (opcional)">
          <Input
            placeholder="Ej: Cámara 2 - Comedor"
            value={cameraName}
            onChange={(e) => setCameraName(e.target.value)}
          />
        </Form.Item>

        {/* Fecha/Hora de inicio (opcional) */}
        <Form.Item label="Fecha/Hora de inicio (opcional)">
          <Input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </Form.Item>

        {/* Fecha/Hora de fin (opcional) */}
        <Form.Item label="Fecha/Hora de fin (opcional)">
          <Input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </Form.Item>

        {/* Archivo adjunto */}
        <Form.Item label="Subir un archivo (imagen, video, etc.)" required>
          <input type="file" onChange={handleFileChange} />
          {attachmentFile && (
            <p style={{ marginTop: 8 }}>
              Archivo seleccionado: {attachmentFile.name}
            </p>
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

export default SolicitudMonitoreoAdmin;
