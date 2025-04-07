// CoachingSessionsPanel.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import CoachingSessionModal from "./CoachingSessionModal";

function CoachingSessionsPanel({ subscription }) {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);

  const subscriptionId = subscription?.id;

  useEffect(() => {
    if (!subscriptionId) return;
    fetchSessions();
    // eslint-disable-next-line
  }, [subscriptionId]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(
        `${apiUrl}/coaching-sessions?subscription_id=${subscriptionId}`
      );
      const data = resp.data.data || [];
      setSessions(data);
      groupByMonth(data);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar las sesiones de coaching");
    } finally {
      setLoading(false);
    }
  };

  const groupByMonth = (sessionsData) => {
    // Si existe subscription.start_date, lo usamos; si no, 6 meses atrás
    const startDate = subscription?.start_date
      ? dayjs(subscription.start_date).startOf("month")
      : dayjs().subtract(6, "month").startOf("month");

    const endDate = dayjs().endOf("month");

    // Generar lista de meses
    const monthsRange = [];
    let current = startDate.clone();
    while (current.isBefore(endDate) || current.isSame(endDate, "month")) {
      monthsRange.push(current.format("YYYY-MM"));
      current = current.add(1, "month");
    }

    // usageMap con contadores iniciales = 0
    const usageMap = {};
    monthsRange.forEach((m) => {
      usageMap[m] = {
        presencial: 0,
        virtual: 0,
        total: 0,
        sessions: [],
      };
    });

    // En groupByMonth
    sessionsData.forEach((s) => {
      const monthKey = dayjs(s.sessionDate).format("YYYY-MM");
      if (!usageMap[monthKey]) return;

      usageMap[monthKey].sessions.push(s);

      // Convierte s.hours a un número seguro (0 si no es válido)
      const hoursNum = parseFloat(s.hours) || 0;

      if (s.type === "presencial") {
        usageMap[monthKey].presencial += hoursNum;
      } else {
        usageMap[monthKey].virtual += hoursNum;
      }
      usageMap[monthKey].total += hoursNum;
    });

    // Convertir en array para la tabla
    const monthlyRows = monthsRange.map((m) => ({
      key: m,
      month: m,
      plan: subscription?.plan ? subscription.plan.name : "Sin plan",
      presencial: usageMap[m].presencial,
      virtual: usageMap[m].virtual,
      total: usageMap[m].total,
      // Sub-filas (sesiones)
      children: usageMap[m].sessions.map((sess) => ({
        key: `session-${sess.id}`,
        sessionDate: sess.sessionDate,
        type: sess.type,
        hours: sess.hours,
        raw: sess,
      })),
    }));

    setMonthlyData(monthlyRows);
  };

  const handleDelete = async (sessionId) => {
    Modal.confirm({
      title: "¿Eliminar sesión de coaching?",
      content: "Esta acción no se puede deshacer",
      onOk: async () => {
        try {
          await axios.delete(`${apiUrl}/coaching-sessions/${sessionId}`);
          message.success("Sesión eliminada");
          fetchSessions();
        } catch (error) {
          console.error(error);
          message.error("No se pudo eliminar la sesión");
        }
      },
    });
  };

  const openCreateModal = () => {
    setEditSession(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sessionRaw) => {
    setEditSession(sessionRaw);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditSession(null);
  };

  const onSaved = () => {
    closeModal();
    fetchSessions();
  };

  // Columnas de la tabla principal
  const columns = [
    {
      title: "Mes",
      dataIndex: "month",
      key: "month",
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
    },
    {
      title: "Presencial (hrs)",
      dataIndex: "presencial",
      key: "presencial",
      // 1 decimal
      render: (val) => Number(val || 0).toFixed(1),
    },
    {
      title: "Virtual (hrs)",
      dataIndex: "virtual",
      key: "virtual",
      render: (val) => Number(val || 0).toFixed(1),
    },
    {
      title: "Total (hrs)",
      dataIndex: "total",
      key: "total",
      render: (val) => Number(val || 0).toFixed(1),
    },
  ];

  // Columnas de la tabla expandida (sesiones del mes)
  const expandedRowRender = (record) => {
    const sessionColumns = [
      {
        title: "Fecha/Hora",
        dataIndex: "sessionDate",
        key: "sessionDate",
        render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
      },
      {
        title: "Tipo",
        dataIndex: "type",
        key: "type",
      },
      {
        title: "Horas",
        dataIndex: "hours",
        key: "hours",
        render: (val) => Number(val || 0).toFixed(1),
      },
      {
        title: "Acciones",
        key: "acciones",
        render: (_, row) => (
          <>
            <Button size="small" onClick={() => openEditModal(row.raw)}>
              Editar
            </Button>
            <Button
              danger
              size="small"
              style={{ marginLeft: 8 }}
              onClick={() => handleDelete(row.raw.id)}
            >
              Eliminar
            </Button>
          </>
        ),
      },
    ];

    return (
      <Table
        columns={sessionColumns}
        dataSource={record.children}
        pagination={false}
        rowKey="key"
      />
    );
  };

  if (!subscriptionId) {
    return <p>Sin suscripción válida</p>;
  }

  return (
    <div>
      <div className="flex justify-between mb-2">
        <h4>Sesiones de Coaching - Resumen por Mes</h4>
        <Button type="primary" onClick={openCreateModal}>
          Crear Sesión
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={monthlyData}
        loading={loading}
        pagination={false}
        rowKey="key"
        expandable={{
          childrenColumnName: "children",
          expandedRowRender,
        }}
      />

      {isModalOpen && (
        <CoachingSessionModal
          subscriptionId={subscriptionId}
          visible={isModalOpen}
          onCancel={closeModal}
          onSaved={onSaved}
          editSession={editSession}
        />
      )}
    </div>
  );
}

export default CoachingSessionsPanel;
