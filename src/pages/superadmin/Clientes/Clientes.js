// file: src/pages/superadmin/Usuarios.jsx
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

// Tus componentes
import CreateCompanyModal from "../../../components/rolSuperAdmin/Usuarios/CreateCompanyModal";
import SubscriptionDetailModal from "../../../components/rolSuperAdmin/SubscriptionDetailModal";
import { useAuth } from "../../../components/AuthContext";
import { useNavigate } from "react-router-dom";
import EditUserModal from "../../../components/rolSuperAdmin/Clientes/EditClientesModal";
import CreateUserModal from "../../../components/rolSuperAdmin/Clientes/CreateClientesModal";
import SelectModulesModal from "../../../components/rolSuperAdmin/Clientes/SelectModulesModalClientes";

const { RangePicker } = DatePicker;

const Clientes = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Estados
  const [usuarios, setUsuarios] = useState([]);
  const [filterUsuarios, setFilterUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(false);
  const [filters, setFilters] = useState({
    fechaCreatedRange: [null, null],
  });

  // SubscriptionDetailModal
  const [isSubDetailOpen, setIsSubDetailOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState(null);

  // Creación usuario/empresa/módulos
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState(""); // <--- nuevo
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // Modales
  const [isModalUserOpen, setIsModalUserOpen] = useState(false);
  const [isModalCompanyOpen, setIsModalCompanyOpen] = useState(false);
  const [isModalModulesOpen, setIsModalModulesOpen] = useState(false);

  // Edición de usuario
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // Cargar usuarios
  const fetchUsuarios = async () => {
    try {
      const resp = await axios.get(`${apiUrl}/users`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const data = resp.data.data || [];

      // Filtrar solo rol=2 (admin) o rol=3 (prospect)
      const filtrados = data.filter((u) => {
        const roleId = u.rol?.id;
        return roleId === 2 || roleId === 3;
      });

      setUsuarios(filtrados);
      setFilterUsuarios(filtrados);
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
   * handleUserCreated
   * Recibe: newUserId, newUserName => 1) cierra modal, 2) recarga, 3) abre modal crear empresa
   */
  const handleUserCreated = (newUserId, newUserName) => {
    message.success("Usuario creado con éxito");
    setIsModalUserOpen(false);
    fetchUsuarios();

    setSelectedUserId(newUserId);
    setSelectedUserName(newUserName || "");
    setIsModalCompanyOpen(true);
  };

  // handleCompanyCreated => cierra modal empresa, abre modal seleccionar módulos
  const handleCompanyCreated = (newCompanyId) => {
    message.success("Empresa creada con éxito");
    setIsModalCompanyOpen(false);
    setSelectedCompanyId(newCompanyId);
    setIsModalModulesOpen(true);
  };

  // handleModulesSelected => cierra modal seleccionar módulos
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

  // Limpiar filtros
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

  // Abrir modal detalle suscripción
  const openSubscriptionDetailModal = (userId) => {
    setDetailUserId(userId);
    setIsSubDetailOpen(true);
  };

  // Columnas de la tabla
  const columns = [
    {
      title: "No.",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 50,
    },
    {
      title: "Nombre Cliente",
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
        const roleId = record.rol?.id;
        if (roleId === 2) return "Cliente";
        if (roleId === 3) return "Prospecto";
        return "Otro";
      },
    },
    {
      title: "Fecha Creación",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => (val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "N/A"),
    },
    {
      title: "Empresas",
      key: "empresas",
      render: (_, record) => {
        if (!record.companies || record.companies.length === 0) {
          return "N/A";
        }
        // Si hay varias, se muestran separadas por coma
        return record.companies.map((c) => c.name).join(", ");
      },
    },
    {
      title: "Estado",
      key: "estado",
      render: (_, record) => {
        if (!record.subscription) {
          return "Sin suscripción";
        }
        return record.subscription.status; // "trialing", "active", "expired", etc.
      },
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
                    onOk: () => {
                      axios
                        .delete(`${apiUrl}/users/${record.id}`, {
                          headers: { Authorization: `Bearer ${auth.token}` },
                        })
                        .then(() => {
                          message.success("Usuario eliminado");
                          fetchUsuarios();
                        })
                        .catch((err) => {
                          console.error("Error al eliminar usuario:", err);
                          message.error("No se pudo eliminar el usuario");
                        });
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
                  navigate(`/clientes/detalle/${record.id}`);
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
          <div className="font-bold text-xl">Clientes</div>
          <div className="max-w-[30vw] text-xs text-gray-500">
            Lista de tus Clientes
          </div>
        </div>
        <div className="bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="icon bg-light-purple p-4 rounded text-dark-purple">
              <FaUserCog />
            </div>
            <div>
              <div className="font-bold text-xl">{usuarios.length}</div>
              <div className="text-sm text-light-font">Total Clientes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
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
            Nuevo Cliente
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

      {/* MODALES */}
      <CreateUserModal
        visible={isModalUserOpen}
        onCancel={() => setIsModalUserOpen(false)}
        onSuccess={handleUserCreated} // Recibe (newUserId, newUserName)
      />

      <EditUserModal
        visible={isEditModalOpen}
        onClose={closeEditModal}
        userId={editingUserId}
      />

      <CreateCompanyModal
        visible={isModalCompanyOpen}
        onCancel={() => setIsModalCompanyOpen(false)}
        onSuccess={handleCompanyCreated}
        // PASAMOS EL userId y userName
        userId={selectedUserId}
        userName={selectedUserName}
      />

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

export default Clientes;
