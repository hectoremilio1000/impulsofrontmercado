// src/pages/superadmin/Moduls/RRHH/PanelManualesRRHH.jsx

import React, { useState } from "react";
import { Tabs } from "antd";
import WizardManuales from "../../../../../components/rolSuperAdmin/RRHH/Manuales/WizardManuales";
import TabAsignarManuales from "../../../../../components/rolSuperAdmin/RRHH/Manuales/PanelManualesSuperAdmin";
const { TabPane } = Tabs;

function PanelManualesRRHH() {
  const [activeKey, setActiveKey] = useState("1");

  return (
    <div style={{ padding: 20 }}>
      <h2 className="text-2xl">Panel de Manuales (RRHH)</h2>
      <Tabs activeKey={activeKey} onChange={(key) => setActiveKey(key)}>
        <TabPane tab="Crear / Editar Manuales" key="1">
          {/* 
            WizardManuales es la pestaña 1
            Puedes pasarle props si deseas 
          */}
          <WizardManuales />
        </TabPane>

        <TabPane tab="Panel Manuales" key="2">
          {/* 
            TabAsignarManuales es la pestaña 2
            Aquí filtras y asignas 
          */}
          <TabAsignarManuales />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default PanelManualesRRHH;
