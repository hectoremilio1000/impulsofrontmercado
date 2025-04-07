// src/components/rolSuperAdmin/ChangeModulesModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Checkbox, Spin, message } from "antd";
import axios from "axios";
import { useAuth } from "../../AuthContext";

/**
 *
 * Props:
 * - visible: boolean
 * - onCancel: function => cerrar sin guardar
 * - onModulesChanged: function => callback tras guardar
 * - subscriptionId: number
 * - currentModuleIds: number[] (IDs de módulos ya asignados)
 * - planMaxModules: number (opcional, para validar en front)
 */
function ChangeModulesModal({
  visible,
  onCancel,
  onModulesChanged,
  subscriptionId,
  currentModuleIds = [],
  planMaxModules = 10, // supongamos
}) {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [allModules, setAllModules] = useState([]);
  const [selectedIds, setSelectedIds] = useState(currentModuleIds);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchAllModules();
      setSelectedIds(currentModuleIds);
    }
  }, [visible, currentModuleIds]);

  const fetchAllModules = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${apiUrl}/modules`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setAllModules(resp.data.data || []);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar los módulos");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (moduleId, checked) => {
    if (checked) {
      // Verificar que no exceda planMaxModules en front
      if (selectedIds.length >= planMaxModules) {
        message.warning(`Máximo de ${planMaxModules} módulos para este plan.`);
        return;
      }
      setSelectedIds((prev) => [...prev, moduleId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== moduleId));
    }
  };

  const handleOk = async () => {
    try {
      if (!subscriptionId) return;
      // PUT /subscriptions/:id => { modules_ids: selectedIds }
      // El backend revalida que selectedIds.length <= plan.max_modules
      await axios.put(
        `${apiUrl}/subscriptions/${subscriptionId}`,
        {
          modules_ids: selectedIds,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      message.success("Módulos actualizados");
      onModulesChanged?.();
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message || "No se pudo actualizar los módulos"
      );
    }
  };

  return (
    <Modal
      title="Cambiar Módulos"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Guardar"
      cancelText="Cancelar"
    >
      {loading ? (
        <Spin />
      ) : (
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {allModules.map((mod) => {
            const checked = selectedIds.includes(mod.id);
            return (
              <div key={mod.id} style={{ marginBottom: "8px" }}>
                <Checkbox
                  checked={checked}
                  onChange={(e) => handleCheck(mod.id, e.target.checked)}
                >
                  {mod.name}
                </Checkbox>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

export default ChangeModulesModal;
