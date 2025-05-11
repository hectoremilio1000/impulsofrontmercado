// src/pages/superadmin/Moduls/Lealtad/PanelLealtad.jsx
import React, { useEffect, useState } from "react";
import { Tabs, Table, Button, message, Popconfirm, Dropdown, Menu } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../components/AuthContext";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Configura dayjs a español

import TarjetasList from "./TarjetasList";

import CrearTarjetaModal from "./CrearTarjetaModal";
dayjs.locale("es"); // Importamos el modal

const { TabPane } = Tabs;

export default function PanelLealtad() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  // States
  const [requests, setRequests] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [selectedProgramId, setSelectedProgramId] = useState(null);

  // Estado para el modal "Crear Tarjeta"
  const [createCardModal, setCreateCardModal] = useState({
    visible: false,
    programId: null,
    ownerId: null,
  });

  const apiUrl = process.env.REACT_APP_API_URL;

  // 1. Cargar solicitudes
  const fetchRequests = async () => {
    console.log("=== fetchRequests() called ===");
    try {
      setLoadingRequests(true);
      const res = await axios.get(`${apiUrl}/loyalty/requests`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      console.log("fetchRequests => res.data =>", res.data);
      setRequests(res.data);
    } catch (error) {
      console.error("fetchRequests => ERROR =>", error);
      message.error("Error al cargar solicitudes");
    } finally {
      setLoadingRequests(false);
    }
  };

  // 2. Cargar programas
  const fetchPrograms = async () => {
    console.log("=== fetchPrograms() called ===");
    try {
      setLoadingPrograms(true);
      const res = await axios.get(`${apiUrl}/loyalty/programs`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      console.log("fetchPrograms => res.data =>", res.data);
      setPrograms(res.data);
    } catch (error) {
      console.error("fetchPrograms => ERROR =>", error);
      message.error("Error al cargar programas");
    } finally {
      setLoadingPrograms(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aprobar solicitud
  const approveRequest = async (id) => {
    console.log("=== approveRequest() => ID:", id);
    try {
      await axios.post(
        `${apiUrl}/loyalty/requests/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      message.success("Solicitud aprobada");
      fetchRequests();
      fetchPrograms();
    } catch (err) {
      console.error("approveRequest => ERROR =>", err);
      message.error("Error al aprobar solicitud");
    }
  };

  // Rechazar solicitud
  const rejectRequest = async (id) => {
    console.log("=== rejectRequest() => ID:", id);
    try {
      await axios.post(
        `${apiUrl}/loyalty/requests/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      message.success("Solicitud rechazada");
      fetchRequests();
    } catch (err) {
      console.error("rejectRequest => ERROR =>", err);
      message.error("Error al rechazar solicitud");
    }
  };

  // Eliminar programa
  const deleteProgram = async (id) => {
    console.log("=== deleteProgram() => ID:", id);
    try {
      await axios.delete(`${apiUrl}/loyalty/programs/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      message.success("Programa eliminado");
      fetchPrograms();
    } catch (err) {
      console.error("deleteProgram => ERROR =>", err);
      message.error("Error al eliminar programa");
    }
  };

  // Editar solicitud
  const handleEditRequest = (id) => {
    navigate(`/panellealtad/edit-request/${id}`);
  };

  // Editar programa
  const handleEditProgram = (id) => {
    navigate(`/panellealtad/edit-program/${id}`);
  };

  // Mapeos
  const mapProgramType = {
    visits: "Visitas",
    products: "Productos",
  };
  const mapStatus = {
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
  };

  // ==============================
  // Tabla de Solicitudes
  // ==============================
  const requestColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 50,
    },
    {
      title: "Usuario",
      key: "userName",
      render: (_, record) => {
        // Muestra record.user.name si existe, sino "User ID: X"
        return record.user ? record.user.name : `User ID: ${record.userId}`;
      },
    },
    {
      title: "Tipo",
      dataIndex: "programType", // camelCase (p.ej. "visits")
      key: "programType",
      width: 90,
      render: (val) => mapProgramType[val] || val,
    },
    {
      title: "Requerido",
      key: "required",
      render: (_, record) => {
        const { programType, requiredVisits, requiredProducts } = record;
        return programType === "visits" ? requiredVisits : requiredProducts;
      },
    },
    {
      title: "Descripción Premio",
      dataIndex: "rewardDescription", // camelCase
      key: "rewardDescription",
      width: 150,
    },
    {
      title: "Notas",
      dataIndex: "notes",
      key: "notes",
      width: 120,
    },
    {
      title: "Estatus",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (val) => mapStatus[val] || val,
    },
    {
      title: "Creado en",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Actualizado en",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 120,
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item key="edit" onClick={() => handleEditRequest(record.id)}>
              Editar
            </Menu.Item>
            {record.status === "pending" && (
              <Menu.Item
                key="approve"
                onClick={() => approveRequest(record.id)}
              >
                Aprobar
              </Menu.Item>
            )}
            {record.status === "pending" && (
              <Menu.Item key="reject" onClick={() => rejectRequest(record.id)}>
                Rechazar
              </Menu.Item>
            )}
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

  // ==============================
  // Tabla de Programas
  // ==============================
  const programColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Dueño",
      key: "owner",
      width: 100,
      // Muestra owner.name si existe, si no "User ID: X"
      render: (_, record) => {
        return record.owner ? record.owner.name : `User ID: ${record.userId}`;
      },
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Tipo",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (val) => mapProgramType[val] || val,
    },
    {
      title: "Req. Visitas",
      dataIndex: "requiredVisits", // tu JSON dice "requiredVisits" en camelCase
      key: "requiredVisits",
      width: 100,
    },
    {
      title: "Req. Productos",
      dataIndex: "requiredProducts", // tu JSON dice "requiredProducts"
      key: "requiredProducts",
      width: 100,
    },
    {
      title: "Descripción",
      dataIndex: "rewardDescription", // "rewardDescription"
      key: "rewardDescription",
    },
    {
      title: "Activo",
      dataIndex: "isActive", // "isActive"
      key: "isActive",
      render: (val) => (val ? "Sí" : "No"),
      width: 80,
    },
    {
      title: "Creado en",
      dataIndex: "createdAt", // "createdAt"
      key: "createdAt",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
      width: 120,
    },
    {
      title: "Actualizado en",
      dataIndex: "updatedAt", // "updatedAt"
      key: "updatedAt",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
      width: 120,
    },
    {
      title: "Acciones",
      key: "actions",
      width: 160,
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item key="edit" onClick={() => handleEditProgram(record.id)}>
              Editar
            </Menu.Item>
            <Menu.Item
              key="createCard"
              onClick={() =>
                setCreateCardModal({
                  visible: true,
                  programId: record.id,
                  ownerId: record.userId || record.owner?.id, // 🆕
                })
              }
            >
              Crear Tarjeta
            </Menu.Item>
            <Menu.Item
              key="viewCards"
              onClick={() => {
                setSelectedProgramId(record.id);
                setActiveTab("3");
              }}
            >
              Ver Tarjetas
            </Menu.Item>
            <Menu.Item key="delete">
              <Popconfirm
                title="¿Eliminar programa?"
                onConfirm={() => deleteProgram(record.id)}
              >
                Eliminar
              </Popconfirm>
            </Menu.Item>
          </Menu>
        );
        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<MoreOutlined />}>Acciones</Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Panel de Lealtad (Super Admin)
      </h1>

      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
        {/* Solicitudes */}
        <TabPane tab="Solicitudes" key="1">
          <Table
            dataSource={requests}
            columns={requestColumns}
            rowKey="id"
            loading={loadingRequests}
            scroll={{ x: 1200 }} // barra horizontal si la suma de widths > 1200
            style={{ tableLayout: "fixed" }}
          />
        </TabPane>

        {/* Programas */}
        <TabPane tab="Programas (aprobados)" key="2">
          <Table
            dataSource={programs}
            columns={programColumns}
            rowKey="id"
            loading={loadingPrograms}
            scroll={{ x: 1200 }} // igual
            style={{ tableLayout: "fixed" }}
          />

          {/* Modal para crear Tarjeta */}
          <CrearTarjetaModal
            programId={createCardModal.programId}
            ownerId={createCardModal.ownerId}
            visible={createCardModal.visible}
            onClose={() =>
              setCreateCardModal({ visible: false, programId: null })
            }
            onSuccess={() => {
              // refresca la tabla
              fetchPrograms();
            }}
          />
        </TabPane>
        <TabPane tab="Tarjetas" key="3">
          <TarjetasList programId={selectedProgramId} />
        </TabPane>
      </Tabs>
    </div>
  );
}
