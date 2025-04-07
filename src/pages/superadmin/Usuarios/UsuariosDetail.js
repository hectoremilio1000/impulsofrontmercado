// src/pages/superadmin/ClientesDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Tabs, Spin, message } from "antd";

import { useAuth } from "../../../components/AuthContext";
import InfoUserPanel from "../../../components/rolSuperAdmin/Usuarios/InfoUserPanel";
import SubscriptionPanel from "../../../components/rolSuperAdmin/Usuarios/SubscriptionPanel";
import EmployeesPanel from "../../../components/rolSuperAdmin/Usuarios/EmployeesPanel";

import ChangePlanModal from "../../../components/rolSuperAdmin/Usuarios/ChangePlanModal";
import ChangeModulesModal from "../../../components/rolSuperAdmin/Usuarios/ChangeModulesModal";

// IMPORTA CoachingTab
import CoachingTab from "../../../components/rolSuperAdmin/CoachingTab";

function ClientesDetail() {
  const { userId } = useParams();
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchAllData();
    }
    // eslint-disable-next-line
  }, [userId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // GET /users/:id
      const userResp = await axios.get(`${apiUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setUser(userResp.data.data);

      // GET /subscriptionbyuser/:id
      const subResp = await axios.get(
        `${apiUrl}/subscriptionbyuser/${userId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setSubscription(subResp.data.data);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar datos del usuario");
    } finally {
      setLoading(false);
    }
  };

  // Manejo "Cambiar Plan"
  const openPlanModal = () => setIsPlanModalOpen(true);
  const closePlanModal = () => setIsPlanModalOpen(false);
  const afterPlanChange = () => {
    closePlanModal();
    fetchAllData();
  };

  // Manejo "Cambiar Módulos"
  const openModulesModal = () => setIsModulesModalOpen(true);
  const closeModulesModal = () => setIsModulesModalOpen(false);
  const afterModulesChange = () => {
    closeModulesModal();
    fetchAllData();
  };

  if (loading) return <Spin className="m-8" />;
  if (!user) return <p>Usuario no encontrado</p>;

  // Verificar si es rol employee
  const isEmployee = user.rol?.id === 4;

  // IDs de módulos actuales
  const currentModuleIds = subscription?.modules?.map((m) => m.id) || [];
  // Valor de planMaxModules
  const planMaxModules = subscription?.plan?.max_modules || 999;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Detalle de Usuario (Tabs)</h2>

      <Tabs defaultActiveKey="info">
        <Tabs.TabPane tab="Información" key="info">
          <InfoUserPanel user={user} />
        </Tabs.TabPane>

        {/* Suscripción: deshabilitada si no hay subscription o si es employee */}
        <Tabs.TabPane
          tab="Suscripción"
          key="subscription"
          disabled={!subscription || isEmployee}
        >
          {subscription && (
            <SubscriptionPanel
              subscription={subscription}
              onChangePlan={openPlanModal}
              onChangeModules={openModulesModal}
            />
          )}
        </Tabs.TabPane>

        {/* Coaching: deshabilitado si no hay subscription o si es employee */}
        <Tabs.TabPane
          tab="Coaching"
          key="coaching"
          disabled={!subscription || isEmployee}
        >
          {subscription && <CoachingTab subscription={subscription} />}
        </Tabs.TabPane>

        {/* Empleados: deshabilitada si es employee */}
        <Tabs.TabPane tab="Empleados" key="employees" disabled={isEmployee}>
          {user.companies && user.companies.length > 0 ? (
            user.companies.map((comp) => (
              <div key={comp.id} style={{ marginBottom: 24 }}>
                <h3>Empleados de: {comp.name}</h3>
                <EmployeesPanel companyId={comp.id} />
              </div>
            ))
          ) : (
            <p>El usuario no tiene compañías registradas.</p>
          )}
        </Tabs.TabPane>
      </Tabs>

      {/* Modal Cambiar Plan */}
      {subscription && (
        <ChangePlanModal
          visible={isPlanModalOpen}
          onCancel={closePlanModal}
          onPlanChanged={afterPlanChange}
          subscriptionId={subscription.id}
          currentPlanId={subscription.plan_id}
        />
      )}

      {/* Modal Cambiar Módulos */}
      {subscription && (
        <ChangeModulesModal
          visible={isModulesModalOpen}
          onCancel={closeModulesModal}
          onModulesChanged={afterModulesChange}
          subscriptionId={subscription.id}
          currentModuleIds={currentModuleIds}
          planMaxModules={planMaxModules}
        />
      )}
    </div>
  );
}

export default ClientesDetail;
