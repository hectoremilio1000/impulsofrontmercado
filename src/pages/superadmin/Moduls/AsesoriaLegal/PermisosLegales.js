import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import {
  Table,
  message,
  Form,
  Input,
  Button,
  Modal,
  Dropdown,
  Space,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";

function PermisosLegales() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(false);

  // -- ESTADOS PARA CREAR --
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [tramiteLink, setTramiteLink] = useState("");
  const [costo, setCosto] = useState("");

  // -- MODAL PARA CREAR --
  const [isModalOpen, setIsModalOpen] = useState(false);

  // -- ESTADOS PARA EDITAR --
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  // Campos para editar
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editInstitucion, setEditInstitucion] = useState("");
  const [editTramiteLink, setEditTramiteLink] = useState("");
  const [editCosto, setEditCosto] = useState("");

  // CARGA DE DATOS
  const fetchPermisos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/permisos-legales`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.status === "success") {
        setPermisos(res.data.data);
      } else {
        message.error("Error al cargar permisos legales");
      }
    } catch (error) {
      console.error("Error al cargar permisos:", error);
      message.error("Error de conexión al cargar permisos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermisos();
    // eslint-disable-next-line
  }, []);

  // CREAR PERMISO
  const handleCreate = async () => {
    if (!name) {
      message.warning("Falta el nombre del permiso");
      return;
    }
    try {
      const body = {
        name,
        description,
        institucion,
        tramite_link: tramiteLink,
        costo,
      };
      const res = await axios.post(`${apiUrl}/permisos-legales`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data.status === "success") {
        message.success("Permiso creado con éxito");
        // Limpiar campos
        setName("");
        setDescription("");
        setInstitucion("");
        setTramiteLink("");
        setCosto("");
        // Cerrar modal
        setIsModalOpen(false);
        fetchPermisos();
      } else {
        message.error("No se pudo crear el permiso");
      }
    } catch (error) {
      console.error("Error al crear permiso:", error);
      message.error("Error al crear el permiso");
    }
  };

  // ABRIR MODAL DE EDICIÓN
  const handleOpenEdit = (record) => {
    setEditId(record.id);
    setEditName(record.name);
    setEditDescription(record.description);
    setEditInstitucion(record.institucion);
    setEditTramiteLink(record.tramiteLink);
    setEditCosto(record.costo);
    setIsEditModalOpen(true);
  };

  // ACTUALIZAR PERMISO
  const handleUpdate = async () => {
    if (!editName) {
      message.warning("Falta el nombre del permiso");
      return;
    }
    try {
      const body = {
        name: editName,
        description: editDescription,
        institucion: editInstitucion,
        tramite_link: editTramiteLink,
        costo: editCosto,
      };
      const res = await axios.put(
        `${apiUrl}/permisos-legales/${editId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data.status === "success") {
        message.success("Permiso actualizado con éxito");
        setIsEditModalOpen(false);
        fetchPermisos();
      } else {
        message.error("No se pudo actualizar el permiso");
      }
    } catch (error) {
      console.error("Error al actualizar permiso:", error);
      message.error("Error al actualizar el permiso");
    }
  };

  // ELIMINAR PERMISO
  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${apiUrl}/permisos-legales/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.status === "success") {
        message.success("Permiso eliminado");
        fetchPermisos();
      } else {
        message.error("No se pudo eliminar el permiso");
      }
    } catch (error) {
      console.error("Error al eliminar permiso:", error);
      message.error("Error al eliminar el permiso");
    }
  };

  // MENÚ DE ACCIONES PARA CADA FILA
  const menuItems = (record) => [
    {
      key: "1",
      label: (
        <div
          onClick={() => {
            handleOpenEdit(record);
          }}
        >
          Editar
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          style={{ color: "red" }}
          onClick={() => {
            Modal.confirm({
              title: "¿Eliminar este permiso?",
              content: "Esta acción no se puede deshacer",
              onOk: () => handleDelete(record.id),
              okText: "Eliminar",
              cancelText: "Cancelar",
            });
          }}
        >
          Eliminar
        </div>
      ),
    },
  ];

  // COLUMNAS DE LA TABLA
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 50,
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      width: 180,
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Institución",
      dataIndex: "institucion",
      key: "institucion",
      width: 120,
    },
    {
      title: "Costo",
      dataIndex: "costo",
      key: "costo",
      width: 80,
    },
    {
      title: "Link",
      dataIndex: "tramiteLink", // ajustamos para leer "tramiteLink"
      key: "tramiteLink",
      width: 180,
      render: (text) =>
        text ? (
          <a href={text} target="_blank" rel="noopener noreferrer">
            Tramite
          </a>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 80,
      render: (text, record) => (
        <Dropdown menu={{ items: menuItems(record) }} trigger={["click"]}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Permisos Legales en CDMX para operar un Restaurante
      </h2>

      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => setIsModalOpen(true)}
      >
        Ingresar información de nuevos Permisos
      </Button>

      <Table
        dataSource={permisos}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      {/* MODAL CREAR */}
      <Modal
        title="Crear Nuevo Permiso"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleCreate}>
          <Form.Item label="Nombre" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Licencia de Funcionamiento"
            />
          </Form.Item>
          <Form.Item label="Descripción">
            <Input.TextArea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pequeña descripción del permiso"
            />
          </Form.Item>
          <Form.Item label="Institución">
            <Input
              value={institucion}
              onChange={(e) => setInstitucion(e.target.value)}
              placeholder="Ej: SEDUVI"
            />
          </Form.Item>
          <Form.Item label="Costo (aprox)">
            <Input
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              placeholder="Ej: $2,000"
            />
          </Form.Item>
          <Form.Item label="Link oficial del trámite">
            <Input
              value={tramiteLink}
              onChange={(e) => setTramiteLink(e.target.value)}
              placeholder="https://..."
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Guardar
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL EDITAR */}
      <Modal
        title="Editar Permiso"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleUpdate}>
          <Form.Item label="Nombre" required>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Ej: Licencia de Funcionamiento"
            />
          </Form.Item>
          <Form.Item label="Descripción">
            <Input.TextArea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Pequeña descripción del permiso"
            />
          </Form.Item>
          <Form.Item label="Institución">
            <Input
              value={editInstitucion}
              onChange={(e) => setEditInstitucion(e.target.value)}
              placeholder="Ej: SEDUVI"
            />
          </Form.Item>
          <Form.Item label="Costo (aprox)">
            <Input
              value={editCosto}
              onChange={(e) => setEditCosto(e.target.value)}
              placeholder="Ej: $2,000"
            />
          </Form.Item>
          <Form.Item label="Link oficial del trámite">
            <Input
              value={editTramiteLink}
              onChange={(e) => setEditTramiteLink(e.target.value)}
              placeholder="https://..."
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Actualizar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default PermisosLegales;
