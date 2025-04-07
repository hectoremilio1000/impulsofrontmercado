// src/pages/superadmin/Moduls/RRHH/EmployeeTrainingDetail.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import { Spin, message } from "antd";
import { useAuth } from "../../../../components/AuthContext";

export default function EmployeeTrainingDetail() {
  const { auth } = useAuth();
  const { id: employeeId } = useParams(); // /panelrrhh/training/employee/:id
  const [loading, setLoading] = useState(false);
  const [trainingData, setTrainingData] = useState([]);

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const fetchTrainingData = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/employees/${employeeId}/showTraining`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setTrainingData(resp.data.data || []);
    } catch (error) {
      console.error(error);
      message.error("Error cargando la capacitación del empleado");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <div>
      <h2>Detalle de Capacitación del Empleado #{employeeId}</h2>
      {/* A partir de trainingData que tiene la estructura de assignedPaths, modules, lessons, progress, etc. */}
      {trainingData.map((ap) => (
        <div key={ap.id} style={{ border: "1px solid #ccc", marginBottom: 10 }}>
          <h3>
            Ruta: {ap.trainingPath?.title} - status: {ap.status}
          </h3>
          {ap.trainingPath?.modules?.map((mod) => (
            <div key={mod.id} style={{ marginLeft: 20 }}>
              <p>
                {" "}
                Módulo: {mod.title} | estado:{" "}
                {mod.moduleProgress?.status || "N/A"}{" "}
              </p>
              <ul>
                {mod.lessons?.map((lesson) => (
                  <li key={lesson.id}>
                    {lesson.title}{" "}
                    {lesson.viewedAt
                      ? `(Visto en ${lesson.viewedAt})`
                      : `(Pendiente)`}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
