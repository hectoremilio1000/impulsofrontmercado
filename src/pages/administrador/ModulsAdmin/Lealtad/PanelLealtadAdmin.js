// file: src/pages/admin/Moduls/Lealtad/PanelLealtadAdmin.jsx

import React, { useEffect, useState } from "react";
import { Tabs, Table, Button, message, Popconfirm, Dropdown, Menu } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../components/AuthContext";
import dayjs from "dayjs";
import "dayjs/locale/es";

import TarjetasList from "./TarjetasListAdmin"; // <-- Ajusta o comenta si no lo usas
import CrearTarjetaModal from "./CrearTarjetaModal"; // <-- Ajusta o comenta si no lo usas

dayjs.locale("es");
const { TabPane } = Tabs;

export default function PanelLealtadAdmin() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [requests, setRequests] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [selectedProgramId, setSelectedProgramId] = useState(null);

  // Modal para crear Tarjeta
  const [createCardModal, setCreateCardModal] = useState({
    visible: false,
    programId: null,
  });

  const apiUrl = process.env.REACT_APP_API_URL;
  const currentUser = auth?.user || {};
  const currentCompanyId = currentUser?.company_id;
  // Asumiendo que cada Admin está asociado a una empresa (company_id)

  // 1) Cargar Solicitudes
  async function fetchRequests() {
    setLoadingRequests(true);
    try {
      // Petición con ?user_id=XX
      const url = `${apiUrl}/loyalty/requests?user_id=${auth.user.id}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      setRequests(res.data || []);
    } catch (error) {
      console.error("fetchRequests => ERROR =>", error);
      message.error("Error al cargar solicitudes");
    } finally {
      setLoadingRequests(false);
    }
  }

  // 2) Cargar Programas
  async function fetchPrograms() {
    setLoadingPrograms(true);
    try {
      let url = `${apiUrl}/loyalty/programs?user_id=${auth.user.id}`;
      // O si además quieres filtrar por company_id:
      // if (currentCompanyId) url += `&company_id=${currentCompanyId}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      setPrograms(res.data || []);
    } catch (error) {
      console.error("fetchPrograms => ERROR =>", error);
      message.error("Error al cargar programas");
    } finally {
      setLoadingPrograms(false);
    }
  }

  useEffect(() => {
    fetchRequests();
    fetchPrograms();
    // eslint-disable-next-line
  }, [currentCompanyId]);

  // Aprobar solicitud (si tu Admin puede hacerlo)
  const approveRequest = async (id) => {
    try {
      await axios.post(
        `${apiUrl}/loyalty/requests/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      message.success("Solicitud aprobada");
      fetchRequests();
      fetchPrograms();
    } catch (err) {
      console.error("approveRequest => ERROR =>", err);
      message.error("Error al aprobar la solicitud");
    }
  };

  // Rechazar solicitud
  const rejectRequest = async (id) => {
    try {
      await axios.post(
        `${apiUrl}/loyalty/requests/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      message.success("Solicitud rechazada");
      fetchRequests();
    } catch (err) {
      console.error("rejectRequest => ERROR =>", err);
      message.error("Error al rechazar la solicitud");
    }
  };

  // Eliminar programa
  const deleteProgram = async (id) => {
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
    // Ajusta la ruta si deseas
    navigate(`/panellealtad/edit-request/${id}`);
  };

  // Editar programa
  const handleEditProgram = (id) => {
    // Ajusta la ruta si deseas
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
  // Tabla Solicitudes
  // ==============================
  const requestColumns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 50,
    },
    {
      title: "Usuario",
      render: (_, record) =>
        record.user ? record.user.name : `User ID ${record.user_id}`,
      width: 120,
    },
    {
      title: "Compañía",
      // Si haces preload('company') en el backend
      render: (_, record) =>
        record.company ? record.company.name : "Sin empresa",
      width: 140,
    },
    {
      title: "Tipo",
      dataIndex: "programType",
      width: 90,
      render: (val) => mapProgramType[val] || val,
    },
    {
      title: "Requerido",
      render: (_, r) =>
        r.programType === "visits" ? r.requiredVisits : r.requiredProducts,
      width: 90,
    },
    {
      title: "Estatus",
      dataIndex: "status",
      width: 100,
      render: (val) => mapStatus[val] || val,
    },
    {
      title: "Creado en",
      dataIndex: "createdAt",
      width: 140,
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    // {
    //   title: "Acciones",
    //   width: 120,
    //   render: (_, record) => {
    //     const menu = (
    //       <Menu>
    //         <Menu.Item key="edit" onClick={() => handleEditRequest(record.id)}>
    //           Editar
    //         </Menu.Item>
    //         {record.status === "pending" && (
    //           <Menu.Item
    //             key="approve"
    //             onClick={() => approveRequest(record.id)}
    //           >
    //             Aprobar
    //           </Menu.Item>
    //         )}
    //         {record.status === "pending" && (
    //           <Menu.Item key="reject" onClick={() => rejectRequest(record.id)}>
    //             Rechazar
    //           </Menu.Item>
    //         )}
    //       </Menu>
    //     );
    //     return (
    //       <Dropdown overlay={menu} trigger={["click"]}>
    //         <Button icon={<MoreOutlined />} />
    //       </Dropdown>
    //     );
    //   },
    // },
  ];

  // ==============================
  // Tabla Programas
  // ==============================
  const programColumns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Dueño",
      width: 120,
      render: (_, record) =>
        record.owner ? record.owner.name : `User ID ${record.user_id}`,
    },
    {
      title: "Nombre",
      dataIndex: "name",
      width: 130,
    },
    {
      title: "Compañía",
      width: 130,
      render: (_, record) =>
        record.company ? record.company.name : "Sin empresa",
    },
    {
      title: "Tipo",
      dataIndex: "type",
      width: 90,
      render: (val) => mapProgramType[val] || val,
    },
    {
      title: "Req.Visitas",
      dataIndex: "requiredVisits",
      width: 100,
    },
    {
      title: "Req.Productos",
      dataIndex: "requiredProducts",
      width: 100,
    },
    {
      title: "Activo",
      dataIndex: "isActive",
      width: 80,
      render: (val) => (val ? "Sí" : "No"),
    },
    {
      title: "Creado en",
      dataIndex: "createdAt",
      width: 140,
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Acciones",
      width: 160,
      render: (_, record) => (
        <Button
          onClick={() =>
            setCreateCardModal({ visible: true, programId: record.id })
          }
        >
          Crear Tarjeta de Lealtad
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Panel de Lealtad (Admin)</h1>

      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
        {/* Pestania 1: Solicitudes */}
        <TabPane tab="Solicitudes" key="1">
          <Table
            dataSource={requests}
            columns={requestColumns}
            rowKey="id"
            loading={loadingRequests}
            scroll={{ x: 1200 }}
            style={{ tableLayout: "fixed" }}
          />
        </TabPane>

        {/* Pestania 2: Programas */}
        <TabPane tab="Programas" key="2">
          <Table
            dataSource={programs}
            columns={programColumns}
            rowKey="id"
            loading={loadingPrograms}
            scroll={{ x: 1200 }}
            style={{ tableLayout: "fixed" }}
          />

          {/* Modal para crear Tarjeta (si lo usas) */}
          <CrearTarjetaModal
            programId={createCardModal.programId}
            visible={createCardModal.visible}
            onClose={() =>
              setCreateCardModal({ visible: false, programId: null })
            }
            onSuccess={() => {
              // refresca la tabla de programas
              fetchPrograms();
            }}
          />
        </TabPane>

        {/* Pestania 3: Tarjetas */}
        <TabPane tab="Tarjetas" key="3">
          <TarjetasList programId={selectedProgramId} />
        </TabPane>
      </Tabs>
    </div>
  );
}
