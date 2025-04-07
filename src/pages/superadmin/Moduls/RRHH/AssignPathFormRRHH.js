// src/pages/rrhh/AssignPathForm.jsx
import React, { useEffect, useState } from "react";
import { Button, Select, message } from "antd";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

const { Option } = Select;

export default function AssignPathForm() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [employees, setEmployees] = useState([]);
  const [paths, setPaths] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [pathId, setPathId] = useState("");

  useEffect(() => {
    loadEmployees();
    loadPaths();
  }, []);

  const loadEmployees = async () => {
    try {
      const companyId = 1; // ajusta según tu caso
      const res = await axios.get(
        `${apiUrl}/companies/${companyId}/employees`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.status === "success") {
        setEmployees(res.data.data);
      }
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  const loadPaths = async () => {
    try {
      const res = await axios.get(`${apiUrl}/training-paths`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setPaths(res.data.data);
      }
    } catch (error) {
      console.error("Error al cargar paths:", error);
    }
  };

  const handleAssign = async () => {
    if (!employeeId || !pathId) {
      message.warning("Selecciona un empleado y una ruta primero");
      return;
    }
    try {
      const res = await axios.post(
        `${apiUrl}/employee-training-paths/assign`,
        {
          employee_id: employeeId,
          training_path_id: pathId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.status === "success") {
        message.success("Ruta asignada correctamente!");
      } else {
        message.error(res.data.message || "Error al asignar");
      }
    } catch (error) {
      console.error("Error al asignar ruta:", error);
      message.error("Error de servidor al asignar ruta");
    }
  };

  return (
    <div>
      <h3>Asignar Ruta a Empleado</h3>
      <div style={{ marginBottom: 16 }}>
        <label>Empleado: </label>
        <Select
          style={{ width: 200 }}
          placeholder="Selecciona empleado"
          value={employeeId}
          onChange={(val) => setEmployeeId(val)}
        >
          {employees.map((emp) => (
            <Option key={emp.id} value={emp.id}>
              {emp.name} ({emp.position})
            </Option>
          ))}
        </Select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Ruta: </label>
        <Select
          style={{ width: 200 }}
          placeholder="Selecciona ruta"
          value={pathId}
          onChange={(val) => setPathId(val)}
        >
          {paths.map((p) => (
            <Option key={p.id} value={p.id}>
              {p.title}
            </Option>
          ))}
        </Select>
      </div>
      <Button type="primary" onClick={handleAssign}>
        Asignar
      </Button>
    </div>
  );
}
