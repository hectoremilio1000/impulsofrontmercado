import React, { useEffect, useState } from "react";
import { Modal, Select, message } from "antd";
import axios from "axios";
import { useAuth } from "../../AuthContext";

const ChangePlanModal = ({
  visible,
  onCancel,
  onPlanChanged,
  subscriptionId,
  currentPlanId,
}) => {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchPlans();
    }
    // eslint-disable-next-line
  }, [visible]);

  const fetchPlans = async () => {
    try {
      const resp = await axios.get(`${apiUrl}/plans`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setPlans(resp.data.data || []);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar planes");
    }
  };

  const handleOk = async () => {
    if (!subscriptionId || !selectedPlanId) {
      message.warning("Selecciona un plan válido");
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `${apiUrl}/subscriptions/${subscriptionId}`,
        { plan_id: selectedPlanId },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      message.success("Plan actualizado");
      onPlanChanged?.();
    } catch (error) {
      console.error(error);
      message.error("No se pudo cambiar el plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Cambiar Plan"
      open={visible}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={onCancel}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <p>Selecciona el nuevo plan:</p>
      <Select
        style={{ width: "100%" }}
        value={selectedPlanId}
        onChange={(val) => setSelectedPlanId(val)}
      >
        {plans.map((plan) => (
          <Select.Option key={plan.id} value={plan.id}>
            {plan.name} - ${plan.price} (Máx módulos: {plan.max_modules})
          </Select.Option>
        ))}
      </Select>
    </Modal>
  );
};

export default ChangePlanModal;
