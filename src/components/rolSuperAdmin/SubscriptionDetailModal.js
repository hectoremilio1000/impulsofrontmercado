import React, { useState, useEffect } from "react";
import { Modal, Spin, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useAuth } from "../AuthContext";

function SubscriptionDetailModal({ visible, onCancel, userId }) {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (visible && userId) {
      fetchSubscriptionDetail();
    }
  }, [visible, userId]);

  const fetchSubscriptionDetail = async () => {
    setLoading(true);
    try {
      // GET /subscriptionbyuser/:userId
      const resp = await axios.get(`${apiUrl}/subscriptionbyuser/${userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setSubscription(resp.data.data);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar detalles de la suscripción");
    } finally {
      setLoading(false);
    }
  };

  const handleResetCoaching = async () => {
    if (!subscription) return;
    try {
      await axios.put(
        `${apiUrl}/subscriptions/${subscription.id}`,
        { coaching_used: 0 },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      message.success("Horas de coaching reseteadas a 0");
      fetchSubscriptionDetail();
    } catch (error) {
      console.error(error);
      message.error("Error al resetear horas de coaching");
    }
  };

  return (
    <Modal
      title="Detalle de Suscripción"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      {loading ? (
        <Spin />
      ) : subscription ? (
        <div>
          <p>
            <b>Plan:</b> {subscription.plan?.name} (${subscription.plan?.price})
          </p>
          <p>
            <b>Status:</b> {subscription.status}
          </p>
          <p>
            <b>Inicio:</b> {dayjs(subscription.startDate).format("DD/MM/YYYY")}
          </p>
          <p>
            <b>Fin:</b> {dayjs(subscription.endDate).format("DD/MM/YYYY")}
          </p>
          <p>
            <b>Horas incluidas:</b> {subscription.coachingIncluded}
          </p>
          <p>
            <b>Horas usadas:</b> {subscription.coachingUsed}
          </p>

          <button onClick={handleResetCoaching}>Resetear horas coaching</button>

          <h4>Módulos asignados:</h4>
          {subscription.modules && subscription.modules.length > 0 ? (
            <ul>
              {subscription.modules.map((m) => (
                <li key={m.id}>{m.name}</li>
              ))}
            </ul>
          ) : (
            <p>Sin módulos</p>
          )}
        </div>
      ) : (
        <p>No hay suscripción</p>
      )}
    </Modal>
  );
}

export default SubscriptionDetailModal;
