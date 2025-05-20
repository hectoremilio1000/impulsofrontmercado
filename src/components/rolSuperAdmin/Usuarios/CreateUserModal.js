// file: src/components/rolSuperAdmin/Usuarios/CreateUserModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Select, message } from "antd";
import { FaCopy, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import dayjs from "dayjs";
import { useAuth } from "../../AuthContext";
import { generateRandomUuid } from "../../../utils/generateRandomUuid";

const CreateUserModal = ({ visible, onCancel, onSuccess }) => {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Lista de roles (se carga desde el backend)
  const [roles, setRoles] = useState([]);
  // Lista de empresas (se carga desde el backend)
  const [companies, setCompanies] = useState([]);
  const [positions, setPositions] = useState([]);

  // Catálogo local de puestos (para rol=4 => Employee)

  // Loading y visibilidad de contraseña
  const [loading, setLoading] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "12345678",
    rol_id: null, // Seleccionado en el <Select> de roles
    whatsapp: "",
    position: "", // Campo para el puesto (si rol=4)
    company_id: null, // Empresa a asignar (si rol=4)
  });

  const fetchPositions = async () => {
    try {
      const resp = await axios.get(`${apiUrl}/positions`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (resp.data.status === "success") {
        setPositions(resp.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  // Efecto: Cargar roles y empresas al abrir el modal
  useEffect(() => {
    if (visible) {
      setFormData({
        name: "",
        email: "",
        password: "12345678",
        rol_id: null,
        whatsapp: "",
        positionId: null,
        company_id: null,
      });
      setOpenPassword(false);
      setLoading(false);

      fetchRoles();
      fetchCompanies();
      fetchPositions();
    }
    // eslint-disable-next-line
  }, [visible]);

  /**
   * Carga la lista de roles desde /api/roles
   */
  const fetchRoles = async () => {
    try {
      const resp = await axios.get(`${apiUrl}/roles`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (resp.data.status === "success") {
        setRoles(resp.data.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  /**
   * Carga la lista de companies desde /api/companies
   * - Si eres superadmin (rol=1), normalmente se devuelven todas
   * - Si eres admin (rol=2), se devuelven sólo las tuyas (depende de tu backend)
   */
  const fetchCompanies = async () => {
    try {
      const myRolId = auth.user?.rol_id;
      // Ajusta tu endpoint según cómo tengas la lógica en el backend
      // Si rol=1 => GET /api/companies (todas)
      // Si rol=2 => GET /api/companies (sólo las del admin, según tu backend)
      const resp = await axios.get(`${apiUrl}/companies`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (resp.data.status === "success") {
        setCompanies(resp.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  // Handler genérico de cambios en el formulario
  const handleChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  // Copiar credenciales al portapapeles
  const copiarCredentials = (field) => {
    navigator.clipboard.writeText(formData[field] || "");
    message.success("Copiado al portapapeles");
  };

  /**
   * createUsuario:
   * - Si rol_id === 4 => es Employee => creamos con /api/companies/:id/employees
   * - De lo contrario => creamos con /api/newuser
   */
  const createUsuario = async () => {
    if (!formData.email) {
      message.error("El email es requerido");
      return;
    }
    if (!formData.rol_id) {
      message.error("Selecciona un rol");
      return;
    }

    setLoading(true);
    try {
      // Si es rol=4 => EMPLOYEE
      if (formData.rol_id === 4) {
        if (!formData.company_id) {
          message.error("Selecciona la empresa a la que pertenece el empleado");
          setLoading(false);
          return;
        }

        // Endpoint /companies/:companyId/employees
        const reqBody = {
          name: formData.name,
          email: formData.email,
          phone: formData.whatsapp,
          positionId: formData.position ?? undefined, // numérico
          password: formData.password,
        };
        const resp = await axios.post(
          `${apiUrl}/companies/${formData.company_id}/employees`,
          reqBody,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        if (resp.data.status === "success") {
          const { user } = resp.data.data;
          // Notificamos al padre
          onSuccess(user.id, 4, user.name);
          message.success("Empleado creado correctamente");
        } else {
          message.error(resp.data.message || "Error al crear empleado");
        }
      } else {
        // Rol distinto de 4 => creamos con /api/newuser
        const newData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          rol_id: formData.rol_id,
          whatsapp: formData.whatsapp,
          fecha_created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          uuid: generateRandomUuid(5),
        };
        const resp = await axios.post(`${apiUrl}/newuser`, newData, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (resp.data.status === "success") {
          const newUser = resp.data.data;
          onSuccess(newUser.id, formData.rol_id, newUser.name);
          message.success("Usuario creado correctamente");
        } else {
          message.error(resp.data.message || "Error al crear usuario");
        }
      }
    } catch (error) {
      console.error(error);
      message.error("Error al crear usuario/empleado");
    } finally {
      setLoading(false);
    }
  };

  // Condición para mostrar campo "empresa" y "puesto"
  const isEmployee = formData.rol_id === 4;

  return (
    <Modal
      title="Crear Nuevo Usuario"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <div style={{ display: "grid", gap: "1rem" }}>
        {/* Nombre */}
        <div>
          <label>Nombre Completo:</label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nombre(s) y apellidos"
          />
        </div>

        {/* Email */}
        <div>
          <label>Email:</label>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="usuario@example.com"
            />
            <Button onClick={() => copiarCredentials("email")}>
              <FaCopy />
            </Button>
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label>Contraseña:</label>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              type={openPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            <Button onClick={() => setOpenPassword(!openPassword)}>
              {openPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
            <Button onClick={() => copiarCredentials("password")}>
              <FaCopy />
            </Button>
          </div>
        </div>

        {/* Rol */}
        <div>
          <label>Rol:</label>
          <Select
            style={{ width: "100%" }}
            placeholder="Selecciona un rol"
            value={formData.rol_id}
            onChange={(val) => handleChange("rol_id", val)}
          >
            {roles.map((r) => (
              <Select.Option key={r.id} value={r.id}>
                {r.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Si es Employee => mostrar select de Empresa y select de Puesto */}
        {isEmployee && (
          <>
            <div>
              <label>Empresa a la que pertenece:</label>
              <Select
                style={{ width: "100%" }}
                placeholder="Selecciona una empresa"
                value={formData.company_id}
                onChange={(val) => handleChange("company_id", val)}
              >
                {companies.map((c) => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <label>Puesto:</label>
              <Select
                style={{ width: "100%" }}
                placeholder="Selecciona un puesto"
                value={formData.positionId}
                onChange={(val) => handleChange("positionId", val)}
              >
                {positions.map((p) => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.nombre}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </>
        )}

        {/* Whatsapp */}
        <div>
          <label>WhatsApp (opcional):</label>
          <Input
            value={formData.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            placeholder="Ej. 5523273811"
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Cancelar
        </Button>
        <Button type="primary" onClick={createUsuario} loading={loading}>
          Crear
        </Button>
      </div>
    </Modal>
  );
};

export default CreateUserModal;
