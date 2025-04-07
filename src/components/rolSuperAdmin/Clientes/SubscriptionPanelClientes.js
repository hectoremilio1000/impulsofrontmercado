import React from "react";
import { Descriptions, Table, Button } from "antd";
import dayjs from "dayjs";

// IMPORTA el componente del historial
import PlanChangeHistory from "./PlanChangeHistoryClientes";

function SubscriptionPanel({ subscription, onChangePlan, onChangeModules }) {
  if (!subscription) {
    return <p>El usuario no tiene suscripción activa.</p>;
  }

  const plan = subscription.plan;
  const modulesData = subscription.modules || [];

  const modulesColumns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },
  ];

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">
          Suscripción ID: {subscription.id}
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          {/* Botón para cambiar plan */}
          <Button type="primary" onClick={onChangePlan}>
            Cambiar Plan
          </Button>
          {/* Botón para cambiar módulos */}
          <Button onClick={onChangeModules}>Cambiar Módulos</Button>
        </div>
      </div>

      <Descriptions
        bordered
        column={2}
        size="small"
        labelStyle={{ fontWeight: "bold" }}
      >
        <Descriptions.Item label="Plan">
          {plan ? plan.name : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {subscription.status}
        </Descriptions.Item>
        <Descriptions.Item label="Inicio">
          {dayjs(subscription.startDate).format("DD/MM/YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Fin">
          {dayjs(subscription.endDate).format("DD/MM/YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Costo">
          {plan ? plan.price : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Coaching Total (Plan)">
          {plan ? plan.coachingIncluded : "N/A"}
        </Descriptions.Item>
      </Descriptions>

      <h4 className="mt-4 font-medium mb-2">Módulos Asignados</h4>
      <Table
        rowKey="id"
        dataSource={modulesData}
        columns={modulesColumns}
        size="small"
        pagination={false}
      />

      {/* Aquí agregas el Historial de Cambios de Plan */}
      <div style={{ marginTop: "1rem" }}>
        <PlanChangeHistory subscriptionId={subscription.id} />
      </div>
    </div>
  );
}

export default SubscriptionPanel;
