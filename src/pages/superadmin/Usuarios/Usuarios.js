// src/pages/superadmin/Usuarios.jsx
import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Dropdown,
  message,
  Modal,
  Space,
  Table,
  Input,
} from "antd";
import { MdAdd } from "react-icons/md";
import { TbAdjustments } from "react-icons/tb";
import { AiOutlineSearch } from "react-icons/ai";
import dayjs from "dayjs";
import { FaEdit, FaEllipsisV, FaEye, FaTrash, FaUserCog } from "react-icons/fa";
import axios from "axios";

import { useAuth } from "../../../components/AuthContext";
import { useNavigate } from "react-router-dom";

// Modales:
import CreateCompanyModal from "../../../components/rolSuperAdmin/Usuarios/CreateCompanyModal";
import SubscriptionDetailModal from "../../../components/rolSuperAdmin/SubscriptionDetailModal";
import EditUserModal from "../../../components/rolSuperAdmin/Usuarios/EditUserModal";
import CreateUserModal from "../../../components/rolSuperAdmin/Usuarios/CreateUserModal";
import SelectModulesModal from "../../../components/rolSuperAdmin/Usuarios/SelectModulesModal";

const { RangePicker } = DatePicker;

const Usuarios = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Estados para la lista de usuarios y su filtro
  const [usuarios, setUsuarios] = useState([]);
  const [filterUsuarios, setFilterUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(false);

  const [filters, setFilters] = useState({
    fechaCreatedRange: [null, null],
  });

  // Modal de detalle de suscripción
  const [isSubDetailOpen, setIsSubDetailOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState(null);

  // Estados para trackear la creación de usuario+empresa+módulos
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState(null); // <-- nuevo
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // Modales
  const [isModalUserOpen, setIsModalUserOpen] = useState(false); // Crear usuario
  const [isModalCompanyOpen, setIsModalCompanyOpen] = useState(false);
  const [isModalModulesOpen, setIsModalModulesOpen] = useState(false);

  // Editar usuario
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // 1. Cargar usuarios => GET /users
  const fetchUsuarios = async () => {
    try {
      const resp = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = resp.data.data || [];

      setUsuarios(data);
      setFilterUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      message.error("No se pudo cargar la lista de usuarios");
    }
  };

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line
  }, []);

  /**
   * Manejo de creación de usuario -> crea user => si es rol=2 (admin), crear empresa
   * Recibimos: newUserId, chosenRoleId, newUserName
   */
  const handleUserCreated = (newUserId, chosenRoleId, newUserName) => {
    message.success("Usuario creado con éxito");
    setIsModalUserOpen(false);
    fetchUsuarios();

    setSelectedUserId(newUserId);
    setSelectedUserName(newUserName);

    // Solo abrir la creación de empresa si se eligió rol_id = 2 (admin)
    if (chosenRoleId === 2) {
      setIsModalCompanyOpen(true);
    }
  };

  // Manejo de creación de empresa -> modal de módulos
  const handleCompanyCreated = (newCompanyId) => {
    message.success("Empresa creada con éxito");
    setIsModalCompanyOpen(false);

    setSelectedCompanyId(newCompanyId);
    setIsModalModulesOpen(true);
  };

  const handleModulesSelected = () => {
    message.success("Módulos seleccionados correctamente");
    setIsModalModulesOpen(false);
  };

  // Filtros en memoria
  const applyFilters = () => {
    let filtered = [...filterUsuarios];
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      filtered = filtered.filter(
        (u) => regex.test(u.name) || regex.test(u.email)
      );
    }
    const [start, end] = filters.fechaCreatedRange;
    if (start && end) {
      filtered = filtered.filter((u) =>
        dayjs(u.createdAt).isBetween(start, end, "day", "[]")
      );
    }
    setUsuarios(filtered);
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line
  }, [searchTerm, filters]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({ fechaCreatedRange: [null, null] });
    setUsuarios([...filterUsuarios]);
  };

  // Abrir modal edición
  const openEditModal = (userId) => {
    setEditingUserId(userId);
    setIsEditModalOpen(true);
  };
  // Cerrar modal edición
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUserId(null);
    fetchUsuarios();
  };

  // Detalle suscripción (opcional)
  const openSubscriptionDetailModal = (userId) => {
    setDetailUserId(userId);
    setIsSubDetailOpen(true);
  };

  // Columnas de la tabla
  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "nombre",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Rol",
      key: "rol",
      render: (_, record) => {
        if (record.rol) return record.rol.name;
        return `RolID: ${record.rol_id || "N/A"}`;
      },
    },
    {
      title: "Fecha Creación",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => (val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "N/A"),
    },
    {
      title: "Activo",
      key: "isActive",
      render: (record) => (record.isActive ? "Sí" : "No"),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 60,
      render: (_, record) => {
        const menuItems = [
          {
            label: (
              <button
                onClick={() => openEditModal(record.id)}
                className="w-full text-left flex items-center gap-2 text-sm"
              >
                <FaEdit /> Editar
              </button>
            ),
            key: "1",
          },
          {
            label: (
              <button
                onClick={() => {
                  Modal.confirm({
                    title: "¿Está seguro de eliminar?",
                    content: "Se eliminarán datos relacionados a este usuario",
                    onOk: async () => {
                      try {
                        await axios.delete(`${apiUrl}/users/${record.id}`, {
                          headers: {
                            Authorization: `Bearer ${auth.token}`,
                          },
                        });
                        message.success("Usuario eliminado");
                        fetchUsuarios();
                      } catch (err) {
                        console.error("Error al eliminar usuario:", err);
                        message.error("No se pudo eliminar el usuario");
                      }
                    },
                  });
                }}
                className="w-full text-left flex items-center gap-2 text-sm text-red-500"
              >
                <FaTrash /> Eliminar
              </button>
            ),
            key: "2",
          },
          {
            label: (
              <button
                onClick={() => {
                  navigate(`/usuarios/detalle/${record.id}`);
                }}
                className="w-full text-left flex items-center gap-2 text-sm"
              >
                <FaEye /> Ver Detalle
              </button>
            ),
            key: "3",
          },
        ];

        return (
          <>
            <Dropdown
              trigger={["click"]}
              menu={{ items: menuItems }}
              placement="bottomRight"
            >
              <div className="text-xs w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all duration-300 cursor-pointer">
                <Space>
                  <FaEllipsisV />
                </Space>
              </div>
            </Dropdown>

            {/* Modal detalle de suscripción (opcional) */}
            <SubscriptionDetailModal
              visible={isSubDetailOpen}
              onCancel={() => setIsSubDetailOpen(false)}
              userId={detailUserId}
            />
          </>
        );
      },
    },
  ];

  return (
    <div className="w-full p-6 app-container-sections">
      <div className="mb-8 flex items-center justify-between py-4 pr-4">
        <div>
          <div className="font-bold text-xl">Usuarios</div>
          <div className="max-w-[30vw] text-xs text-gray-500">
            Lista de todos tus usuarios
          </div>
        </div>
        <div className="bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="icon bg-light-purple p-4 rounded text-dark-purple">
              <FaUserCog />
            </div>
            <div>
              <div className="font-bold text-xl">{usuarios.length}</div>
              <div className="text-sm text-light-font">Total usuarios</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center mb-6">
        <div className="flex-grow">
          <Input
            style={{ maxWidth: 250 }}
            placeholder="Buscar usuarios"
            prefix={<AiOutlineSearch />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </div>
        <div className="ml-4 flex items-center gap-3">
          <Button
            onClick={() => setActiveFilter(!activeFilter)}
            className="bg-dark-blue text-white rounded"
          >
            <TbAdjustments />
          </Button>
          <Button
            onClick={() => setIsModalUserOpen(true)}
            className="bg-dark-purple text-white flex items-center gap-2"
          >
            <MdAdd />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {activeFilter && (
        <div className="bg-white py-4 px-3 mb-4">
          <RangePicker
            style={{ marginRight: 8 }}
            value={filters.fechaCreatedRange}
            onChange={(dates) => setFilters({ fechaCreatedRange: dates })}
            placeholder={["Fecha Desde", "Fecha Hasta"]}
          />
          <Button onClick={applyFilters}>Buscar</Button>
          <Button style={{ marginLeft: 8 }} onClick={handleClearFilters}>
            Limpiar
          </Button>
        </div>
      )}

      <Table
        rowKey="id"
        columns={columns}
        dataSource={usuarios}
        pagination={false}
        locale={{ emptyText: "No hay datos" }}
      />

      {/* MODAL CREAR USUARIO */}
      <CreateUserModal
        visible={isModalUserOpen}
        onCancel={() => setIsModalUserOpen(false)}
        onSuccess={handleUserCreated}
      />

      {/* MODAL EDITAR USUARIO */}
      <EditUserModal
        visible={isEditModalOpen}
        onClose={closeEditModal}
        userId={editingUserId}
      />

      {/* MODAL CREAR EMPRESA (solo se abre si es admin => rol=2) */}
      <CreateCompanyModal
        visible={isModalCompanyOpen}
        onCancel={() => setIsModalCompanyOpen(false)}
        onSuccess={handleCompanyCreated}
        userId={selectedUserId}
        userName={selectedUserName}
      />

      {/* MODAL SELECCIONAR MÓDULOS (solo se abre tras crear empresa) */}
      <SelectModulesModal
        visible={isModalModulesOpen}
        onCancel={() => setIsModalModulesOpen(false)}
        onSuccess={handleModulesSelected}
        userId={selectedUserId}
        companyId={selectedCompanyId}
      />
    </div>
  );
};

export default Usuarios;
