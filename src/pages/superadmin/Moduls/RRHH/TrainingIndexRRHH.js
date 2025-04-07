// src/pages/rrhh/TrainingIndexRRHH.jsx
import React, { useState } from "react";
import { Tabs } from "antd";

import EmployeeTrainingPaths from "./EmployeeTrainingPathsRRHH";
import TrainingPathsList from "./TrainingPathsListRRHH";
import AssignPathForm from "./AssignPathFormRRHH";

export default function TrainingIndexRRHH() {
  const [activeKey, setActiveKey] = useState("paths");

  return (
    <div>
      <h2>Capacitación (Training)</h2>
      <Tabs activeKey={activeKey} onChange={(k) => setActiveKey(k)}>
        <Tabs.TabPane tab="Rutas (Paths)" key="paths">
          <TrainingPathsList />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Asignar Ruta" key="assign">
          <AssignPathForm />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Ver Rutas Asignadas" key="assigned">
          <EmployeeTrainingPaths />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
