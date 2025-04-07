import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Input, Select, Button, message } from "antd";
import { useAuth } from "../../../../components/AuthContext";
import CreateCompanyModal from "../../../../components/rolAdmin/RRHH/CompanyModal.js";
// Ajusta la ruta donde tengas tu modal de crear empresa

const { Option } = Select;

function ContratacionesRRHHAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // Rol
  const userRolName = auth.user?.rol?.name;
  const isAdmin = userRolName === "admin" || auth.user?.rol_id === 2;

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
    // Al montar, cargamos las empresas del Admin
    fetchCompaniesForAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Cargar las empresas que pertenecen al ADMIN actual.
   * Suponiendo que en tu backend, /api/companies ya filtra
   * por user_id = auth.user.id, o bien devuelva solo
   * las empresas de ese admin.
   */
  const fetchCompaniesForAdmin = async () => {
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
      console.error("Error al cargar empresas (admin):", error);
      message.error("Error de servidor al cargar empresas");
    }
  };

  /**
   * Manejar archivo CV
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCvFile(e.target.files[0]);
    }
  };

  /**
   * Subir/registrar candidato
   */
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

  /**
   * Cuando se crea empresa en el modal => recarga
   */
  const handleCompanyCreated = () => {
    fetchCompaniesForAdmin();
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

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Seleccionar empresa */}
        <div style={{ marginBottom: 16 }}>
          <label>Selecciona la Empresa:</label>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Select
              value={selectedCompanyId}
              onChange={(val) => setSelectedCompanyId(val)}
              style={{ width: "80%" }}
              placeholder="Empresas"
            >
              {companies.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name} (ID: {c.id})
                </Option>
              ))}
            </Select>
            {isAdmin && (
              <Button onClick={() => setShowCreateCompanyModal(true)}>
                Crear Empresa
              </Button>
            )}
          </div>
        </div>

        {/* Datos del Candidato */}
        <div style={{ marginBottom: 16 }}>
          <label>Puesto a contratar:</label>
          <Select
            value={position}
            onChange={(val) => setPosition(val)}
            style={{ width: "100%", marginTop: 4 }}
          >
            <Option value="Mesero">Mesero</Option>
            <Option value="Gerente">Gerente</Option>
            <Option value="Barman">Barman</Option>
            <Option value="Cocinero">Cocinero</Option>
            <Option value="Lavaloza">Lavaloza</Option>
            <Option value="Ayudante de Cocina">Ayudante de Cocina</Option>
          </Select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Nombre Completo:</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Juan Pérez"
            style={{ marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>WhatsApp:</label>
          <Input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Ej. 5512345678"
            style={{ marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Correo Electrónico:</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ej. juan@example.com"
            style={{ marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Seleccionar CV (pdf, doc, docx, jpg, png):</label>
          <br />
          <input type="file" onChange={handleFileChange} />
          {cvFile && <p>Archivo: {cvFile.name}</p>}
        </div>

        {/* Referencia Laboral 1 */}
        <h3 style={{ marginTop: 20 }}>Referencia Laboral 1</h3>
        <div style={{ marginBottom: 16 }}>
          <label>Empresa:</label>
          <Input
            value={ref1Company}
            onChange={(e) => setRef1Company(e.target.value)}
            style={{ marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Puesto que desempeñabas:</label>
          <Input
            value={ref1Position}
            onChange={(e) => setRef1Position(e.target.value)}
            style={{ marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Nombre de contacto:</label>
          <Input
            value={ref1Name}
            onChange={(e) => setRef1Name(e.target.value)}
            style={{ marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Tiempo laborado:</label>
          <Input
            value={ref1Timeworked}
            onChange={(e) => setRef1Timeworked(e.target.value)}
            placeholder="Ej. 2 años"
            style={{ marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>WhatsApp de contacto:</label>
          <Input
            value={ref1Whatsapp}
            onChange={(e) => setRef1Whatsapp(e.target.value)}
            style={{ marginTop: 4 }}
          />
        </div>

        {/* Referencia Laboral 2 */}
        <h3 style={{ marginTop: 20 }}>Referencia Laboral 2</h3>
        <div style={{ marginBottom: 16 }}>
          <label>Empresa:</label>
          <Input
            value={ref2Company}
            onChange={(e) => setRef2Company(e.target.value)}
            style={{ marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Puesto que desempeñabas:</label>
          <Input
            value={ref2Position}
            onChange={(e) => setRef2Position(e.target.value)}
            style={{ marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Nombre de contacto:</label>
          <Input
            value={ref2Name}
            onChange={(e) => setRef2Name(e.target.value)}
            style={{ marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Tiempo laborado:</label>
          <Input
            value={ref2Timeworked}
            onChange={(e) => setRef2Timeworked(e.target.value)}
            placeholder="Ej. 1 año"
            style={{ marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>WhatsApp de contacto:</label>
          <Input
            value={ref2Whatsapp}
            onChange={(e) => setRef2Whatsapp(e.target.value)}
            style={{ marginTop: 4 }}
          />
        </div>

        <Button type="primary" onClick={handleSubmit}>
          Registrar Candidato
        </Button>
      </form>

      {/* MODAL crear empresa */}
      <CreateCompanyModal
        visible={showCreateCompanyModal}
        onCancel={() => setShowCreateCompanyModal(false)}
        userId={auth.user?.id}
        token={token}
        apiUrl={apiUrl}
        onCompanyCreated={handleCompanyCreated}
      />
    </div>
  );
}

export default ContratacionesRRHHAdmin;
