// components/rolSuperAdmin/RRHH/Checklists/PanelChecklistsSuperAdmin.jsx
import React, { useState } from "react";
import {
  Select,
  Table,
  Button,
  Dropdown,
  Menu,
  Modal,
  Spin,
  message,
} from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../../AuthContext";
import useFetchChecklists from "./UseFetchChecklists";

// Antd
const { Option } = Select;

export default function PanelChecklistsSuperAdmin() {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = auth?.token;

  /** Custom hook que hace TODA la lógica de obtención y filtros */
  const {
    usersRol2,
    companiesOfUser,
    positions,
    selectedUserId,
    setSelectedUserId,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedPositionId,
    setSelectedPositionId,
    loading,
    checklists,
    refetch,
  } = useFetchChecklists();

  /** Modal ver/editar (simple) */
  const [modal, setModal] = useState({ open: false, checklist: null });

  const openModal = (ck) => setModal({ open: true, checklist: ck });
  const closeModal = () => setModal({ open: false, checklist: null });

  /** Eliminar checklist */
  const handleDelete = (record) => {
    Modal.confirm({
      title: "¿Eliminar checklist?",
      content: "Esta acción no se puede deshacer",
      okText: "Sí, eliminar",
      cancelText: "Cancelar",
      async onOk() {
        try {
          await axios.delete(`${apiUrl}/rrhh-checklists/${record.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("Checklist eliminado");
          refetch();
        } catch (e) {
          console.error(e);
          message.error("Error al eliminar");
        }
      },
    });
  };

  /** Columnas tabla */
  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Título", dataIndex: "title" },
    { title: "Tipo", dataIndex: "type" },
    {
      title: "Empresa",
      dataIndex: ["company", "name"],
      render: (_, r) => (r.company ? r.company.name : "Global"),
    },
    {
      title: "Puesto",
      dataIndex: ["position", "nombre"],
      render: (_, r) => (r.position ? r.position.nombre : "Todos"),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item key="delete" onClick={() => handleDelete(record)}>
              Eliminar
            </Menu.Item>
          </Menu>
        );

        return (
          <>
            <Button size="small" onClick={() => openModal(record)}>
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

  return (
    <div>
      <h3>Filtrar Checklists por Usuario → Empresa → Puesto</h3>

      {/* FILTROS */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {/* USUARIO */}
        <div>
          <label>Cliente:</label>
          <br />
          <Select
            style={{ width: 220 }}
            placeholder="Elige Usuario"
            value={selectedUserId}
            onChange={(v) => setSelectedUserId(v)}
            allowClear
          >
            {usersRol2.map((u) => (
              <Option key={u.id} value={u.id}>
                {u.name} (ID {u.id})
              </Option>
            ))}
          </Select>
        </div>

        {/* EMPRESA */}
        <div>
          <label>Empresa:</label>
          <br />
          <Select
            style={{ width: 220 }}
            placeholder="Elige Empresa"
            value={selectedCompanyId}
            onChange={(v) => setSelectedCompanyId(v)}
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

        {/* PUESTO */}
        <div>
          <label>Puesto:</label>
          <br />
          <Select
            style={{ width: 220 }}
            placeholder="Elige Puesto"
            value={selectedPositionId}
            onChange={(v) => setSelectedPositionId(v)}
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
      </div>

      {/* TABLA */}
      {loading ? (
        <Spin />
      ) : (
        <Table
          rowKey="id"
          dataSource={checklists}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* MODAL (solo lectura rápido) */}
      <Modal
        title={modal.checklist?.title}
        open={modal.open}
        onCancel={closeModal}
        footer={null}
      >
        {modal.checklist && (
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(modal.checklist, null, 2)}
          </pre>
        )}
      </Modal>
    </div>
  );
}
