// CreateCompanyModal.jsx
import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import axios from "axios";

/**
 * PROPS que recibe:
 * - visible: boolean (para mostrar/ocultar el modal)
 * - onCancel: función para cerrar modal sin hacer nada
 * - userId: a quién asignar la nueva empresa (company.user_id)
 * - token, apiUrl: para la petición axios
 * - onCompanyCreated: callback que se llama tras crear la empresa (para refrescar la lista)
 */
function CreateCompanyModal({
  visible,
  onCancel,
  userId,
  token,
  apiUrl,
  onCompanyCreated,
}) {
  // Estados internos para los campos del formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneContact, setPhoneContact] = useState("");
  const [logo, setLogo] = useState("");
  const [website, setWebsite] = useState("");

  // Evento para el botón OK => Crear Empresa
  const handleOk = async () => {
    if (!name || !email) {
      message.warning("Faltan campos obligatorios: nombre y email.");
      return;
    }
    try {
      // Armamos el body
      const body = {
        name,
        email,
        phone_contact: phoneContact,
        logo,
        website,
        user_id: userId,
      };

      // Petición a /api/companies
      const res = await axios.post(`${apiUrl}/companies`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        message.success("Empresa creada correctamente");
        // Limpiar estados
        setName("");
        setEmail("");
        setPhoneContact("");
        setLogo("");
        setWebsite("");

        // Notificar al padre para que refresque
        onCompanyCreated?.();
        // Cerrar modal
        onCancel();
      } else {
        message.error(res.data.message || "No se pudo crear la empresa");
      }
    } catch (error) {
      console.error("Error al crear empresa:", error);
      message.error("Error de servidor al crear empresa");
    }
  };

  return (
    <Modal
      title="Crear Nueva Empresa"
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Crear"
      cancelText="Cancelar"
    >
      <Form layout="vertical">
        <Form.Item label="Nombre de Empresa" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Mi Restaurante"
          />
        </Form.Item>
        <Form.Item label="Correo de Empresa" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contacto@miempresa.com"
          />
        </Form.Item>
        <Form.Item label="Teléfono de contacto">
          <Input
            value={phoneContact}
            onChange={(e) => setPhoneContact(e.target.value)}
            placeholder="Ej. 555-555-5555"
          />
        </Form.Item>
        <Form.Item label="Logo (URL)">
          <Input
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://misitio.com/logo.png"
          />
        </Form.Item>
        <Form.Item label="Sitio Web">
          <Input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://miempresa.com"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateCompanyModal;
