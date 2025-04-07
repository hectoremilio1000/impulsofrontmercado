// ContratacionesRRHH.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Input, Select, Button, message } from "antd";
import { useAuth } from "../../../../../components/AuthContext.js";
import CreateCompanyModal from "../../../../../components/rolSuperAdmin/RRHH/CompanyModal.js";

// Importa el nuevo componente

// Ajusta la ruta si lo guardaste en otra carpeta

const { Option } = Select;

function ContratacionesRRHH() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // Rol
  const userRolName = auth.user?.rol?.name;
  const isSuperadmin = userRolName === "superadmin";
  const isAdmin = userRolName === "admin" || auth.user?.rol_id === 2;

  // Lista de usuarios (si superadmin) + user seleccionado
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Lista de empresas + empresa seleccionada
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // Modal de crear empresa
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);

  // Campos del formulario "Candidate"
  const [position, setPosition] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [ref1Company, setRef1Company] = useState("");
  const [ref1Position, setRef1Position] = useState("");
  const [ref1Name, setRef1Name] = useState("");
  const [ref1Timeworked, setRef1Timeworked] = useState("");
  const [ref1Whatsapp, setRef1Whatsapp] = useState("");
  const [ref2Company, setRef2Company] = useState("");
  const [ref2Position, setRef2Position] = useState("");
  const [ref2Name, setRef2Name] = useState("");
  const [ref2Timeworked, setRef2Timeworked] = useState("");
  const [ref2Whatsapp, setRef2Whatsapp] = useState("");
  const [cvFile, setCvFile] = useState(null);

  useEffect(() => {
    if (isSuperadmin) {
      // Cargar usuarios
      fetchUsers();
    } else {
      // No superadmin => set userId = mi ID
      setSelectedUserId(auth.user?.id || null);
      // Cargar mis empresas
      fetchCompaniesForCurrentUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------
  //  CARGAR USUARIOS (superadmin)
  // ----------------------------------------------------------------
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.data) {
        setUsers(res.data.data);
        // Elige el primero
        if (res.data.data.length > 0) {
          const firstUserId = res.data.data[0].id;
          setSelectedUserId(firstUserId);
          fetchCompaniesForUser(firstUserId);
        }
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      message.error("No se pudo cargar la lista de usuarios");
    }
  };

  // ----------------------------------------------------------------
  //  CARGAR EMPRESAS (superadmin) => filtrar por userId
  // ----------------------------------------------------------------
  const fetchCompaniesForUser = async (userId) => {
    try {
      console.log("Fetch companies for userId:", userId);
      const res = await axios.get(`${apiUrl}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        const allCompanies = res.data.data || [];
        console.log("allCompanies =>", allCompanies);
        const filtered = allCompanies.filter((comp) => comp.userId === userId);
        console.log("filtered =>", filtered);
        setCompanies(filtered);
        if (filtered.length > 0) {
          setSelectedCompanyId(filtered[0].id);
        } else {
          setSelectedCompanyId(null);
        }
      } else {
        message.error("No se pudo cargar empresas");
      }
    } catch (error) {
      console.error("Error al cargar empresas (superadmin):", error);
      message.error("Error de servidor al cargar empresas");
    }
  };

  // ----------------------------------------------------------------
  //  CARGAR EMPRESAS (admin/otro) => backend ya filtra
  // ----------------------------------------------------------------
  const fetchCompaniesForCurrentUser = async () => {
    try {
      const res = await axios.get(`${apiUrl}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        const all = res.data.data || [];
        setCompanies(all);
        if (all.length > 0) {
          setSelectedCompanyId(all[0].id);
        } else {
          setSelectedCompanyId(null);
        }
      } else {
        message.error("No se pudo cargar empresas");
      }
    } catch (error) {
      console.error("Error al cargar empresas (admin/user):", error);
      message.error("Error de servidor al cargar empresas");
    }
  };

  // ----------------------------------------------------------------
  //  AL CAMBIAR DE USUARIO (superadmin)
  // ----------------------------------------------------------------
  const handleChangeUser = (newUserId) => {
    setSelectedUserId(newUserId);
    fetchCompaniesForUser(newUserId);
  };

  // ----------------------------------------------------------------
  //  MANEJAR ARCHIVO CV
  // ----------------------------------------------------------------
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCvFile(e.target.files[0]);
    }
  };

  // ----------------------------------------------------------------
  //  SUBMIT CANDIDATO
  // ----------------------------------------------------------------
  const handleSubmit = async () => {
    if (!position || !name || !whatsapp || !email) {
      message.warning("Por favor completa los campos requeridos");
      return;
    }
    if (!cvFile) {
      message.warning("Selecciona un archivo CV antes de enviar");
      return;
    }
    if (!selectedCompanyId) {
      message.warning("Selecciona una empresa para este candidato");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("cv", cvFile);
      formData.append("nombre", name);
      formData.append("whatsapp", whatsapp);
      formData.append("email", email);
      formData.append("puesto", position);

      // Referencias 1
      formData.append("referencia1_empresa", ref1Company);
      formData.append("referencia1_cargo", ref1Position);
      formData.append("referencia1_nombre", ref1Name);
      formData.append("referencia1_tiempo", ref1Timeworked);
      formData.append("referencia1_whatsapp", ref1Whatsapp);

      // Referencias 2
      formData.append("referencia2_empresa", ref2Company);
      formData.append("referencia2_cargo", ref2Position);
      formData.append("referencia2_nombre", ref2Name);
      formData.append("referencia2_tiempo", ref2Timeworked);
      formData.append("referencia2_whatsapp", ref2Whatsapp);

      // company_id
      formData.append("company_id", selectedCompanyId);

      // POST /api/candidates/upload
      const res = await axios.post(`${apiUrl}/candidates/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.status === "success") {
        message.success("Candidato creado correctamente con CV");
        resetForm();
      } else {
        message.error(
          res.data.message || "Ocurrió un error al crear candidato"
        );
      }
    } catch (error) {
      console.error("Error al crear candidato con CV:", error);
      message.error("Error de conexión o servidor");
    }
  };

  const resetForm = () => {
    setPosition("");
    setName("");
    setWhatsapp("");
    setEmail("");
    setRef1Company("");
    setRef1Position("");
    setRef1Name("");
    setRef1Timeworked("");
    setRef1Whatsapp("");
    setRef2Company("");
    setRef2Position("");
    setRef2Name("");
    setRef2Timeworked("");
    setRef2Whatsapp("");
    setCvFile(null);
  };

  // ----------------------------------------------------------------
  //  CUANDO SE CREA EMPRESA (modal)
  // ----------------------------------------------------------------
  const handleCompanyCreated = () => {
    // Dependiendo si eres superadmin o no, recarga
    if (isSuperadmin) {
      fetchCompaniesForUser(selectedUserId);
    } else {
      fetchCompaniesForCurrentUser();
    }
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 24,
        background: "#fff",
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Nueva Contratación (Registro de Candidato con CV)
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        {/* 1) Si soy superadmin, elegir usuario */}
        {isSuperadmin && (
          <Form.Item label="Seleccionar Usuario (Dueño de las Empresas)">
            <Select
              value={selectedUserId}
              onChange={handleChangeUser}
              style={{ width: "100%" }}
            >
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.name} (ID: {u.id}) - RolID: {u.rol_id}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* 2) Seleccionar empresa */}
        <Form.Item label="Selecciona la Empresa" required>
          <div style={{ display: "flex", gap: 8 }}>
            <Select
              value={selectedCompanyId}
              onChange={(val) => setSelectedCompanyId(val)}
              style={{ width: "80%" }}
            >
              {companies.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name} (ID: {c.id})
                </Option>
              ))}
            </Select>
            {/* Botón para crear empresa */}
            {(isAdmin || isSuperadmin) && (
              <Button onClick={() => setShowCreateCompanyModal(true)}>
                Crear Empresa
              </Button>
            )}
          </div>
        </Form.Item>

        {/* 3) Datos del Candidato */}
        <Form.Item label="Puesto a contratar" required>
          <Select
            value={position}
            onChange={(val) => setPosition(val)}
            placeholder="Selecciona un puesto"
          >
            <Option value="Mesero">Mesero</Option>
            <Option value="Gerente">Gerente</Option>
            <Option value="Barman">Barman</Option>
            <Option value="Cocinero">Cocinero</Option>
            <Option value="Lavaloza">Lavaloza</Option>
            <Option value="Ayudante de Cocina">Ayudante de Cocina</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Nombre Completo" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Juan Pérez"
          />
        </Form.Item>

        <Form.Item label="WhatsApp" required>
          <Input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Ej. 5512345678"
          />
        </Form.Item>

        <Form.Item label="Correo Electrónico" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ej. juan@example.com"
          />
        </Form.Item>

        <Form.Item label="Seleccionar CV (pdf, doc, docx, jpg, png)" required>
          <input type="file" onChange={handleFileChange} />
          {cvFile && <p style={{ marginTop: 8 }}>Archivo: {cvFile.name}</p>}
        </Form.Item>

        {/* Ref Laboral 1 */}
        <h3 style={{ marginTop: 20 }}>Referencia Laboral 1</h3>
        <Form.Item label="Empresa">
          <Input
            value={ref1Company}
            onChange={(e) => setRef1Company(e.target.value)}
            placeholder="Nombre de empresa"
          />
        </Form.Item>
        <Form.Item label="Puesto que desempeñabas">
          <Input
            value={ref1Position}
            onChange={(e) => setRef1Position(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Nombre de contacto">
          <Input
            value={ref1Name}
            onChange={(e) => setRef1Name(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Tiempo laborado">
          <Input
            value={ref1Timeworked}
            onChange={(e) => setRef1Timeworked(e.target.value)}
            placeholder="Ej. 2 años"
          />
        </Form.Item>
        <Form.Item label="WhatsApp de contacto">
          <Input
            value={ref1Whatsapp}
            onChange={(e) => setRef1Whatsapp(e.target.value)}
          />
        </Form.Item>

        {/* Ref Laboral 2 */}
        <h3 style={{ marginTop: 20 }}>Referencia Laboral 2</h3>
        <Form.Item label="Empresa">
          <Input
            value={ref2Company}
            onChange={(e) => setRef2Company(e.target.value)}
            placeholder="Nombre de empresa"
          />
        </Form.Item>
        <Form.Item label="Puesto que desempeñabas">
          <Input
            value={ref2Position}
            onChange={(e) => setRef2Position(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Nombre de contacto">
          <Input
            value={ref2Name}
            onChange={(e) => setRef2Name(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Tiempo laborado">
          <Input
            value={ref2Timeworked}
            onChange={(e) => setRef2Timeworked(e.target.value)}
            placeholder="Ej. 1 año"
          />
        </Form.Item>
        <Form.Item label="WhatsApp de contacto">
          <Input
            value={ref2Whatsapp}
            onChange={(e) => setRef2Whatsapp(e.target.value)}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Registrar Candidato
          </Button>
        </Form.Item>
      </Form>

      {/* MODAL crear empresa */}
      <CreateCompanyModal
        visible={showCreateCompanyModal}
        onCancel={() => setShowCreateCompanyModal(false)}
        userId={isSuperadmin ? selectedUserId : auth.user?.id}
        token={token}
        apiUrl={apiUrl}
        onCompanyCreated={handleCompanyCreated}
      />
    </div>
  );
}

export default ContratacionesRRHH;
