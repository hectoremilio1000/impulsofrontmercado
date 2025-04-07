// src/pages/rrhh/EmployeeTrainingPaths.jsx
import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

export default function EmployeeTrainingPaths() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  // OPCIÓN A: mostrar TODAS las asignaciones
  //   => GET /api/employee-training-paths?all=true (si tuvieras un endpoint así)
  //   => O no lo tienes, y hacemos un workaround.
  //   => De momento te muestro un "for" con employees o algo,
  //      pero lo normal es que tengas un endpoint custom.

  // OPCIÓN B: mostrar las asignaciones de un employee fijo
  //   => GET /api/employees/:id/training-paths
  //   => Tendrías que decidir a qué employee se lo pides

  // Para DEMO, supongamos "vemos todas las asignaciones de un employee con id=1"
  const employeeIdDemo = 1;

  useEffect(() => {
    fetchEmployeeAssignments(employeeIdDemo);
  }, []);

  const fetchEmployeeAssignments = async (empId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${apiUrl}/employees/${empId}/training-paths`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.status === "success") {
        setAssignments(res.data.data); // array de EmployeeTrainingPath
      } else {
        message.error("Error al obtener asignaciones");
      }
    } catch (error) {
      console.error("Error al obtener asignaciones:", error);
      message.error("Error de servidor al obtener asignaciones");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID Asignación",
      dataIndex: "id",
      width: 100,
    },
    {
      title: "Estado",
      dataIndex: "status",
      width: 120,
    },
    {
      title: "Ruta",
      render: (_, record) => record.trainingPath?.title || "N/A",
    },
    {
      title: "Módulos en esa ruta",
      render: (_, record) => record.trainingPath?.modules?.length || 0,
    },
  ];

  return (
    <div>
      <h3>Rutas Asignadas al Empleado ID {employeeIdDemo}</h3>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={assignments}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />
    </div>
  );
}
