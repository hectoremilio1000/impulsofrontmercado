import React, { useEffect, useState } from "react";
import { Button, Table, message } from "antd";
import axios from "axios";
import { useAuth } from "../../../../../components/AuthContext";

export default function EmpleadosRRHH() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;
  const roleId = auth?.user?.rol_id;

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Efecto inicial
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      if (roleId === 1) {
        endpoint = `${apiUrl}/employees`; // superadmin => todos
      } else {
        endpoint = `${apiUrl}/employees`; // o a tu gusto
      }

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setEmployees(res.data.data);
      } else {
        message.error("Error al obtener empleados");
      }
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      message.error("Error de servidor al obtener empleados");
    } finally {
      setLoading(false);
    }
  };

  // Aquí definimos las funciones que las columnas usan
  const handleViewTraining = (employeeId) => {
    message.info(`Ver capacitación del empleado con id=${employeeId}`);
    // Podrías hacer un navigate o abrir un modal
  };

  const handleEditEmployee = (employeeRecord) => {
    message.info(`Editar al empleado: ${employeeRecord.name}`);
    // Podrías mostrar un formulario modal o redirigir
  };

  const handleDeleteEmployee = async (employeeId) => {
    message.info(`Eliminar empleado id=${employeeId}`);
    // Podrías hacer un confirm y luego DELETE /api/companies/X/employees/:id
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Nombre", dataIndex: "name", width: 150 },
    { title: "Email", dataIndex: "email", width: 200 },
    {
      title: "Teléfono",
      dataIndex: "phone",
      width: 130,
      render: (val) => (val ? <a href={`tel:${val}`}>{val}</a> : "N/A"),
    },
    { title: "Puesto", dataIndex: "position", width: 120 },
    {
      title: "Compañía",
      render: (_, record) => record.company?.name || "Sin empresa",
      width: 150,
    },
    {
      title: "Fecha Alta",
      dataIndex: "createdAt",
      width: 160,
      render: (val) => {
        if (!val) return "N/A";
        const fecha = new Date(val);
        return fecha.toLocaleDateString("es-MX", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      title: "Acciones",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="small" onClick={() => handleViewTraining(record.id)}>
            Capacitación
          </Button>
          <Button size="small" onClick={() => handleEditEmployee(record)}>
            Editar
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleDeleteEmployee(record.id)}
          >
            Borrar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2>Lista de Empleados</h2>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={employees}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}
