/**
 * file: src/pages/superadmin/Moduls/AyudaIA/AyudaIA.jsx
 */
import React, { useEffect, useState } from "react";
import { Modal, Select, Input, Button, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AyudaIA() {
  const navigate = useNavigate();

  // URL base de tu API, ejemplo "http://localhost:3333" o lo que definas en .env
  const apiUrl = process.env.REACT_APP_API_URL;

  // Controla si el Modal está abierto o cerrado
  const [open, setOpen] = useState(false);

  // "prospect" o "user"
  const [selectedType, setSelectedType] = useState("prospect");

  // Loading mientras se crea el prospect
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Datos para crear prospect
  const [prospectData, setProspectData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    whatsapp: "",
    status: "creado",
    origin: "panelIA",
  });

  // Para la lista de usuarios sin recomendación
  const [usersNoRec, setUsersNoRec] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  // Cada vez que abra el modal y seleccione "user", cargamos la lista
  useEffect(() => {
    if (open && selectedType === "user") {
      fetchUsersNoRec();
    }
  }, [open, selectedType]);

  /**
   * Llama al endpoint para obtener usuarios sin recomendación
   */
  async function fetchUsersNoRec() {
    try {
      const resp = await axios.get(
        `${apiUrl}/list-users-without-recommendation`
      );
      setUsersNoRec(resp.data || []);
    } catch (error) {
      console.error("Error fetchUsersNoRec:", error);
      message.error("Error cargando usuarios sin recomendación");
    }
  }

  /**
   * Crea un prospect nuevo en el backend.
   */
  async function createProspect(newProspect) {
    try {
      const response = await axios.post(`${apiUrl}/prospects`, newProspect);
      return response.data; // Devuelve la respuesta JSON
    } catch (error) {
      console.error("Upload error:", error);
      throw error; // Lanza el error para que sea capturado en el try/catch de arriba
    }
  }

  /**
   * Abre el modal
   */
  const handleOpen = () => setOpen(true);

  /**
   * Cierra el modal y resetea valores
   */
  const handleClose = () => {
    setOpen(false);
    setSelectedType("prospect");
    setSelectedUserId("");
    setProspectData({
      first_name: "",
      last_name: "",
      email: "",
      whatsapp: "",
    });
  };

  /**
   * Al confirmar el Modal, decidimos si creamos un prospect o seleccionamos un user
   */
  async function handleConfirm() {
    if (selectedType === "prospect") {
      // 1) Validar datos
      if (!prospectData.first_name || !prospectData.email) {
        message.warning("Faltan datos de prospect (nombres/email)");
        return;
      }

      // 2) Llamar a createProspect
      setLoadingCreate(true);
      try {
        const respData = await createProspect(prospectData);
        if (respData.status === "success") {
          const newId = respData.data.id; // El ID del prospecto recién creado
          message.success("Prospect creado exitosamente");
          setOpen(false);
          // Redirigir a /ayudaia/llenar-encuesta?type=prospect&id=...
          navigate(
            `/superadmin/ayudaia/llenar-encuesta?type=prospect&id=${newId}`
          );
        } else {
          message.error("Ocurrió un error al crear el prospect");
        }
      } catch (error) {
        console.error(error);
        message.error("Error al crear prospect (ver consola)");
      } finally {
        setLoadingCreate(false);
      }
    } else {
      // selectedType === "user"
      if (!selectedUserId) {
        message.warning("Selecciona un usuario sin recomendación");
        return;
      }
      // Redirigir a /ayudaia/llenar-encuesta?type=user&id=...
      setOpen(false);
      navigate(
        `/superadmin/ayudaia/llenar-encuesta?type=user&id=${selectedUserId}`
      );
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 className="text-2xl font-bold mb-4">
        Panel de “Ayuda con IA” (Super Admin)
      </h1>

      <Button type="primary" onClick={handleOpen}>
        Crear Encuesta
      </Button>

      <Modal
        title="¿Para quién es la encuesta?"
        open={open}
        onOk={handleConfirm}
        onCancel={handleClose}
        okText="Confirmar"
        cancelText="Cerrar"
      >
        {/* 
          Si quieres mostrar un Spinner mientras crea al prospect, 
          puedes colocar algo así:
        */}
        {loadingCreate && (
          <div style={{ marginBottom: 16 }}>
            <Spin tip="Creando prospect..." />
          </div>
        )}

        {/* Tipo: "prospect" o "user" */}
        <div style={{ marginBottom: 16 }}>
          <label>Tipo:</label>
          <Select
            style={{ width: "100%", marginTop: 4 }}
            value={selectedType}
            onChange={(val) => setSelectedType(val)}
            disabled={loadingCreate} // Deshabilitar cambio mientras crea
          >
            <Select.Option value="prospect">Prospecto (nuevo)</Select.Option>
            <Select.Option value="user">
              Usuario existente (sin recomendación)
            </Select.Option>
          </Select>
        </div>

        {selectedType === "prospect" ? (
          // FORMULARIO PARA CREAR PROSPECT
          <div>
            <div style={{ marginBottom: 16 }}>
              <label>Nombres:</label>
              <Input
                style={{ marginTop: 4 }}
                value={prospectData.first_name}
                onChange={(e) =>
                  setProspectData({
                    ...prospectData,
                    first_name: e.target.value,
                  })
                }
                disabled={loadingCreate}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Apellidos:</label>
              <Input
                style={{ marginTop: 4 }}
                value={prospectData.last_name}
                onChange={(e) =>
                  setProspectData({
                    ...prospectData,
                    last_name: e.target.value,
                  })
                }
                disabled={loadingCreate}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Email:</label>
              <Input
                type="email"
                style={{ marginTop: 4 }}
                value={prospectData.email}
                onChange={(e) =>
                  setProspectData({ ...prospectData, email: e.target.value })
                }
                disabled={loadingCreate}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Whatsapp:</label>
              <Input
                style={{ marginTop: 4 }}
                value={prospectData.whatsapp}
                onChange={(e) =>
                  setProspectData({ ...prospectData, whatsapp: e.target.value })
                }
                disabled={loadingCreate}
              />
            </div>
          </div>
        ) : (
          // SELECT PARA ESCOGER USUARIO SIN RECOMENDACIÓN
          <div>
            <label>Usuario sin recomendación:</label>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Selecciona un usuario"
              value={selectedUserId || undefined}
              onChange={(val) => setSelectedUserId(val)}
              disabled={loadingCreate}
            >
              {usersNoRec.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.name} (ID: {user.id})
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AyudaIA;
