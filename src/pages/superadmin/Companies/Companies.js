import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  message,
  Modal,
  Space,
  Table,
  Input,
  Select,
  Spin,
} from "antd";
import { AiOutlineSearch } from "react-icons/ai";
import { MdAdd } from "react-icons/md";
import axios from "axios";
import dayjs from "dayjs";
import { useAuth } from "../../../components/AuthContext";

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Componente para listar, crear y editar Companies.
 * Muestra un "Usuario Admin" que se encarga de la empresa (solo si eres Superadmin).
 */
function Companies() {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [companies, setCompanies] = useState([]);
  const [filterCompanies, setFilterCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(false);
  const [filters, setFilters] = useState({
    fechaCreatedRange: [null, null],
  });

  // ============================================
  //        ESTADOS para CREAR EMPRESA
  // ============================================
  const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
  const [loadingCreateCompany, setLoadingCreateCompany] = useState(false);
  const [companyCreate, setCompanyCreate] = useState({
    name: "",
    email: "",
    phone_contact: "",
    website: "",
    logo: "",
    user_id: "",
  });

  // ============================================
  //        ESTADOS para EDITAR EMPRESA
  // ============================================
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [loadingEditCompany, setLoadingEditCompany] = useState(false);
  const [companyEdit, setCompanyEdit] = useState({
    id: "",
    name: "",
    email: "",
    phone_contact: "",
    website: "",
    logo: "",
    user_id: "",
  });

  // Lista de usuarios administradores (rol=2)
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ============================================
  //            OBTENER DATOS (EFFECTS)
  // ============================================
  useEffect(() => {
    fetchCompanies();
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // ============================================
  //        GET /api/companies
  // ============================================
  const fetchCompanies = async () => {
    try {
      const resp = await axios.get(`${apiUrl}/companies`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (resp.data.status === "success") {
        setCompanies(resp.data.data);
        setFilterCompanies(resp.data.data);
      } else {
        message.error("Error al obtener las empresas");
      }
    } catch (error) {
      console.error("Error fetch companies", error);
      message.error("Error al obtener las empresas");
    }
  };

  // ============================================
  //       GET /api/users (filtrar rol=2?)
  // ============================================
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const resp = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const dataUsers = resp.data.data || [];
      // Filtrar solo rol=2 (admin), si tu sistema maneja eso
      const onlyAdmins = dataUsers.filter((u) => u.rol?.id === 2);
      setUsers(onlyAdmins);
    } catch (error) {
      console.error("Error fetch users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // ============================================
  //             CREAR EMPRESA
  // ============================================
  const openModalCreate = () => {
    setCompanyCreate({
      name: "",
      email: "",
      phone_contact: "",
      website: "",
      logo: "",
      user_id: "",
    });
    setIsModalOpenCreate(true);
  };

  const createCompany = async (data) => {
    setLoadingCreateCompany(true);
    try {
      const resp = await axios.post(`${apiUrl}/companies`, data, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return resp.data;
    } catch (error) {
      console.error("Error create company", error);
      return { status: "error", message: "Error en la petición" };
    } finally {
      setLoadingCreateCompany(false);
    }
  };

  const handleOkCreate = async () => {
    if (!companyCreate.name) {
      message.warn("El nombre de la empresa es obligatorio");
      return;
    }
    if (!companyCreate.user_id) {
      // Solo si tu sistema requiere 'user_id' para superadmin
      message.warn("Debes seleccionar un usuario administrador");
      return;
    }

    const result = await createCompany(companyCreate);
    if (result.status === "success") {
      message.success("Empresa creada con éxito", 2);
      setIsModalOpenCreate(false);
      fetchCompanies(); // recarga la lista
    } else {
      message.error(result.message || "Error al crear empresa");
    }
  };

  const handleCancelCreate = () => {
    setIsModalOpenCreate(false);
  };

  // ============================================
  //             EDITAR EMPRESA
  // ============================================
  const openEditModal = (record) => {
    setCompanyEdit({
      id: record.id,
      name: record.name || "",
      email: record.email || "",
      phone_contact: record.phone_contact || "",
      website: record.website || "",
      logo: record.logo || "",
      // user_id puede venir de record.admin?.id
      user_id: record.user_id || record.admin?.id || "",
    });
    setIsModalOpenEdit(true);
  };

  const updateCompany = async (id, data) => {
    setLoadingEditCompany(true);
    try {
      const resp = await axios.put(`${apiUrl}/companies/${id}`, data, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return resp.data;
    } catch (error) {
      console.error("Error update company", error);
      return { status: "error", message: "Error al actualizar empresa" };
    } finally {
      setLoadingEditCompany(false);
    }
  };

  const handleOkEdit = async () => {
    if (!companyEdit.name) {
      message.warn("El nombre de la empresa es obligatorio");
      return;
    }

    const dataToSend = {
      name: companyEdit.name,
      email: companyEdit.email,
      phone_contact: companyEdit.phone_contact,
      website: companyEdit.website,
      logo: companyEdit.logo,
      user_id: companyEdit.user_id,
    };

    const result = await updateCompany(companyEdit.id, dataToSend);
    if (result.status === "success") {
      message.success("Empresa actualizada con éxito", 2);
      setIsModalOpenEdit(false);
      fetchCompanies();
    } else {
      message.error(result.message || "Error al actualizar la empresa");
    }
  };

  const handleCancelEdit = () => {
    setIsModalOpenEdit(false);
  };

  // ============================================
  //    FILTROS (BUSQUEDA por Nombre/Email)
  // ============================================
  const applyFilters = () => {
    let filtered = [...filterCompanies];

    // Filtrar por búsqueda (nombre o email)
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      filtered = filtered.filter(
        (c) => regex.test(c.name) || regex.test(c.email)
      );
    }

    // Filtrar por rango de fecha (si lo deseas)
    const [start, end] = filters.fechaCreatedRange;
    if (start && end) {
      filtered = filtered.filter((c) => {
        if (!c.createdAt) return false;
        const fecha = dayjs(c.createdAt);
        return fecha.isBetween(start, end, "day", "[]");
      });
    }

    setCompanies(filtered);
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line
  }, [searchTerm, filters]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({ fechaCreatedRange: [null, null] });
    setCompanies([...filterCompanies]);
  };

  // ============================================
  //        COLUMNAS DE LA TABLA
  // ============================================
  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Contacto",
      dataIndex: "phoneContact",
      key: "phone_contact",
    },
    {
      title: "Usuario Admin",
      key: "user_id",
      render: (_, record) => {
        if (record.admin) {
          return record.admin.name || record.admin.email;
        }
        return "N/A";
      },
    },
    {
      title: "Fecha Creación",
      key: "createdAt",
      render: (_, record) => {
        if (!record.createdAt) return "N/A";
        return dayjs(record.createdAt).format("DD/MM/YYYY HH:mm");
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>
            Editar
          </Button>
          {/* 
            Ejemplo de Eliminar (Opcional):
            <Button
              type="link"
              danger
              onClick={() => handleDeleteCompany(record.id)}
            >
              Eliminar
            </Button>
          */}
        </Space>
      ),
    },
  ];

  // ============================================
  //            RENDER PRINCIPAL
  // ============================================
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Empresas</h2>
        <Button
          onClick={openModalCreate}
          icon={<MdAdd />}
          className="bg-blue-600 text-white"
        >
          Nueva Empresa
        </Button>
      </div>

      {/* Barra de búsqueda y botón Filtros */}
      <div className="flex gap-4 items-center mb-4">
        <Input
          style={{ width: 300 }}
          placeholder="Buscar empresa por nombre/email"
          prefix={<AiOutlineSearch />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={() => setActiveFilter(!activeFilter)}>Filtros</Button>
      </div>

      {/* Panel de filtros adicionales (rango de fechas) */}
      {activeFilter && (
        <div className="bg-white p-4 mb-4">
          <RangePicker
            style={{ marginRight: 8 }}
            value={filters.fechaCreatedRange}
            onChange={(dates) => setFilters({ fechaCreatedRange: dates })}
            placeholder={["Fecha Desde", "Fecha Hasta"]}
          />
          <Button onClick={applyFilters}>Buscar</Button>
          <Button onClick={handleClearFilters} style={{ marginLeft: 8 }}>
            Limpiar
          </Button>
        </div>
      )}

      {/* Tabla de empresas */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={companies}
        pagination={false}
        locale={{ emptyText: "No hay empresas registradas" }}
      />

      {/* ===================================================== */}
      {/* MODAL CREAR EMPRESA                                   */}
      {/* ===================================================== */}
      <Modal
        title="Crear Empresa"
        open={isModalOpenCreate}
        onCancel={handleCancelCreate}
        onOk={handleOkCreate}
        confirmLoading={loadingCreateCompany}
      >
        {loadingUsers ? (
          <Spin />
        ) : (
          <div className="grid gap-3">
            {/* Seleccionar usuario admin (si eres superadmin) */}
            <div>
              <label>Usuario Admin</label>
              <Select
                style={{ width: "100%" }}
                placeholder="Selecciona el usuario"
                value={companyCreate.user_id}
                onChange={(val) =>
                  setCompanyCreate({ ...companyCreate, user_id: val })
                }
              >
                {users.map((u) => (
                  <Option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label>Nombre</label>
              <Input
                placeholder="Nombre de la empresa"
                value={companyCreate.name}
                onChange={(e) =>
                  setCompanyCreate({
                    ...companyCreate,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label>Email de la Empresa</label>
              <Input
                placeholder="Email de contacto"
                value={companyCreate.email}
                onChange={(e) =>
                  setCompanyCreate({
                    ...companyCreate,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label>Teléfono de la empresa</label>
              <Input
                placeholder="Tel. de contacto"
                value={companyCreate.phone_contact}
                onChange={(e) =>
                  setCompanyCreate({
                    ...companyCreate,
                    phone_contact: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label>Sitio Web</label>
              <Input
                placeholder="https://..."
                value={companyCreate.website}
                onChange={(e) =>
                  setCompanyCreate({
                    ...companyCreate,
                    website: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label>Logo (URL)</label>
              <Input
                placeholder="https://..."
                value={companyCreate.logo}
                onChange={(e) =>
                  setCompanyCreate({
                    ...companyCreate,
                    logo: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ===================================================== */}
      {/* MODAL EDITAR EMPRESA                                  */}
      {/* ===================================================== */}
      <Modal
        title="Editar Empresa"
        open={isModalOpenEdit}
        onCancel={handleCancelEdit}
        onOk={handleOkEdit}
        confirmLoading={loadingEditCompany}
      >
        {loadingUsers ? (
          <Spin />
        ) : (
          <div className="grid gap-3">
            {/* Usuario admin (solo superadmin lo cambiaría) */}
            <div>
              <label>Usuario Admin</label>
              <Select
                style={{ width: "100%" }}
                placeholder="Selecciona el usuario"
                value={companyEdit.user_id}
                onChange={(val) =>
                  setCompanyEdit({ ...companyEdit, user_id: val })
                }
              >
                {users.map((u) => (
                  <Option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label>Nombre</label>
              <Input
                placeholder="Nombre de la empresa"
                value={companyEdit.name}
                onChange={(e) =>
                  setCompanyEdit({
                    ...companyEdit,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label>Email de la Empresa</label>
              <Input
                placeholder="Email de contacto"
                value={companyEdit.email}
                onChange={(e) =>
                  setCompanyEdit({
                    ...companyEdit,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label>Teléfono de la empresa</label>
              <Input
                placeholder="Tel. de contacto"
                value={companyEdit.phone_contact}
                onChange={(e) =>
                  setCompanyEdit({
                    ...companyEdit,
                    phone_contact: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label>Sitio Web</label>
              <Input
                placeholder="https://..."
                value={companyEdit.website}
                onChange={(e) =>
                  setCompanyEdit({
                    ...companyEdit,
                    website: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label>Logo (URL)</label>
              <Input
                placeholder="https://..."
                value={companyEdit.logo}
                onChange={(e) =>
                  setCompanyEdit({
                    ...companyEdit,
                    logo: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Companies;
