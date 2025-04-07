// src/pages/rrhh/PanelRRHH.jsx
import React from "react";
import { Tabs } from "antd";

// Importamos nuestros sub-componentes
import CandidatosRRHH from "./CandidatosRRHH";
import EmpleadosRRHH from "./EmpleadosRRHH";

export default function PanelRRHH() {
  return (
    <div style={{ padding: 20 }}>
      <h2 className="text-2xl">Control de personal del módulo RRHH</h2>
      <Tabs defaultActiveKey="candidatos">
        <Tabs.TabPane tab="Candidatos" key="candidatos">
          <CandidatosRRHH />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Empleados" key="empleados">
          <EmpleadosRRHH />
        </Tabs.TabPane>

        {/*  <Tabs.TabPane tab="Capacitación" key="training">
        //   <TrainingIndexRRHH />
        // </Tabs.TabPane> */}
      </Tabs>
    </div>
  );
}
