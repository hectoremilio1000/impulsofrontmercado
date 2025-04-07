// src/pages/employee/HomeEmployee.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Typography, Spin, Alert } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import "tailwindcss/tailwind.css"; // Asegúrate de que tu proyecto cargue Tailwind

const { Title, Paragraph } = Typography;

function HomeEmployee() {
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState("");

  const motivationalPhrases = [
    "¡Hoy es un gran día para dar tu 100%!",
    "Nunca subestimes tu potencial, cada día puedes brillar más.",
    "Tus sueños no tienen límite, ¡sigue adelante con fuerza!",
    "Cada paso cuenta, ¡sigue avanzando!",
    "Eres parte fundamental del éxito de este equipo.",
  ];

  const [randomPhrase, setRandomPhrase] = useState("");

  useEffect(() => {
    // Escoger frase aleatoria
    const randomIndex = Math.floor(Math.random() * motivationalPhrases.length);
    setRandomPhrase(motivationalPhrases[randomIndex]);

    // Cargar datos de /me/employee
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token"); // o localStorage
      const apiUrl = process.env.REACT_APP_API_URL;

      const resp = await axios.get(`${apiUrl}/me/employee`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const empData = resp.data.data; // { id, name, email, ... }
      setEmployee(empData);
    } catch (err) {
      console.error("Error fetching employee =>", err);
      setError("No se pudo cargar la información del empleado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-green-300 p-4">
      {loading ? (
        <Spin tip="Cargando datos del empleado..." size="large" />
      ) : error ? (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="max-w-md w-full"
        />
      ) : !employee ? (
        <Alert
          message="Sin datos"
          description="No hay datos del empleado para mostrar."
          type="info"
          showIcon
          className="max-w-md w-full"
        />
      ) : (
        <Card className="shadow-lg max-w-md w-full">
          <div className="text-center">
            <SmileOutlined style={{ fontSize: "2rem", color: "#1890ff" }} />
            <Title level={3} className="mt-2">
              ¡Bienvenido/a, {employee.name}!
            </Title>
            <Paragraph>
              <b>Empresa:</b> {employee.company?.name || "Desconocida"}
            </Paragraph>
            <Paragraph>
              <b>Dueño/Admin de la empresa:</b>{" "}
              {employee.company?.admin?.name || "N/A"}
            </Paragraph>
            <Paragraph>
              <b>Puesto:</b>{" "}
              {employee.position?.nombre || "Sin puesto asignado"}
            </Paragraph>
            <Paragraph>
              <b>Teléfono / WhatsApp:</b> {employee.phone || "N/A"}
            </Paragraph>
            <Paragraph>
              <b>Email:</b> {employee.email || "N/A"}
            </Paragraph>
            <Paragraph className="italic text-gray-700 mt-4">
              {randomPhrase}
            </Paragraph>
          </div>
        </Card>
      )}
    </div>
  );
}

export default HomeEmployee;
