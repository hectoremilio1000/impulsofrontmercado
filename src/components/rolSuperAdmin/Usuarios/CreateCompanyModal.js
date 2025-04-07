// file: src/components/company/CreateCompanyModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Select, message } from "antd";
import axios from "axios";
import { useAuth } from "../../AuthContext";

const { Option } = Select;

const CreateCompanyModal = ({
  visible,
  onCancel,
  onSuccess,
  userId, // <-- ID del usuario recién creado
  userName, // <-- Nombre del usuario recién creado
}) => {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_contact: "",
    website: "",
    logo: "",
    user_id: null, // Admin que "posee" la empresa
    created_by: null, // Quien está creando la empresa
  });

  const [admins, setAdmins] = useState([]);

  // Detectar rol de quien crea
  const myRolId = auth?.user?.rol_id || null;

  // Efecto al abrir
  useEffect(() => {
    if (visible) {
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone_contact: "",
        website: "",
        logo: "",
        user_id: null,
        created_by: auth.user?.id || null,
      });
      setLoading(false);

      // Si userId existe => venimos de un user recién creado
      if (userId) {
        setFormData((prev) => ({
          ...prev,
          user_id: userId,
        }));
      } else {
        // Si soy superadmin y NO tengo userId => cargo la lista de admins
        if (myRolId === 1) {
          fetchAdmins();
        } else {
          // Si no soy superadmin => set user_id = mi propio ID
          setFormData((prev) => ({
            ...prev,
            user_id: auth.user?.id || null,
          }));
        }
      }
    }
    // eslint-disable-next-line
  }, [visible]);

  const fetchAdmins = async () => {
    try {
      const resp = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = resp.data.data || [];
      const onlyAdmins = data.filter((u) => u.rol?.id === 2);
      setAdmins(onlyAdmins);
    } catch (error) {
      console.error("Error fetch admins for company", error);
    }
  };

  const handleChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const createCompany = async () => {
    if (!formData.name) {
      message.warn("El nombre de la empresa es obligatorio");
      return;
    }
    if (!formData.user_id) {
      message.warn("Se requiere un usuario admin");
      return;
    }

    setLoading(true);
    try {
      const resp = await axios.post(`${apiUrl}/companies`, formData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (resp.data.status === "success") {
        const newCompanyId = resp.data.data.id;
        message.success("Empresa creada correctamente");
        onSuccess(newCompanyId);
      } else {
        message.error(resp.data.message || "Error al crear empresa");
      }
    } catch (error) {
      console.error("Error createCompany", error);
      message.error("Error al crear empresa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Crear Empresa"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <div style={{ marginBottom: 12 }}>
        <label>ID de Quien Crea</label>
        <Input disabled value={auth.user?.id} style={{ marginBottom: 8 }} />

        <label>Nombre del Usuario (Creador)</label>
        <Input disabled value={auth.user?.name} />
      </div>

      <div className="grid gap-3" style={{ marginTop: 16 }}>
        {/* Si venimos de un user recién creado, mostramos su nombre y deshabilitamos el select */}
        {userId ? (
          <div>
            <label>Usuario Admin (Recién Creado)</label>
            <Input disabled value={userName || `ID: ${userId}`} />
          </div>
        ) : (
          // Caso contrario => soy superadmin => muestro select, o soy admin => user_id = mi ID
          <>
            {myRolId === 1 && (
              <div>
                <label>Usuario Admin</label>
                <Select
                  style={{ width: "100%" }}
                  value={formData.user_id || undefined}
                  onChange={(val) => handleChange("user_id", val)}
                  placeholder="Selecciona usuario admin"
                >
                  {admins.map((u) => (
                    <Option key={u.id} value={u.id}>
                      {u.name || u.email}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
          </>
        )}

        <div>
          <label>Nombre de la Empresa</label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ej. Mi Restaurante"
          />
        </div>

        <div>
          <label>Email de la Empresa</label>
          <Input
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="contacto@empresa.com"
          />
        </div>

        <div>
          <label>Teléfono de Contacto</label>
          <Input
            value={formData.phone_contact}
            onChange={(e) => handleChange("phone_contact", e.target.value)}
            placeholder="555-555-5555"
          />
        </div>

        <div>
          <label>Sitio Web</label>
          <Input
            value={formData.website}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <label>Logo (URL)</label>
          <Input
            value={formData.logo}
            onChange={(e) => handleChange("logo", e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div style={{ marginTop: 24, textAlign: "right" }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Cancelar
        </Button>
        <Button type="primary" onClick={createCompany} loading={loading}>
          Crear
        </Button>
      </div>
    </Modal>
  );
};

export default CreateCompanyModal;
