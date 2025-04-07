import React, { useState } from "react";
import { Steps, Button, Form, Input, message } from "antd";
import axios from "axios";
import { useAuth } from "../../../AuthContext";
import SelectUserCompanyPosition from "./SelectUserCompanyPosition";
// Ajusta la ruta si fuera necesario

const { Step } = Steps;
const { TextArea } = Input;

function WizardManuales() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [currentStep, setCurrentStep] = useState(0);

  // Estado del manual
  const [manualData, setManualData] = useState({
    title: "",
    content: "",
    userId: null,
    companyId: null,
    positionId: null,
  });

  // Avanzar al siguiente paso
  const handleNext = () => {
    // Validaciones rápidas
    if (currentStep === 0) {
      if (!manualData.title) {
        return message.warning("Ingresa el título del manual");
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  // Retroceder
  const handlePrev = () => setCurrentStep((prev) => prev - 1);

  // Al finalizar => guardar (POST o PUT según tu lógica)
  const handleFinish = async () => {
    try {
      // Supón que es creación (POST). Si fuera edición, usarías PUT.
      const resp = await axios.post(
        `${apiUrl}/training-manuals`,
        { ...manualData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (resp.data.status === "success") {
        message.success(
          "Manual creado (y asignado si elegiste usuario/empresa/puesto)"
        );
        // Limpia estados, o haz lo que quieras
        setManualData({
          title: "",
          content: "",
          userId: null,
          companyId: null,
          positionId: null,
        });
        setCurrentStep(0); // regresa al primer paso
      } else {
        message.error("Error al crear manual");
      }
    } catch (error) {
      console.error("Error al crear manual =>", error);
      message.error("Error de servidor al crear manual");
    }
  };

  // Render de cada paso del wizard
  const steps = [
    {
      title: "Datos Básicos",
      content: (
        <Form layout="vertical" style={{ maxWidth: 600 }}>
          <Form.Item label="Título">
            <Input
              value={manualData.title}
              onChange={(e) =>
                setManualData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Ej. Manual de Meseros"
            />
          </Form.Item>
          <Form.Item label="Contenido (Descripción)">
            <TextArea
              rows={5}
              value={manualData.content}
              onChange={(e) =>
                setManualData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Describe el manual, pasos, etc."
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      title: "Asignación (Opcional)",
      content: (
        <div style={{ maxWidth: 600 }}>
          <p>
            ¿Quieres asignar este manual a un usuario/empresa/puesto de
            inmediato?
          </p>
          <SelectUserCompanyPosition
            onChange={(data) => {
              // Actualizar el estado del wizard con { userId, companyId, positionId }
              setManualData((prev) => ({
                ...prev,
                userId: data.userId,
                companyId: data.companyId,
                positionId: data.positionId,
              }));
            }}
          />
          <p style={{ color: "#999" }}>
            Si no deseas asignarlo aún, deja los campos en blanco.
          </p>
        </div>
      ),
    },
    {
      title: "Confirmar",
      content: (
        <div>
          <h4>Revisa la información:</h4>
          <p>
            <strong>Título:</strong> {manualData.title || "(vacío)"}
          </p>
          <p>
            <strong>Contenido:</strong>{" "}
            {manualData.content?.substring(0, 60) || "(vacío)"}...
          </p>
          <p>
            <strong>Usuario ID:</strong> {manualData.userId || "(sin asignar)"}
          </p>
          <p>
            <strong>Empresa ID:</strong>{" "}
            {manualData.companyId || "(sin asignar)"}
          </p>
          <p>
            <strong>Puesto ID:</strong>{" "}
            {manualData.positionId || "(sin asignar)"}
          </p>
          <p>Haz clic en “Finalizar” para guardar.</p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>

      <div style={{ minHeight: 200 }}>{steps[currentStep].content}</div>

      <div style={{ marginTop: 24 }}>
        {currentStep > 0 && (
          <Button style={{ marginRight: 8 }} onClick={handlePrev}>
            Anterior
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={handleNext}>
            Siguiente
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button type="primary" onClick={handleFinish}>
            Finalizar
          </Button>
        )}
      </div>
    </div>
  );
}

export default WizardManuales;
