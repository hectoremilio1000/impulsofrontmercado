// src/pages/superadmin/Moduls/Encuestas/SolicitarEncuesta.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Form, Input, Button, Select, message, Card, Row, Col } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

/**
 * Componente para crear una solicitud de encuesta (SurveyRequest).
 * El superadmin puede:
 *  - Seleccionar un user_id.
 *  - Poner un título y notas.
 *  - Agregar preguntas dinámicamente (type, question_text, etc.).
 */
export default function SolicitarEncuesta() {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Aquí guardamos las preguntas
  const [questions, setQuestions] = useState([]);

  // Cargar lista de usuarios si superadmin quiere asignar a X user
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${apiUrl}/users`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const allUsers = resp.data.data || [];
      // Ajusta si roles 2 y 3 => admin / restaurantero
      const filtrados = allUsers.filter((u) => [2, 3].includes(u.rol?.id));
      setUsers(filtrados);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      message.error("No se pudo cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Agregar una pregunta nueva
  const addQuestion = () => {
    const newQ = {
      type: "scale", // Por defecto
      question_text: "",
      options_json: null,
    };
    setQuestions([...questions, newQ]);
  };

  // Eliminar una pregunta
  const removeQuestion = (index) => {
    const copy = [...questions];
    copy.splice(index, 1);
    setQuestions(copy);
  };

  // Actualizar un campo de la pregunta
  const updateQuestion = (index, field, value) => {
    const copy = [...questions];
    copy[index][field] = value;
    setQuestions(copy);
  };

  // Enviar formulario => Crear SurveyRequest
  const onFinish = async (values) => {
    try {
      setLoading(true);

      // No stringify en el front, sólo mandamos un array
      const payload = {
        user_id: values.user_id,
        title: values.title,
        notes: values.notes || null,
        questions_json: questions, // <-- mandamos el array
      };

      await axios.post(`${apiUrl}/survey-requests`, payload, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      message.success("Solicitud de Encuesta creada exitosamente");
      form.resetFields();
      setQuestions([]); // Limpia las preguntas
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
        Solicitar Encuesta (Superadmin)
      </h2>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Selecciona Usuario */}
        <Form.Item
          label="Seleccionar Usuario"
          name="user_id"
          rules={[{ required: true, message: "Selecciona un usuario" }]}
        >
          <Select placeholder="Escoge un usuario" allowClear>
            {users.map((u) => (
              <Option key={u.id} value={u.id}>
                {u.name} (Rol: {u.rol?.name})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Título */}
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
                    // Si q.options_json ya es un array, lo usamos.
                    // Si es null, usamos []
                    value={Array.isArray(q.options_json) ? q.options_json : []}
                    onChange={(value) => {
                      // 'value' es un array de strings
                      updateQuestion(idx, "options_json", value);
                    }}
                    // Puedes usar tokenSeparators si deseas que la coma también divida tokens
                    // tokenSeparators={[","]}
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
