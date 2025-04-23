import React, { useState } from "react";
import {
  Select,
  Button,
  Table,
  Modal,
  Menu,
  Dropdown,
  message,
  Spin,
} from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { useAuth } from "../../../AuthContext";
import { FetchPanelManuales } from "./FetchPanelManuales";
import ManualModal from "./ManualModal";
import axios from "axios";

const { Option } = Select;

export default function PanelManualesSuperAdmin() {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  /* ------------------------------------------------------------------ */
  /*  Hook con toda la lógica de obtención                              */
  /* ------------------------------------------------------------------ */
  const {
    // Selecciones
    selectedUserId,
    setSelectedUserId,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedPositionId,
    setSelectedPositionId,

    // Catálogos
    usersRol2,
    companiesOfUser,
    positions,
    manuals,

    // Estado
    loading,

    // Refetch
    fetchManuals,
  } = FetchPanelManuales();

  /* ------------------------------------------------------------------ */
  /*  Estado Modal                                                      */
  /* ------------------------------------------------------------------ */
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // view | edit | create
  const [manualSelected, setManualSelected] = useState(null);

  /* ------------------------  ACCIONES TABLA  ------------------------ */
  const handleView = (manual) => {
    setManualSelected(manual);
    setModalMode("view");
    setModalVisible(true);
  };

  const handleEdit = (manual) => {
    setManualSelected(manual);
    setModalMode("edit");
    setModalVisible(true);
  };

  const handleDelete = (manual) => {
    Modal.confirm({
      title: "¿Eliminar manual?",
      content: "Esta acción no se puede deshacer",
      okText: "Sí, eliminar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.delete(`${apiUrl}/training-manuals/${manual.id}`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          message.success("Manual eliminado");
          fetchManuals();
        } catch (err) {
          console.error(err);
          message.error("No se pudo eliminar");
        }
      },
    });
  };

  const handleCreate = () => {
    setManualSelected(null);
    setModalMode("create");
    setModalVisible(true);
  };

  /* -------------------------  GUARDAR (edit/create) ----------------- */
  const saveManual = async (values) => {
    try {
      if (modalMode === "edit") {
        await axios.put(
          `${apiUrl}/training-manuals/${manualSelected.id}`,
          values,
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        message.success("Manual actualizado");
      } else {
        await axios.post(`${apiUrl}/training-manuals`, values, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        message.success("Manual creado");
      }
      setModalVisible(false);
      fetchManuals();
    } catch (err) {
      console.error(err);
      message.error("Error guardando manual");
    }
  };

  /* -------------------------  Columnas de tabla --------------------- */
  const columns = [
    {
      title: "Compañía",
      key: "company",
      render: (_, record) =>
        record.company ? record.company.name : "Sin compañía",
    },
    {
      title: "Puesto",
      key: "puesto",
      render: (_, record) =>
        record.position ? record.position.nombre : "Sin puesto",
    },
    { title: "Manual ID", dataIndex: "id", key: "id" },
    { title: "Título", dataIndex: "title", key: "title" },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item key="edit" onClick={() => handleEdit(record)}>
              Editar
            </Menu.Item>
            <Menu.Item key="delete" onClick={() => handleDelete(record)}>
              Eliminar
            </Menu.Item>
          </Menu>
        );

        return (
          <>
            <Button size="small" onClick={() => handleView(record)}>
              Ver
            </Button>
            <Dropdown overlay={menu} trigger={["click"]}>
              <Button size="small" style={{ marginLeft: 8 }}>
                <EllipsisOutlined />
              </Button>
            </Dropdown>
          </>
        );
      },
    },
  ];

  /* ------------------------------  RENDER --------------------------- */
  return (
    <div>
      <h3>Filtrar Manuales por Usuario → Empresa → Puesto</h3>

      {/* ---------------------- FILTROS ------------------------------ */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {/* USUARIOS (rol=2) */}
        <div>
          <label>Cliente:</label>
          <br />
          <Select
            style={{ width: 220 }}
            placeholder="Elige Usuario"
            value={selectedUserId}
            onChange={(val) => setSelectedUserId(val)}
            allowClear
          >
            {usersRol2.map((u) => (
              <Option key={u.id} value={u.id}>
                {u.name} (ID {u.id})
              </Option>
            ))}
          </Select>
        </div>

        {/* EMPRESAS */}
        <div>
          <label>Empresa:</label>
          <br />
          <Select
            style={{ width: 220 }}
            placeholder="Elige Empresa"
            value={selectedCompanyId}
            onChange={(val) => setSelectedCompanyId(val)}
            allowClear
            disabled={!selectedUserId}
          >
            {companiesOfUser.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name} (ID {c.id})
              </Option>
            ))}
          </Select>
        </div>

        {/* PUESTOS */}
        <div>
          <label>Puesto:</label>
          <br />
          <Select
            style={{ width: 220 }}
            placeholder="Elige Puesto"
            value={selectedPositionId}
            onChange={(val) => setSelectedPositionId(val)}
            allowClear
            disabled={!selectedCompanyId}
          >
            {positions.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.nombre} (ID {p.id})
              </Option>
            ))}
          </Select>
        </div>

        {/* BOTÓN NUEVO MANUAL */}
        {/* <div style={{ marginLeft: "auto" }}>
          <Button type="primary" onClick={handleCreate}>
            Nuevo Manual
          </Button>
        </div> */}
      </div>

      {/* ---------------------- TABLA ------------------------------- */}
      {loading ? (
        <Spin />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={manuals}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* ---------------------- MODAL  ------------------------------ */}
      <ManualModal
        visible={modalVisible}
        mode={modalMode}
        manual={manualSelected}
        positions={positions}
        onCancel={() => setModalVisible(false)}
        onSave={saveManual}
      />
    </div>
  );
}
