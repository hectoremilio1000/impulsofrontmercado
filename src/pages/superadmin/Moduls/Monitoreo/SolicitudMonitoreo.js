import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Form, Input, Select, Button, message } from "antd";

const { TextArea } = Input;
const { Option } = Select;

function SolicitudMonitoreo() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const isSuperadmin = auth.user?.rol?.name === "superadmin";
  const currentUserId = auth.user?.id;

  // Datos del form
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [cameraName, setCameraName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Un solo archivo
  const [attachmentFile, setAttachmentFile] = useState(null);

  // Listas
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);

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
          console.error("Error al cargar usuarios:", err);
          message.error("Error cargando la lista de usuarios");
        });
    } else {
      setSelectedUser(currentUserId);
    }
  }, [isSuperadmin, currentUserId, apiUrl, token]);

  const fetchCompanies = async (ownerIdParam = null) => {
    try {
      let url = `${apiUrl}/companies`;
      if (isSuperadmin && ownerIdParam) {
        url += `?ownerId=${ownerIdParam}`;
      }
      const resp = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.status === "success") {
        const list = resp.data.data || [];
        setCompanies(list);
        if (list.length > 0) {
          setSelectedCompany(list[0].id);
        } else {
          setSelectedCompany(null);
        }
      } else {
        message.error("Error al obtener empresas");
      }
    } catch (error) {
      console.error("Error al obtener empresas:", error);
      message.error("No se pudieron cargar las empresas");
    }
  };

  useEffect(() => {
    if (selectedUser) {
      if (isSuperadmin) {
        fetchCompanies(selectedUser);
      } else {
        fetchCompanies();
      }
    }
  }, [selectedUser]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachmentFile(e.target.files[0]);
    } else {
      setAttachmentFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!subject || !description) {
      message.warning("Por favor, llena el asunto y la descripción");
      return;
    }
    if (!selectedCompany) {
      message.warning("Por favor, selecciona la empresa");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("description", description);
      if (cameraName) formData.append("camera_name", cameraName);
      if (startTime) formData.append("start_time", startTime);
      if (endTime) formData.append("end_time", endTime);

      if (selectedUser) {
        formData.append("user_id", selectedUser);
      }
      formData.append("company_id", selectedCompany);

      // Aquí la clave es "attachment" (singular)
      if (attachmentFile) {
        formData.append("attachment", attachmentFile);
      } else {
        // Opcional: si quieres obligar a subir archivo
        message.warning("Por favor, selecciona un archivo");
        return;
      }

      // Llamar a la ruta de un solo archivo
      const resp = await axios.post(
        `${apiUrl}/camera-tickets/uploadSingle`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // El Content-Type lo autogestiona axios al ser FormData
          },
        }
      );

      if (resp.data.status === "success" || resp.status === 201) {
        message.success("Solicitud de monitoreo creada correctamente");
        // limpiar
        setSubject("");
        setDescription("");
        setCameraName("");
        setStartTime("");
        setEndTime("");
        setAttachmentFile(null);
      } else {
        message.error(resp.data.message || "No se pudo crear la solicitud");
      }
    } catch (error) {
      console.error("Error al crear la solicitud:", error);
      message.error("Error al crear la solicitud de monitoreo");
    }
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        background: "#fff",
        padding: 24,
        borderRadius: 8,
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Nueva Solicitud de Monitoreo (un solo archivo)
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
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

        <Form.Item label="Empresa" required>
          <Select
            placeholder="Selecciona la empresa"
            value={selectedCompany ?? ""}
            onChange={(val) => setSelectedCompany(val)}
          >
            {companies.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name} (ID {c.id})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Asunto" required>
          <Input
            placeholder="Ej: Revisar cámara de acceso principal..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Descripción detallada" required>
          <TextArea
            rows={4}
            placeholder="Describe qué deseas revisar en la grabación..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Nombre de la cámara (opcional)">
          <Input
            placeholder="Ej: Cámara 2 - Comedor"
            value={cameraName}
            onChange={(e) => setCameraName(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Fecha/Hora de inicio (opcional)">
          <Input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Fecha/Hora de fin (opcional)">
          <Input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Subir un archivo (imagen, video, etc.)">
          <input type="file" onChange={handleFileChange} />
          {attachmentFile && (
            <p style={{ marginTop: 8 }}>
              Archivo seleccionado: {attachmentFile.name}
            </p>
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

export default SolicitudMonitoreo;
