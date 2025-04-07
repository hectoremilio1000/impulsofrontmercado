import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, message } from "antd";
import dayjs from "dayjs";

function PlanChangeHistory({ subscriptionId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!subscriptionId) return;
    fetchData();
    // eslint-disable-next-line
  }, [subscriptionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Ajusta la URL según tu backend
      //   (ej. si tu baseURL está en un .env, puedes usar `${apiUrl}/subscriptions/...`)
      const resp = await axios.get(
        `${apiUrl}/subscriptions/${subscriptionId}/plan-changes`
      );
      setData(resp.data.data);
    } catch (error) {
      console.error(error);
      message.error("No se pudo cargar el historial de cambios de plan");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Fecha",
      dataIndex: "changedAt",
      key: "changedAt",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Plan Anterior",
      dataIndex: ["oldPlan", "name"],
      key: "oldPlanName",
      render: (value, record) => {
        return record.oldPlan ? record.oldPlan.name : "-";
      },
    },
    {
      title: "Plan Nuevo",
      dataIndex: ["newPlan", "name"],
      key: "newPlanName",
      render: (value, record) => {
        return record.newPlan ? record.newPlan.name : "-";
      },
    },
  ];

  return (
    <div>
      <h4>Historial de Cambios de Plan</h4>
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
      />
    </div>
  );
}

export default PlanChangeHistory;
