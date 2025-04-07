import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Input, message } from "antd";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import dayjs from "dayjs";

function Pagos() {
  const { auth } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para el Modal de cobro manual
  const [isModalManualOpen, setIsModalManualOpen] = useState(false);
  const [manualPaymentData, setManualPaymentData] = useState({
    subscription_id: null,
    amount: 0,
    transaction_number: "",
    payment_date: "",
    method_payment: "cash",
  });

  const apiUrl = process.env.REACT_APP_API_URL;

  // 1. Cargar suscripciones
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${apiUrl}/subscriptions`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      // La "data" vendrá en resp.data.data?
      // Asegúrate que en tu backend devuelvas "subs" con user y plan preloaded
      // o al menos subscription => (user_id, plan_id).
      setSubscriptions(resp.data.data || []);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar suscripciones");
    } finally {
      setLoading(false);
    }
  };

  // 2. Al montar el componente, cargamos
  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line
  }, []);

  // 3. Manejo “Suspender” manual
  const handleSuspend = async (sub) => {
    // sub => subscription object
    Modal.confirm({
      title: `¿Suspender suscripción de ${sub.user_id}?`,
      onOk: async () => {
        try {
          await axios.put(
            `${apiUrl}/subscriptions/${sub.id}`,
            { status: "suspended" },
            { headers: { Authorization: `Bearer ${auth.token}` } }
          );
          message.success("Suscripción suspendida");
          fetchSubscriptions();
        } catch (error) {
          console.error(error);
          message.error("Error al suspender suscripción");
        }
      },
    });
  };

  // 4. Manejo Cobro Manual => abrir modal, etc.
  const openManualPaymentModal = (sub) => {
    setManualPaymentData({
      subscription_id: sub.id,
      amount: 0,
      transaction_number: "",
      payment_date: "", // quizás la pones con new Date().toISOString()
      method_payment: "cash",
    });
    setIsModalManualOpen(true);
  };

  const handleManualPaymentOk = async () => {
    try {
      const {
        subscription_id,
        amount,
        transaction_number,
        payment_date,
        method_payment,
      } = manualPaymentData;

      // 1) Crear la transacción
      await axios.post(
        `${apiUrl}/transactions`,
        {
          subscription_id,
          method_payment,
          status: "approved", // o "completed"
          amount,
          payment_date,
          transaction_number,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      // 2) Actualizar suscripción => "active", end_date => +30 días
      //    (puedes calcular la end_date en frontend, o en el backend).
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + 30);
      const endDateString = newEndDate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      await axios.put(
        `${apiUrl}/subscriptions/${subscription_id}`,
        {
          status: "active",
          end_date: endDateString,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      message.success("Pago manual registrado y suscripción activada");
      setIsModalManualOpen(false);
      fetchSubscriptions();
    } catch (error) {
      console.error(error);
      message.error("Error al procesar pago manual");
    }
  };

  // 5. Generar Link de MP
  const handleGenerateMPLink = async (sub) => {
    try {
      // Supongamos que tienes plan.price => 10000
      // o si el plan no está en sub, harás:
      // 1) fetch plan => plan.price
      // 2) mandar a /api/payments
      // Ejemplo "Básico" = 10000
      const planPrice = 10000;
      // O sub.plan.price
      const resp = await axios.post(
        `${apiUrl}/payments`,
        {
          type: "preference",
          name: "Plan Básico",
          description: "Suscripción Mensual",
          price: planPrice,
          email: "cliente@example.com", // email del user
          plan_id: sub.plan_id,
          subscription_id: sub.id,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      const initPoint = resp.data.data.url;
      Modal.info({
        title: "Link de Pago MP",
        content: (
          <div>
            <p>Copiar y compartir con el cliente:</p>
            <a href={initPoint} target="_blank" rel="noreferrer">
              {initPoint}
            </a>
          </div>
        ),
      });
    } catch (error) {
      console.error(error);
      message.error("Error generando link MP");
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      title: "#",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Usuario",
      key: "user",
      render: (text, record) => {
        // Si tu backend no preload user, sale null
        // Si lo tienes, record.user.name
        return record.user
          ? record.user.name || record.user.email
          : `UserID: ${record.userId}`;
      },
    },
    {
      title: "Plan",
      key: "plan",
      render: (_, record) => {
        return record.plan ? record.plan.name : `PlanID: ${record.planId}`;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "start_date",
      render: (value) => {
        // 'value' es la fecha en formato ISO => "2024-12-18T00:00:00.000Z"
        // Verificas que exista y si sí, formateas con dayjs
        return value ? dayjs(value).format("DD/MM/YYYY") : "N/A";
      },
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "end_date",
      render: (value) => {
        return value ? dayjs(value).format("DD/MM/YYYY") : "N/A";
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (text, record) => (
        <>
          <Button onClick={() => handleSuspend(record)}>Suspender</Button>
          <Button onClick={() => openManualPaymentModal(record)}>
            Cobro Manual
          </Button>
          <Button onClick={() => handleGenerateMPLink(record)}>
            Generar MP Link
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Administrar Pagos</h1>
      <Button onClick={fetchSubscriptions} style={{ marginBottom: 16 }}>
        Recargar Suscripciones
      </Button>
      <Table
        dataSource={subscriptions}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      {/* MODAL para Cobro Manual */}
      <Modal
        title="Cobro Manual"
        open={isModalManualOpen}
        onOk={handleManualPaymentOk}
        onCancel={() => setIsModalManualOpen(false)}
      >
        <div className="grid gap-2">
          <label>Método de Pago</label>
          <select
            value={manualPaymentData.method_payment}
            onChange={(e) =>
              setManualPaymentData((prev) => ({
                ...prev,
                method_payment: e.target.value,
              }))
            }
          >
            <option value="cash">Efectivo</option>
            <option value="bank_trans">Transferencia</option>
            <option value="check">Cheque</option>
            {/* etc */}
          </select>

          <label>Monto</label>
          <Input
            type="number"
            value={manualPaymentData.amount}
            onChange={(e) =>
              setManualPaymentData((prev) => ({
                ...prev,
                amount: e.target.value,
              }))
            }
          />

          <label>Fecha Pago</label>
          <Input
            type="datetime-local"
            value={manualPaymentData.payment_date}
            onChange={(e) =>
              setManualPaymentData((prev) => ({
                ...prev,
                payment_date: e.target.value,
              }))
            }
          />

          <label>Transaction Number (opcional)</label>
          <Input
            value={manualPaymentData.transaction_number}
            onChange={(e) =>
              setManualPaymentData((prev) => ({
                ...prev,
                transaction_number: e.target.value,
              }))
            }
          />
        </div>
      </Modal>
    </div>
  );
}

export default Pagos;
