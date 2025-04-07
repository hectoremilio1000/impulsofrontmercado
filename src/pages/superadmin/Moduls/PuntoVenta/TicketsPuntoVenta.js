// file: TicketsPuntoVenta.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Input, Select, Button, message } from "antd";
import { useAuth } from "../../../../components/AuthContext";

const { TextArea } = Input;
const { Option } = Select;

function TicketsPuntoVenta() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // ¿Es superadmin?
  const isSuperadmin = auth.user?.rol?.name === "superadmin";
  const currentUserId = auth.user?.id;

  // Lista de usuarios (si superadmin)
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Campos
  const [tituloProblema, setTituloProblema] = useState("");
  const [descripcionProblema, setDescripcionProblema] = useState("");
  const [urgencia, setUrgencia] = useState("baja");
  const [whatsapp, setWhatsapp] = useState("");

  // Foto (un solo archivo)
  const [fotoFile, setFotoFile] = useState(null);

  useEffect(() => {
    if (isSuperadmin) {
      axios
        .get(`${apiUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.data) {
            setUsers(res.data.data);
            if (res.data.data.length > 0) {
              setSelectedUserId(res.data.data[0].id);
            }
          }
        })
        .catch((err) => {
          console.error("Error al cargar usuarios:", err);
          message.error("No se pudo cargar la lista de usuarios");
        });
    } else {
      setSelectedUserId(currentUserId);
    }
  }, [isSuperadmin, currentUserId, apiUrl, token]);

  // Manejador de archivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFotoFile(e.target.files[0]);
    }
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!tituloProblema || !descripcionProblema) {
      message.warning("Por favor llena Título y Descripción");
      return;
    }

    // Creamos formData
    const formData = new FormData();
    formData.append("titulo_problema", tituloProblema);
    formData.append("descripcion_problema", descripcionProblema);
    formData.append("urgencia", urgencia);
    formData.append("whatsapp", whatsapp);

    if (selectedUserId) {
      formData.append("user_id", selectedUserId);
    }

    if (fotoFile) {
      formData.append("foto", fotoFile);
    }

    try {
      const url = `${apiUrl}/punto-venta-tickets/uploadSingle`;
      const res = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // No fijar manualmente 'Content-Type'
        },
      });

      if (res.data.status === "success") {
        message.success("Ticket de Punto de Venta creado");
        // Resetear
        setTituloProblema("");
        setDescripcionProblema("");
        setUrgencia("baja");
        setWhatsapp("");
        setFotoFile(null);
      } else {
        message.error(res.data.message || "Error al crear ticket");
      }
    } catch (error) {
      console.error("Error creando ticket de punto de venta:", error);
      message.error("Error de servidor al crear ticket");
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
        Nuevo Ticket de Punto de Venta
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        {isSuperadmin && (
          <Form.Item label="Selecciona Usuario/Restaurantero">
            <Select
              style={{ width: "100%" }}
              value={selectedUserId}
              onChange={(val) => setSelectedUserId(val)}
            >
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.name} (ID: {u.id})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item label="Título del Problema" required>
          <Input
            value={tituloProblema}
            onChange={(e) => setTituloProblema(e.target.value)}
            placeholder="Ej. No funciona el escáner"
          />
        </Form.Item>

        <Form.Item label="Descripción del Problema" required>
          <TextArea
            rows={4}
            value={descripcionProblema}
            onChange={(e) => setDescripcionProblema(e.target.value)}
            placeholder="Describe lo que ocurre con el punto de venta..."
          />
        </Form.Item>

        <Form.Item label="Urgencia" required>
          <Select value={urgencia} onChange={(val) => setUrgencia(val)}>
            <Option value="baja">Baja</Option>
            <Option value="media">Media</Option>
            <Option value="alta">Alta</Option>
          </Select>
        </Form.Item>

        <Form.Item label="WhatsApp (para contacto inmediato)">
          <Input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Ej. 5512345678"
          />
        </Form.Item>

        <Form.Item label="Foto del Problema (opcional)">
          <input type="file" onChange={handleFileChange} />
          {fotoFile && <p style={{ marginTop: 8 }}>Archivo: {fotoFile.name}</p>}
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

export default TicketsPuntoVenta;
