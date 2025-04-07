import React, { useEffect, useState } from "react";
import { Modal, Input, Checkbox, message, Select } from "antd";
import axios from "axios";
import { useAuth } from "../../AuthContext";

const EditUserModal = ({ visible, onClose, userId }) => {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Estados para user y suscripción
  const [userData, setUserData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [allModules, setAllModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);

  // **Nuevo** estado para el subscription status
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Cargar info cuando se abre el modal
  useEffect(() => {
    if (visible && userId) {
      fetchUser();
      fetchSubscriptionAndModules();
    }
  }, [visible, userId]);

  // 1) Cargar datos del usuario (para name, whatsapp, etc.)
  const fetchUser = async () => {
    try {
      // Si ya tienes un endpoint GET /api/users/:id => lo usas.
      // De lo contrario, filtra del array de usuarios global.
      // Aquí asumo que tienes /api/users => devuleve lista, luego filtras.
      const resp = await axios.get(`${apiUrl}/users`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      // Filtras por ID
      const userFound = resp.data.data.find((u) => u.id === userId);
      setUserData(userFound);
    } catch (error) {
      console.error("Error al cargar user:", error);
    }
  };

  // 2) Cargar la suscripción del user + módulos, y la lista de módulos
  const fetchSubscriptionAndModules = async () => {
    try {
      // a) GET /api/subscriptionbyuser/:userId
      const respSub = await axios.get(
        `${apiUrl}/subscriptionbyuser/${userId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      const subscriptionData = respSub.data.data;
      setSubscription(subscriptionData);

      // b) GET /api/modules => lista de todos los módulos
      const respMods = await axios.get(`${apiUrl}/modules`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const modulesData = respMods.data.data;
      setAllModules(modulesData);

      // c) Asignar selectedModules con los IDs que ya están en la subscripción
      if (subscriptionData.modules) {
        const currentIds = subscriptionData.modules.map((m) => m.id);
        setSelectedModules(currentIds);
      }

      // **NUEVO**: asignar el status actual a selectedStatus,
      // para que aparezca seleccionado en el <Select>.
      if (subscriptionData.status) {
        setSelectedStatus(subscriptionData.status);
      }
    } catch (error) {
      // Si el user no tiene suscripción (404), aquí podrías manejarlo
      console.error("Error al cargar suscripción o módulos:", error);
    }
  };

  // Manejar cambios de name / whatsapp
  const handleUserFieldChange = (key, value) => {
    setUserData((prev) => ({ ...prev, [key]: value }));
  };

  // Manejar checkboxes de módulos
  const handleModuleCheck = (moduleId, checked) => {
    if (checked) {
      setSelectedModules((prev) => [...prev, moduleId]);
    } else {
      setSelectedModules((prev) => prev.filter((id) => id !== moduleId));
    }
  };

  // Guardar cambios => PUT /users/:id + PUT /subscriptions/:id
  const handleSave = async () => {
    try {
      if (!userData) {
        return;
      }
      // 1) PUT /api/users/:id => actualiza name, whatsapp
      await axios.put(
        `${apiUrl}/users/${userData.id}`,
        {
          name: userData.name,
          whatsapp: userData.whatsapp,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      // 2) Si tiene suscripción, PUT /api/subscriptions/:id => actualiza modules_ids + status
      if (subscription) {
        await axios.put(
          `${apiUrl}/subscriptions/${subscription.id}`,
          {
            modules_ids: selectedModules,
            status: selectedStatus, // <-- enviamos el status seleccionado
          },
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
      }

      message.success("Usuario actualizado correctamente");
      onClose(); // cerrar modal
    } catch (error) {
      console.error("Error al actualizar:", error);
      message.error("No se pudo actualizar.");
    }
  };

  return (
    <Modal
      open={visible}
      title="Editar Usuario"
      onCancel={onClose}
      onOk={handleSave}
      okText="Guardar"
      cancelText="Cancelar"
    >
      {userData && (
        <>
          {/* Datos del Usuario */}
          <div style={{ marginBottom: 10 }}>
            <label>Nombre:</label>
            <Input
              value={userData.name || ""}
              onChange={(e) => handleUserFieldChange("name", e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Whatsapp:</label>
            <Input
              value={userData.whatsapp || ""}
              onChange={(e) =>
                handleUserFieldChange("whatsapp", e.target.value)
              }
            />
          </div>
        </>
      )}

      <hr style={{ margin: "16px 0" }} />

      {/* Si hay suscripción, mostramos opciones */}
      {subscription ? (
        <>
          <div style={{ marginBottom: 10 }}>
            <label>Estado de Suscripción:</label>
            <br />
            <Select
              style={{ width: "100%" }}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
            >
              {/* Opciones de estado */}
              <Select.Option value="trialing">
                En prueba (trialing)
              </Select.Option>
              <Select.Option value="active">Activa (active)</Select.Option>
              <Select.Option value="expired">Expirada (expired)</Select.Option>
              <Select.Option value="canceled">
                Cancelada (canceled)
              </Select.Option>
            </Select>
          </div>

          <div style={{ marginBottom: 8, fontWeight: "bold" }}>Módulos:</div>
          <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 8 }}>
            {allModules.map((mod) => (
              <div key={mod.id} style={{ marginBottom: 8 }}>
                <Checkbox
                  checked={selectedModules.includes(mod.id)}
                  onChange={(e) => handleModuleCheck(mod.id, e.target.checked)}
                >
                  {mod.name}
                </Checkbox>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Este usuario no tiene suscripción</p>
      )}
    </Modal>
  );
};

export default EditUserModal;
