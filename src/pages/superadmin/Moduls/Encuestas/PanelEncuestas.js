// file: PanelEncuestas.jsx
import React, { useEffect, useRef, useState } from "react";
import { Tabs, Table, Button, message, Dropdown, Menu, Popconfirm } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../components/AuthContext";
import { useReactToPrint } from "react-to-print";
import { SurveyCardToPrint } from "./SurveyCardToPrint";
import { QRCodeCanvas } from "qrcode.react";

const { TabPane } = Tabs;

export default function PanelEncuestas() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Tabs
  const [activeTab, setActiveTab] = useState("1");

  // Solicitudes
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Encuestas
  const [surveys, setSurveys] = useState([]);
  const [loadingSurveys, setLoadingSurveys] = useState(false);

  // Para imprimir
  const [surveyToPrint, setSurveyToPrint] = useState(null);
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Encuesta",
    onAfterPrint: () => setSurveyToPrint(null),
  });
  useEffect(() => {
    if (surveyToPrint) {
      handlePrint();
    }
  }, [surveyToPrint, handlePrint]);

  // ======== Cargar Solicitudes ========
  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const resp = await axios.get(`${apiUrl}/survey-requests`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setRequests(resp.data || []);
    } catch (err) {
      console.error("fetchRequests =>", err);
      message.error("No se pudo cargar las solicitudes");
    } finally {
      setLoadingRequests(false);
    }
  };

  // ======== Cargar Encuestas ========
  const fetchSurveys = async () => {
    try {
      setLoadingSurveys(true);
      const resp = await axios.get(`${apiUrl}/surveys`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setSurveys(resp.data || []);
    } catch (err) {
      console.error("fetchSurveys =>", err);
      message.error("No se pudo cargar las encuestas");
    } finally {
      setLoadingSurveys(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchSurveys();
    // eslint-disable-next-line
  }, []);

  // ======== Eliminar Solicitud ========
  const deleteRequest = async (id) => {
    try {
      await axios.delete(`${apiUrl}/survey-requests/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      message.success("Solicitud eliminada");
      fetchRequests();
    } catch (err) {
      console.error("deleteRequest =>", err);
      message.error("No se pudo eliminar");
    }
  };

  // Navegar a editar solicitud
  const handleEditRequest = (id) => {
    // Nuevo path: "/solicitudes/edit/:id"
    navigate(`/solicitudes/edit/${id}`);
  };

  // ======== Columnas Solicitudes ========
  const requestColumns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Usuario",
      render: (_, record) => (record.user ? record.user.name : record.userId),
    },
    {
      title: "Compañía",
      // En lugar de dataIndex, usa render para acceder a 'record'
      render: (_, record) => {
        // record.company existe si hiciste preload('company')
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
    {
      title: "Acciones",
      width: 100,
      render: (record) => {
        const menu = (
          <Menu>
            <Menu.Item key="edit" onClick={() => handleEditRequest(record.id)}>
              Editar
            </Menu.Item>
            <Menu.Item key="delete">
              <Popconfirm
                title="¿Eliminar esta solicitud?"
                onConfirm={() => deleteRequest(record.id)}
              >
                Eliminar
              </Popconfirm>
            </Menu.Item>
          </Menu>
        );
        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // ======== Columnas Encuestas ========
  const handleEditSurvey = (id) => {
    navigate(`/panelencuesta/edit-survey/${id}`);
  };
  const surveysColumns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Usuario",
      key: "user",
      render: (_, record) =>
        record.user ? `${record.user.name} (ID: ${record.user.id})` : "N/A",
    },
    {
      title: "Compañía",
      // En lugar de dataIndex, usa render para acceder a 'record'
      render: (_, record) => {
        // record.company existe si hiciste preload('company')
        return record.company ? record.company.name : "Sin empresa";
      },
    },
    {
      title: "Título Encuesta",
      dataIndex: "title",
    },
    {
      title: "Activo",
      dataIndex: "isActive",
      width: 80,
      render: (val) => (val ? "Sí" : "No"),
    },
    {
      title: "Código",
      dataIndex: "code",
      width: 120,
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
      title: "Acciones",
      key: "actions",
      width: 100,
      render: (record) => {
        const menu = (
          <Menu>
            <Menu.Item key="edit" onClick={() => handleEditSurvey(record.id)}>
              Editar
            </Menu.Item>
            <Menu.Item key="print" onClick={() => setSurveyToPrint(record)}>
              Imprimir
            </Menu.Item>
          </Menu>
        );
        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Panel de Encuestas
      </h2>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* SOLO 2 Pestañas: Solicitudes y Encuestas */}
        <TabPane tab="Solicitudes" key="1">
          <Table
            dataSource={requests}
            columns={requestColumns}
            rowKey="id"
            loading={loadingRequests}
          />
        </TabPane>

        <TabPane tab="Encuestas" key="2">
          <Table
            dataSource={surveys}
            columns={surveysColumns}
            rowKey="id"
            loading={loadingSurveys}
            scroll={{ x: 800 }}
          />
        </TabPane>
      </Tabs>

      {/* Contenedor para imprimir */}
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
