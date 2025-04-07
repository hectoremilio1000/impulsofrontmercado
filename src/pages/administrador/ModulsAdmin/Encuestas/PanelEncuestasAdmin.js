// src/pages/admin/Moduls/Encuestas/PanelEncuestasAdmin.jsx
import React, { useEffect, useRef, useState } from "react";
import { Tabs, Table, Button, message, Dropdown, Menu, Popconfirm } from "antd";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { useReactToPrint } from "react-to-print";
import { QRCodeCanvas } from "qrcode.react";
import { SurveyCardToPrint } from "./SurveyCardToPrint";

function PanelEncuestasAdmin() {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  // ID del usuario actual (admin / cliente / etc.)
  const currentUserId = auth.user?.id;

  const [activeTab, setActiveTab] = useState("1"); // '1' => Solicitudes, '2' => Encuestas

  // Solicitudes (SurveyRequests)
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Encuestas (Surveys)
  const [surveys, setSurveys] = useState([]);
  const [loadingSurveys, setLoadingSurveys] = useState(false);

  // Para imprimir (opcional)
  const [surveyToPrint, setSurveyToPrint] = useState(null);
  const contentRef = useRef(null);
  // const handlePrint = useReactToPrint({
  //   content: () => contentRef.current,
  //   documentTitle: "Encuesta",
  //   onAfterPrint: () => setSurveyToPrint(null),
  // });

  const handlePrint = useReactToPrint({
    contentRef, // La nueva forma
    documentTitle: "Encuesta",
    onAfterPrint: () => setSurveyToPrint(null),
  });

  // // Cuando se asigna surveyToPrint, disparamos la impresión
  // useEffect(() => {
  //   if (surveyToPrint) {
  //     handlePrint();
  //   }
  // }, [surveyToPrint, handlePrint]);

  // const handlePrintSurvey = (record) => {
  //   setSurveyToPrint(record);
  //   // Esperamos un ciclo para que React re-renderice el <SurveyCardToPrint> con datos
  //   setTimeout(() => {
  //     handlePrint();
  //   }, 0);
  // };

  // ===============================
  // Cargar Solicitudes
  // ===============================
  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const resp = await axios.get(`${apiUrl}/survey-requests`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setRequests(resp.data || []);
    } catch (err) {
      console.error("Error al cargar solicitudes:", err);
      message.error("No se pudo cargar las solicitudes");
    } finally {
      setLoadingRequests(false);
    }
  };

  // ===============================
  // Cargar Encuestas
  // ===============================
  const fetchSurveys = async () => {
    try {
      setLoadingSurveys(true);
      const resp = await axios.get(`${apiUrl}/surveys`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setSurveys(resp.data || []);
    } catch (err) {
      console.error("Error al cargar encuestas:", err);
      message.error("No se pudo cargar las encuestas");
    } finally {
      setLoadingSurveys(false);
    }
  };

  // Al montar
  useEffect(() => {
    fetchRequests();
    fetchSurveys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===============================
  // Filtrar en frontend (por user actual)
  // ===============================
  const filteredRequests = requests.filter(
    (req) => req.userId === currentUserId
  );
  const filteredSurveys = surveys.filter((sv) => sv.userId === currentUserId);

  // ===============================
  // Columnas Solicitudes
  // ===============================
  const requestColumns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Compañía",
      render: (_, record) => {
        return record.company ? record.company.name : "Sin empresa";
      },
    },
    {
      title: "Título",
      dataIndex: "title",
    },
    {
      title: "Estatus",
      dataIndex: "status",
      width: 100,
    },
  ];

  // ===============================
  // Imprimir Encuesta
  // ===============================
  const handlePrintSurvey = (record) => {
    setSurveyToPrint(record);
    // Poner un pequeño retardo para asegurar que React monte la data
    setTimeout(() => {
      handlePrint();
    }, 0);
  };

  // ===============================
  // Columnas Encuestas
  // (Solo un botón "Imprimir", sin editar)
  // ===============================
  const surveysColumns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Compañía",
      render: (_, record) => {
        return record.company ? record.company.name : "Sin empresa";
      },
      width: 150,
    },
    {
      title: "Título",
      dataIndex: "title",
    },
    {
      title: "Activo",
      dataIndex: "isActive",
      width: 80,
      render: (val) => (val ? "Sí" : "No"),
    },
    {
      title: "QR",
      key: "qr",
      width: 80,
      render: (record) => (
        <QRCodeCanvas
          value={`${apiUrl}/surveys/fill?code=${record.code}`}
          size={48}
        />
      ),
    },
    {
      title: "Código",
      dataIndex: "code",
      width: 120,
    },
    {
      title: "Acciones",
      key: "actions",
      width: 100,
      render: (record) => (
        <Button onClick={() => handlePrintSurvey(record)}>Imprimir</Button>
      ),
    },
  ];

  // ===============================
  // Definir los tabs con items
  // ===============================
  const tabItems = [
    {
      key: "1",
      label: "Solicitudes",
      children: (
        <Table
          dataSource={filteredRequests}
          columns={requestColumns}
          rowKey="id"
          loading={loadingRequests}
        />
      ),
    },
    {
      key: "2",
      label: "Encuestas Aceptadas",
      children: (
        <Table
          dataSource={filteredSurveys}
          columns={surveysColumns}
          rowKey="id"
          loading={loadingSurveys}
          scroll={{ x: 800 }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Panel de Encuestas (Admin)
      </h2>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      {/* Contenedor oculto para imprimir */}
      <div style={{ display: "none" }}>
        <div ref={contentRef}>
          {surveyToPrint && (
            <SurveyCardToPrint survey={surveyToPrint} apiUrl={apiUrl} />
          )}
        </div>
      </div>
    </div>
  );
}

export default PanelEncuestasAdmin;
