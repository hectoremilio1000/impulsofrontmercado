// src/pages/admin/Moduls/Encuestas/SolicitarEncuestasAdmin.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Form, Input, Button, Select, message, Card, Row, Col } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

function SolicitarEncuestasAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;
  const [form] = Form.useForm();

  // Manejo de loading
  const [loading, setLoading] = useState(false);

  // PREGUNTAS dinámicas
  const [questions, setQuestions] = useState([]);

  // EMPRESAS del usuario (admin) para elegir
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // 1) Cargar las empresas asociadas al usuario admin
  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line
  }, []);

  const fetchCompanies = async () => {
    try {
      const resp = await axios.get(`${apiUrl}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.status === "success") {
        const list = resp.data.data || [];
        // Si tu user es admin, filtra las suyas:
        // ... o si el backend ya las filtra, sólo asignas:
        setCompanies(list);

        // Escoger la primera como default, si quieres
        if (list.length > 0) {
          setSelectedCompany(list[0].id);
        }
      } else {
        message.error("No se pudieron cargar las empresas");
      }
    } catch (error) {
      console.error("Error al cargar empresas:", error);
      message.error("Error al cargar la lista de empresas");
    }
  };

  // 2) Funciones para añadir / eliminar / actualizar preguntas
  const addQuestion = () => {
    const newQ = {
      type: "scale", // Valor por defecto
      question_text: "",
      options_json: null,
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (index) => {
    const copy = [...questions];
    copy.splice(index, 1);
    setQuestions(copy);
  };

  const updateQuestion = (index, field, value) => {
    const copy = [...questions];
    copy[index][field] = value;
    setQuestions(copy);
  };

  // 3) Al enviar el form => crear la SurveyRequest
  const onFinish = async (values) => {
    try {
      setLoading(true);

      // user_id = actual user (admin)
      const currentUserId = auth.user?.id;
      if (!currentUserId) {
        message.error("No se encontró el ID de usuario");
        return;
      }

      if (!selectedCompany) {
        message.warning(
          "Por favor, selecciona la empresa antes de crear la encuesta"
        );
        return;
      }

      // Construimos el payload
      const payload = {
        user_id: currentUserId,
        company_id: selectedCompany, // Aquí le mandamos la empresa seleccionada
        title: values.title,
        notes: values.notes || null,
        questions_json: questions, // enviamos el array
      };

      await axios.post(`${apiUrl}/survey-requests`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      message.success("Solicitud de Encuesta creada exitosamente");
      form.resetFields();
      setQuestions([]);
    } catch (error) {
      console.error("Error al crear la solicitud =>", error);
      message.error("No se pudo crear la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Solicitar Encuesta (Admin / Cliente)
      </h2>

      {/* Formulario principal */}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Seleccionar la empresa */}
        <Form.Item label="Empresa">
          <Select
            placeholder="Selecciona la empresa"
            value={selectedCompany ?? ""}
            onChange={(val) => setSelectedCompany(val)}
            style={{ width: "100%" }}
          >
            {companies.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name} (ID {c.id})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Título de la encuesta */}
        <Form.Item
          label="Título de la Encuesta"
          name="title"
          rules={[{ required: true, message: "Título es requerido" }]}
        >
          <Input placeholder="Ej. Encuesta de Satisfacción" />
        </Form.Item>

        {/* Notas */}
        <Form.Item label="Notas" name="notes">
          <Input.TextArea rows={2} placeholder="Notas adicionales..." />
        </Form.Item>

        {/* Preguntas Dinámicas */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Preguntas</h3>
          {questions.map((q, idx) => (
            <Card
              key={idx}
              size="small"
              style={{ marginBottom: 8, border: "1px solid #ddd" }}
            >
              <Row gutter={8}>
                <Col span={6}>
                  <label>Tipo de Pregunta</label>
                  <Select
                    style={{ width: "100%" }}
                    value={q.type}
                    onChange={(val) => updateQuestion(idx, "type", val)}
                  >
                    <Option value="scale">Escala (1-10)</Option>
                    <Option value="yesno">Sí/No</Option>
                    <Option value="text">Texto / Comentario</Option>
                    <Option value="multiple_choice">Múltiple Opción</Option>
                  </Select>
                </Col>
                <Col span={16}>
                  <label>Texto de la pregunta</label>
                  <Input
                    value={q.question_text}
                    onChange={(e) =>
                      updateQuestion(idx, "question_text", e.target.value)
                    }
                    placeholder="Ej: ¿Qué te pareció el servicio?"
                  />
                </Col>
                <Col
                  span={2}
                  style={{ display: "flex", alignItems: "flex-end" }}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeQuestion(idx)}
                  />
                </Col>
              </Row>

              {/* Opciones si es multiple_choice */}
              {q.type === "multiple_choice" && (
                <div style={{ marginTop: 8 }}>
                  <label>Opciones</label>
                  <Select
                    mode="tags"
                    style={{ width: "100%" }}
                    value={Array.isArray(q.options_json) ? q.options_json : []}
                    onChange={(value) => {
                      updateQuestion(idx, "options_json", value);
                    }}
                    placeholder="Escribe una opción y presiona Enter"
                  />
                </div>
              )}
            </Card>
          ))}

          <Button icon={<PlusOutlined />} onClick={addQuestion}>
            Agregar Pregunta
          </Button>
        </div>

        {/* Botón Final */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Crear Solicitud
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default SolicitarEncuestasAdmin;
