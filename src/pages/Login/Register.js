import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Importa componentes de Ant Design
import { Form, Input, Button, message } from "antd";

export default function RegisterProspect() {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Estado para manejar el loading en el botón
  const [loading, setLoading] = useState(false);

  // Manejo del submit usando antd (values = datos del form)
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      // Llamada a tu endpoint /registerProspect
      const res = await axios.post(`${apiUrl}/registerProspect`, {
        name: values.fullName,
        email: values.email,
        password: values.password,
      });

      if (res.data.success) {
        // Mensaje de éxito
        message.success(
          "¡Cuenta creada con éxito! Redirigiendo al login...",
          4
        );
        navigate("/login");
      } else {
        message.error(
          "No se pudo crear la cuenta. " + (res.data.message || ""),
          4
        );
      }
    } catch (err) {
      message.error(
        "Error al crear prospecto: " +
          (err.response?.data?.message || "Desconocido"),
        4
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Crear Cuenta de Prueba</h2>
      {/* Form de antd con layout vertical */}
      <Form layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Nombre Completo"
          name="fullName"
          rules={[{ required: true, message: "Ingresa tu nombre completo" }]}
        >
          <Input disabled={loading} />
        </Form.Item>

        <Form.Item
          label="Correo"
          name="email"
          rules={[
            { required: true, message: "Ingresa tu correo electrónico" },
            { type: "email", message: "Correo electrónico inválido" },
          ]}
        >
          <Input disabled={loading} />
        </Form.Item>

        <Form.Item
          label="Contraseña"
          name="password"
          rules={[{ required: true, message: "Ingresa tu contraseña" }]}
        >
          <Input.Password disabled={loading} />
        </Form.Item>

        <Form.Item>
          {/* Botón de antd con loading si está en proceso */}
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-dark-purple"
          >
            Registrarme
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
