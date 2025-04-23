// src/pages/superadmin/Moduls/RRHH/PanelChecklistsRRHH.jsx
import React, { useState } from "react";
import { Tabs } from "antd";
import WizardChecklists from "../../../../../components/rolSuperAdmin/RRHH/Checklists/WizardChecklists";
import PanelChecklistsSuperAdmin from "../../../../../components/rolSuperAdmin/RRHH/Checklists/PanelChecklistsSuperAdmin";

const items = [
  {
    key: "1",
    label: "Crear / Editar Checklists",
    children: <WizardChecklists />,
  },
  {
    key: "2",
    label: "Panel Checklists",
    children: <PanelChecklistsSuperAdmin />,
  },
];

export default function PanelChecklistsRRHH() {
  return (
    <div style={{ padding: 20 }}>
      <h2 className="text-2xl">Panel de Checklists (RRHH)</h2>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}
