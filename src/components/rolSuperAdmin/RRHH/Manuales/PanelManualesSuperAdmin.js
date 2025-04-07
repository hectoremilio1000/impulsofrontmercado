import React, { useState } from "react";
import { Select, Button, Table, Modal, Menu, Dropdown } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { useAuth } from "../../../AuthContext";
import { FetchPanelManuales } from "./FetchPanelManuales";

// Asumiendo que quieres mostrar las columnas: ID, Título, Puesto, Acciones
const { Option } = Select;

function PanelManualesSuperAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const {
    // Selección
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

    // Loading
    loading,
  } = FetchPanelManuales();

  // Estado para “Ver Manual” en un modal
  const [manualSelected, setManualSelected] = useState(null);
  const [modalVerManualVisible, setModalVerManualVisible] = useState(false);

  /**
   * Ejemplo de funciones para Editar / Eliminar:
   */
  const handleEdit = (manual) => {
    console.log("Editar manual => ", manual);
    // Aquí tu lógica: abrir un modal, o hacer PUT /training-manuals/:id, etc.
  };

  const handleDelete = (manual) => {
    console.log("Eliminar manual => ", manual);
    // Aquí tu lógica: confirm, luego DELETE /training-manuals/:id, etc.
  };

  // Columnas de la tabla de manuales
  const columns = [
    {
      title: "Puesto",
      key: "puesto",
      render: (_, record) =>
        record.position ? record.position.nombre : "Sin puesto",
    },
    {
      title: "Manual ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
    },

    {
      title: "Acciones",
      key: "acciones",
      render: (text, record) => {
        // Menú de opciones (Editar/Eliminar)
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
            {/* Botón para "Ver" modal */}
            <Button
              size="small"
              onClick={() => {
                setManualSelected(record);
                setModalVerManualVisible(true);
              }}
            >
              Ver
            </Button>

            {/* Triple puntitos */}
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
      <h3>Filtrar Manuales por Usuario → Empresa → Puesto</h3>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {/* Select de usuarios con rol=2 */}
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

        {/* Select de Empresas del usuario elegido */}
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

        {/* Select de Puestos de la empresa seleccionada */}
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
      </div>

      {/* Tabla con manuales */}
      <Table
        style={{ marginTop: 16 }}
        rowKey="id"
        columns={columns}
        dataSource={manuals}
        loading={loading}
      />

      {/* Modal: Ver Manual (contenido) */}
      <Modal
        title={manualSelected?.title}
        visible={modalVerManualVisible}
        onCancel={() => setModalVerManualVisible(false)}
        footer={null}
      >
        {manualSelected && (
          <div>
            <p>
              <strong>ID:</strong> {manualSelected.id}
            </p>
            <p>
              <strong>Contenido:</strong> {manualSelected.content}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PanelManualesSuperAdmin;
