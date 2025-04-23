// src/pages/superadmin/Moduls/RRHH/Positions.jsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  message,
  Popconfirm,
  Dropdown,
  Menu,
  Spin,
} from "antd";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import { AiOutlineSearch, AiOutlineMore } from "react-icons/ai";
import axios from "axios";
import dayjs from "dayjs";
import { useAuth } from "../../../components/AuthContext";

const { Option } = Select;

/* Paleta de colores por tipo  */
const colorMap = {
  piso: "cyan",
  barra: "magenta",
  cocina: "volcano",
  admin: "gold", // 🔥 NEW
  rh: "purple", // 🔥 NEW
  mantenimiento: "geekblue",
  marketing: "lime",
};

export default function Positions() {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [positions, setPositions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  /* ------- crear -------- */
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formCreate, setFormCreate] = useState({
    nombre: "",
    tipo: "",
    version: 1,
    activo: true,
  });

  /* ------- editar ------- */
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formEdit, setFormEdit] = useState({
    id: "",
    nombre: "",
    tipo: "",
    version: 1,
    activo: true,
  });

  /* ------- eliminar ------ */ // 🔥 NEW
  const [deleting, setDeleting] = useState(false);

  /* ---------- fetch ---------- */
  const fetchPositions = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/positions`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (data.status === "success") {
        setPositions(data.data);
        setFiltered(data.data);
      }
    } catch (err) {
      console.error(err);
      message.error("Error al obtener posiciones");
    }
  };
  useEffect(() => {
    fetchPositions();
    // eslint-disable-next-line
  }, []);

  /* ---------- filtros locales ---------- */
  useEffect(() => {
    let list = [...positions];
    if (search) {
      const r = new RegExp(search, "i");
      list = list.filter((p) => r.test(p.nombre));
    }
    if (typeFilter) list = list.filter((p) => p.tipo === typeFilter);
    setFiltered(list);
  }, [search, typeFilter, positions]);

  /* ---------- helpers API ---------- */
  const createPosition = async (data) => {
    setCreating(true);
    try {
      const res = await axios.post(`${apiUrl}/positions`, data, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return res.data;
    } catch (e) {
      console.error(e);
      return { status: "error" };
    } finally {
      setCreating(false);
    }
  };

  const updatePosition = async (id, data) => {
    setEditing(true);
    try {
      const res = await axios.put(`${apiUrl}/positions/${id}`, data, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return res.data;
    } catch (e) {
      console.error(e);
      return { status: "error" };
    } finally {
      setEditing(false);
    }
  };

  const deletePosition = async (id) => {
    setDeleting(true);
    try {
      const { data } = await axios.delete(`${apiUrl}/positions/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return data;
    } catch (e) {
      console.error(e);
      return { status: "error" };
    } finally {
      setDeleting(false);
    }
  };

  /* ---------- submits ---------- */
  const handleOkCreate = async () => {
    if (!formCreate.nombre || !formCreate.tipo) {
      message.warn("Nombre y tipo son obligatorios");
      return;
    }
    const res = await createPosition(formCreate);
    if (res.status === "success") {
      message.success("Posición creada");
      setOpenCreate(false);
      fetchPositions();
    } else message.error("No se pudo crear");
  };

  const handleOkEdit = async () => {
    if (!formEdit.nombre || !formEdit.tipo) {
      message.warn("Nombre y tipo son obligatorios");
      return;
    }
    const { id, ...payload } = formEdit;
    const res = await updatePosition(id, payload);
    if (res.status === "success") {
      message.success("Posición actualizada");
      setOpenEdit(false);
      fetchPositions();
    } else message.error("No se pudo actualizar");
  };

  const handleDelete = async (id) => {
    // 🔥 NEW
    const res = await deletePosition(id);
    if (res.status === "success") {
      message.success("Posición eliminada");
      fetchPositions();
    } else message.error("No se pudo eliminar");
  };

  /* ---------- columnas ---------- */
  const columns = [
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: (t) => <Tag color={colorMap[t] || "blue"}>{t}</Tag>,
    },
    { title: "Versión", dataIndex: "version", key: "version" },
    {
      title: "Activo",
      dataIndex: "activo",
      key: "activo",
      render: (a) => <Tag color={a ? "green" : "red"}>{a ? "Sí" : "No"}</Tag>,
    },
    {
      title: "Creado",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (c) => (c ? dayjs(c).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, r) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<MdEdit />}
                onClick={() => {
                  setFormEdit({ ...r });
                  setOpenEdit(true);
                }}
              >
                Editar
              </Menu.Item>
              <Menu.Item key="delete" icon={<MdDelete />}>
                <Popconfirm
                  title="¿Eliminar posición?"
                  description="Esta acción no se puede deshacer."
                  okText="Sí"
                  cancelText="No"
                  onConfirm={() => handleDelete(r.id)}
                >
                  Eliminar
                </Popconfirm>
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button type="link" icon={<AiOutlineMore />} />
        </Dropdown>
      ),
    },
  ];

  /* ---------- render ---------- */
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Posiciones</h2>
        <Button
          type="primary"
          icon={<MdAdd />}
          onClick={() => setOpenCreate(true)}
        >
          Nueva Posición
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          style={{ width: 260 }}
          prefix={<AiOutlineSearch />}
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          allowClear
          placeholder="Filtrar por tipo"
          style={{ width: 180 }}
          value={typeFilter || undefined}
          onChange={(v) => setTypeFilter(v || "")}
          showSearch
          optionFilterProp="children"
        >
          {Array.from(new Set(positions.map((p) => p.tipo))).map((t) => (
            <Option key={t} value={t}>
              {t}
            </Option>
          ))}
        </Select>
        {(search || typeFilter) && (
          <Button
            onClick={() => {
              setSearch("");
              setTypeFilter("");
            }}
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Tabla */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 10 }}
        loading={deleting} // 🔥 muestra spinner mientras borra
        locale={{ emptyText: "Sin posiciones registradas" }}
      />

      {/* ----- Modal CREATE ----- */}
      <Modal
        open={openCreate}
        title="Crear Posición"
        onCancel={() => setOpenCreate(false)}
        onOk={handleOkCreate}
        confirmLoading={creating}
      >
        <div className="grid gap-3">
          <Input
            placeholder="Nombre"
            value={formCreate.nombre}
            onChange={(e) =>
              setFormCreate({ ...formCreate, nombre: e.target.value })
            }
          />
          <Select
            mode="tags"
            placeholder="Tipo (escribe para agregar)"
            style={{ width: "100%" }}
            value={formCreate.tipo ? [formCreate.tipo] : []}
            onChange={(vals) =>
              setFormCreate({ ...formCreate, tipo: vals[0] || "" })
            }
          >
            {Array.from(new Set(positions.map((p) => p.tipo))).map((t) => (
              <Option key={t} value={t}>
                {t}
              </Option>
            ))}
          </Select>
          <Input
            placeholder="Versión"
            type="number"
            value={formCreate.version}
            onChange={(e) =>
              setFormCreate({ ...formCreate, version: Number(e.target.value) })
            }
          />
          <Select
            placeholder="¿Activa?"
            value={formCreate.activo ? 1 : 0}
            onChange={(v) =>
              setFormCreate({ ...formCreate, activo: Boolean(v) })
            }
          >
            <Option value={1}>Sí</Option>
            <Option value={0}>No</Option>
          </Select>
        </div>
      </Modal>

      {/* ----- Modal EDIT ----- */}
      <Modal
        open={openEdit}
        title="Editar Posición"
        onCancel={() => setOpenEdit(false)}
        onOk={handleOkEdit}
        confirmLoading={editing}
      >
        {editing ? (
          <Spin />
        ) : (
          <div className="grid gap-3">
            <Input
              placeholder="Nombre"
              value={formEdit.nombre}
              onChange={(e) =>
                setFormEdit({ ...formEdit, nombre: e.target.value })
              }
            />
            <Select
              mode="tags"
              placeholder="Tipo"
              style={{ width: "100%" }}
              value={formEdit.tipo ? [formEdit.tipo] : []}
              onChange={(vals) =>
                setFormEdit({ ...formEdit, tipo: vals[0] || "" })
              }
            >
              {Array.from(new Set(positions.map((p) => p.tipo))).map((t) => (
                <Option key={t} value={t}>
                  {t}
                </Option>
              ))}
            </Select>
            <Input
              placeholder="Versión"
              type="number"
              value={formEdit.version}
              onChange={(e) =>
                setFormEdit({ ...formEdit, version: Number(e.target.value) })
              }
            />
            <Select
              placeholder="¿Activa?"
              value={formEdit.activo ? 1 : 0}
              onChange={(v) => setFormEdit({ ...formEdit, activo: Boolean(v) })}
            >
              <Option value={1}>Sí</Option>
              <Option value={0}>No</Option>
            </Select>
          </div>
        )}
      </Modal>
    </div>
  );
}
