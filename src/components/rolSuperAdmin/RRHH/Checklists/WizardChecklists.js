// components/rolSuperAdmin/RRHH/Checklists/WizardChecklists.jsx
import React, { useState } from "react";
import { Steps, Button, Form, Input, Select, Space, message } from "antd";
import axios from "axios";
import { useAuth } from "../../../AuthContext";
import SelectUserCompanyPosition from "./SelectUserCompanyPosition";

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

export default function WizardChecklists() {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = auth?.token;

  const [form] = Form.useForm();
  const [step, setStep] = useState(0);

  /* ------------------ navegación ------------------ */
  const next = async () => {
    try {
      await form.validateFields();
      setStep((s) => s + 1);
    } catch {}
  };
  const prev = () => setStep((s) => s - 1);

  /* ------------------ submit ---------------------- */
  const handleFinish = async () => {
    // obtenemos TODOS los valores, incluso los de pasos desmontados
    const raw = form.getFieldsValue(true);
    const items = (raw.items || []).filter(Boolean); // quitamos vacíos

    if (!items.length) {
      message.warning("Agrega al menos una tarea");
      setStep(1);
      return;
    }

    const payload = {
      title: raw.title,
      content: raw.content,
      type: raw.type,
      userId: raw.userId || null,
      companyId: raw.companyId || null,
      positionId: raw.positionId || null,
      items: items.map((t, i) => ({ task: t, order: i })),
    };

    try {
      await axios.post(`${apiUrl}/rrhh-checklists`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Checklist creado");
      form.resetFields();
      setStep(0);
    } catch (err) {
      console.error(err);
      message.error("Error al crear checklist");
    }
  };

  /* ------------------ contenido por paso ----------- */
  const content = [
    /* Paso 0: Datos básicos */
    <>
      <Form.Item
        name="title"
        label="Título"
        rules={[{ required: true, message: "Escribe un título" }]}
      >
        <Input placeholder="Ej. Apertura Meseros" />
      </Form.Item>

      <Form.Item
        name="type"
        label="Tipo"
        initialValue="opening"
        rules={[{ required: true }]}
      >
        <Select>
          <Option value="opening">Apertura</Option>
          <Option value="intermediate">Intermedio</Option>
          <Option value="closing">Cierre</Option>
        </Select>
      </Form.Item>

      <Form.Item name="content" label="Descripción">
        <TextArea rows={4} />
      </Form.Item>
    </>,

    /* Paso 1: Tareas */
    <>
      <Form.List
        name="items"
        preserve={true}
        rules={[{ required: true, message: "Agrega al menos 1 tarea" }]}
      >
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...rest }) => (
              <Space key={key} style={{ display: "flex", marginBottom: 8 }}>
                <Form.Item
                  {...rest}
                  name={name}
                  rules={[{ required: true, message: "Tarea vacía" }]}
                  style={{ width: 400 }}
                >
                  <Input placeholder="Ej. Revisar mise en place" />
                </Form.Item>
                <Button onClick={() => remove(name)}>Eliminar</Button>
              </Space>
            ))}
            <Button type="dashed" onClick={() => add()}>
              + Añadir tarea
            </Button>
          </>
        )}
      </Form.List>
    </>,

    /* Paso 2: Asignación */
    <>
      {/* campos ocultos para la selección */}
      <Form.Item name="userId" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="companyId" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="positionId" hidden>
        <Input />
      </Form.Item>

      <p>Asigna este checklist a un usuario/empresa/puesto o déjalo global:</p>
      <SelectUserCompanyPosition onChange={(d) => form.setFieldsValue(d)} />
    </>,
  ];

  /* ------------------ render ----------------------- */
  return (
    <>
      <Steps current={step} style={{ marginBottom: 24 }}>
        <Step title="Datos básicos" />
        <Step title="Tareas" />
        <Step title="Asignación" />
      </Steps>

      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: 600 }}
        onFinish={handleFinish}
      >
        {content[step]}

        <div style={{ marginTop: 24 }}>
          {step > 0 && (
            <Button style={{ marginRight: 8 }} onClick={prev}>
              Anterior
            </Button>
          )}
          {step < 2 && (
            <Button type="primary" onClick={next}>
              Siguiente
            </Button>
          )}
          {step === 2 && (
            <Button type="primary" htmlType="submit">
              Guardar Checklist
            </Button>
          )}
        </div>
      </Form>
    </>
  );
}
