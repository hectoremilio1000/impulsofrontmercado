// src/components/moduls/SelectModulesModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Checkbox, message } from "antd";
import axios from "axios";

import dayjs from "dayjs";
import { useAuth } from "../../AuthContext";

const SelectModulesModal = ({
  visible,
  onCancel,
  onSuccess,
  userId,
  companyId, // Si luego lo usas
}) => {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [modules, setModules] = useState([]);
  const [selected, setSelected] = useState([]);

  const defaultPlanId = 1; // plan “Básico”, por ejemplo

  useEffect(() => {
    if (visible) {
      fetchModules();
      setSelected([]);
    }
  }, [visible]);

  const fetchModules = async () => {
    try {
      const resp = await axios.get(`${apiUrl}/modules`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      if (resp.data.status === "success") {
        setModules(resp.data.data || []);
      } else {
        message.error("Error al obtener módulos");
      }
    } catch (error) {
      console.error("Error fetch modules", error);
      message.error("Error al obtener módulos");
    }
  };

  const handleChangeModule = (moduleId, checked) => {
    setSelected((prev) =>
      checked ? [...prev, moduleId] : prev.filter((id) => id !== moduleId)
    );
  };

  const handleSaveModules = async () => {
    try {
      if (!userId) {
        message.error("No hay userId. Primero crea el usuario");
        return;
      }
      const body = {
        user_id: userId,
        plan_id: defaultPlanId, // plan básico
        modules_ids: selected, // array con IDs de módulos
      };

      const resp = await axios.post(`${apiUrl}/subscriptions`, body, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (resp.data.status === "success") {
        message.success(
          "Suscripción creada en modo trial con módulos asignados"
        );
        onSuccess(); // cierra el modal
      } else {
        message.error("Error al crear suscripción");
      }
    } catch (error) {
      console.error("Error creando suscripción:", error);
      message.error("Error al crear suscripción");
    }
  };

  return (
    <Modal
      title="Seleccionar Módulos"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <div>
        {modules.map((mod) => (
          <div key={mod.id} style={{ marginBottom: 8 }}>
            <Checkbox
              checked={selected.includes(mod.id)}
              onChange={(e) => handleChangeModule(mod.id, e.target.checked)}
            >
              {mod.name}
            </Checkbox>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Cancelar
        </Button>
        <Button type="primary" onClick={handleSaveModules}>
          Guardar
        </Button>
      </div>
    </Modal>
  );
};

export default SelectModulesModal;
