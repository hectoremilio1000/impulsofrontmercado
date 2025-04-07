// src/pages/administrador/EmpleadosAdmin.jsx
import React, { useEffect, useState } from "react";
import { Table, Input, Button, Dropdown, Modal, Space, message } from "antd";
import { AiOutlineSearch } from "react-icons/ai";
import { FaTrash, FaEdit, FaEllipsisV } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import axios from "axios";
import dayjs from "dayjs";
import { useAuth } from "../../components/AuthContext";
import CreateEmployeeModal from "../../components/rolAdmin/EmployeeAdmin/CreateEmployeeModalAdmin";
import EditEmployeeModal from "../../components/rolAdmin/EmployeeAdmin/EditEmployeeModal";

const EmpleadosAdmin = () => {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(false);

  // Lista de empleados acumulados de TODAS las compañías del admin
  const [employees, setEmployees] = useState([]);
  // Para filtrar/buscar
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Para abrir/cerrar modal de crear empleado
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // Para abrir/cerrar modal de editar empleado
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null); // objeto con data del empleado que editamos

  // ------------------------------------------------------------
  // 1) Al montar, cargamos TODOS los empleados de las compañías
  // ------------------------------------------------------------
  useEffect(() => {
    fetchAllEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllEmployees = async () => {
    try {
      setLoading(true);

      // 1. Tomamos todas las compañías del user
      const companies = auth.user?.companies || [];
      console.log("[EmpleadosAdmin] Las compañías del admin =>", companies);

      // 2. Para cada company.id, obtenemos sus empleados
      const allEmployees = [];
      for (const comp of companies) {
        const resp = await axios.get(
          `${apiUrl}/companies/${comp.id}/employees`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        // Accumular
        const data = resp.data.data || resp.data || [];
        data.forEach((emp) => {
          // Agregamos un campo "companyId" para saber a qué empresa pertenece
          emp.companyId = comp.id;
        });
        allEmployees.push(...data);
      }

      console.log("[EmpleadosAdmin] Empleados totales =>", allEmployees);
      setEmployees(allEmployees);
      setFilteredEmployees(allEmployees);
    } catch (error) {
      console.error("[EmpleadosAdmin] Error fetchAllEmployees =>", error);
      message.error("Hubo un error al cargar empleados.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // 2) Filtrar cuando cambia searchTerm
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!searchTerm) {
      setFilteredEmployees(employees);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const result = employees.filter(
        (emp) =>
          emp.name?.toLowerCase().includes(lowerSearch) ||
          emp.email?.toLowerCase().includes(lowerSearch)
      );
      setFilteredEmployees(result);
    }
  }, [searchTerm, employees]);

  // ----------------------------------------------------------------
  // 3) Manejo de Crear Empleado
  // ----------------------------------------------------------------
  const handleCreateEmployeeSuccess = () => {
    message.success("Empleado creado exitosamente");
    setIsCreateModalOpen(false);
    // Recargar tabla
    fetchAllEmployees();
  };

  // ----------------------------------------------------------------
  // 4) Manejo de Editar Empleado
  // ----------------------------------------------------------------
  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };
  const handleEditEmployeeSuccess = () => {
    message.success("Empleado actualizado exitosamente");
    setIsEditModalOpen(false);
    setEditingEmployee(null);
    fetchAllEmployees();
  };

  // ----------------------------------------------------------------
  // 5) Manejo de Eliminar Empleado
  // ----------------------------------------------------------------
  const handleDeleteEmployee = (employee) => {
    Modal.confirm({
      title: "¿Estás seguro de eliminar este empleado?",
      content: `Se eliminará al empleado "${employee.name}". Esta acción no se puede deshacer.`,
      onOk: async () => {
        try {
          setLoading(true);
          await axios.delete(
            `${apiUrl}/companies/${employee.companyId}/employees/${employee.id}`,
            {
              headers: { Authorization: `Bearer ${auth.token}` },
            }
          );
          message.success("Empleado eliminado exitosamente");
          fetchAllEmployees();
        } catch (error) {
          console.error("[EmpleadosAdmin] Error al eliminar =>", error);
          message.error("No se pudo eliminar el empleado.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // ----------------------------------------------------------------
  // 6) Definir columnas de la tabla
  // ----------------------------------------------------------------
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
      render: (val) => val || "N/A",
    },
    {
      title: "Puesto",
      dataIndex: "position",
      key: "uesto",
      render: (val) => val || "N/A",
    },
    {
      title: "Whatsapp",
      dataIndex: "phone",
      key: "phone",
      render: (val) => val || "N/A",
    },
    {
      title: "Fecha Creación",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A"),
    },
    {
      title: "Empresa",
      key: "company",
      render: (_, emp) => emp.company?.name || "ID: " + emp.companyId,
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
                onClick={() => openEditModal(record)}
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
                onClick={() => handleDeleteEmployee(record)}
                className="w-full text-left flex items-center gap-2 text-sm text-red-500"
              >
                <FaTrash /> Eliminar
              </button>
            ),
            key: "2",
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="text-xs w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all duration-300 cursor-pointer">
              <Space>
                <FaEllipsisV />
              </Space>
            </div>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="w-full bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Empleados</h2>
        <Button
          className="bg-dark-purple text-white flex items-center gap-1"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <MdAdd />
          Nuevo Empleado
        </Button>
      </div>

      <div className="flex items-center mb-4">
        <Input
          style={{ maxWidth: 250 }}
          placeholder="Buscar empleado"
          prefix={<AiOutlineSearch />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredEmployees}
        loading={loading}
        locale={{ emptyText: "No hay empleados aún" }}
      />

      {/* Modal Crear Empleado */}
      <CreateEmployeeModal
        visible={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateEmployeeSuccess}
      />

      {/* Modal Editar Empleado */}
      {editingEmployee && (
        <EditEmployeeModal
          visible={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          onSuccess={handleEditEmployeeSuccess}
          employeeData={editingEmployee}
        />
      )}
    </div>
  );
};

export default EmpleadosAdmin;
