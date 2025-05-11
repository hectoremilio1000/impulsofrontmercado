import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Form, Input, Button, Select, message, Card, Row, Col } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

/**
 * Componente para crear una solicitud de encuesta (SurveyRequest).
 */
export default function SolicitarEncuesta() {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]); // compañías filtradas
  const [loading, setLoading] = useState(false);

  /* preguntas dinámicas */
  const [questions, setQuestions] = useState([]);

  /* ────────── cargar usuarios al montar ────────── */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const allUsers = data.data || [];
      const allowed = allUsers.filter((u) => [2].includes(u.rol?.id)); // admin / restaurantero
      setUsers(allowed);
    } catch (err) {
      console.error(err);
      message.error("No se pudo cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ────────── cargar compañías según usuario ────────── */
  const loadCompaniesForUser = async (userId) => {
    if (!userId) return setCompanies([]);

    /* ① intentar obtener compañías ya precargadas en el usuario */
    const user = users.find((u) => u.id === userId);
    if (user?.companies?.length) {
      setCompanies(user.companies);
      return;
    }

    /* ② si no existen, llamar endpoint /users/:id (con preload companies) */
    try {
      const { data } = await axios.get(`${apiUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setCompanies(data.data?.companies || []);
    } catch (err) {
      console.error("Error cargando compañías:", err);
      setCompanies([]);
    }
  };

  /* ────────── preguntas helpers ────────── */
  const addQuestion = () =>
    setQuestions((qs) => [
      ...qs,
      { type: "scale", question_text: "", options_json: null },
    ]);

  const removeQuestion = (idx) =>
    setQuestions((qs) => qs.filter((_, i) => i !== idx));

  const updateQuestion = (idx, field, value) =>
    setQuestions((qs) =>
      qs.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );

  /* ────────── submit ────────── */
  const onFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        user_id: values.user_id,
        company_id: values.company_id,
        title: values.title,
        notes: values.notes || null,
        questions_json: questions,
      };

      await axios.post(`${apiUrl}/survey-requests`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      message.success("Solicitud de Encuesta creada exitosamente");
      form.resetFields();
      setCompanies([]);
      setQuestions([]);
    } catch (err) {
      console.error(err);
      message.error("No se pudo crear la solicitud");
    } finally {
      setLoading(false);
    }
  };

  /* ────────── UI ────────── */
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Solicitar Encuesta (Superadmin)
      </h2>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* usuario */}
        <Form.Item
          label="Seleccionar Usuario"
          name="user_id"
          rules={[{ required: true, message: "Selecciona un usuario" }]}
        >
          <Select
            placeholder="Escoge un usuario"
            allowClear
            onChange={(val) => {
              /* limpia compañía al cambiar de usuario */
              form.setFieldsValue({ company_id: null });
              loadCompaniesForUser(val);
            }}
          >
            {users.map((u) => (
              <Option key={u.id} value={u.id}>
                {u.name} (Rol: {u.rol?.name})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* compañía */}
        <Form.Item
          label="Compañía"
          name="company_id"
          rules={[{ required: true, message: "Selecciona una compañía" }]}
        >
          <Select
            placeholder="Escoge la empresa"
            disabled={companies.length === 0}
          >
            {companies.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* título */}
        <Form.Item
          label="Título de la Encuesta"
          name="title"
          rules={[{ required: true, message: "Título es requerido" }]}
        >
          <Input placeholder="Ej. Encuesta de Satisfacción" />
        </Form.Item>

        {/* notas */}
        <Form.Item label="Notas" name="notes">
          <Input.TextArea rows={2} placeholder="Notas adicionales..." />
        </Form.Item>

        {/* preguntas dinámicas */}
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
                    <Option value="yesno">Sí / No</Option>
                    <Option value="text">Texto libre</Option>
                    <Option value="multiple_choice">Múltiple opción</Option>
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

              {/* opciones para multiple_choice */}
              {q.type === "multiple_choice" && (
                <div style={{ marginTop: 8 }}>
                  <label>Opciones</label>
                  <Select
                    mode="tags"
                    style={{ width: "100%" }}
                    value={Array.isArray(q.options_json) ? q.options_json : []}
                    onChange={(vals) =>
                      updateQuestion(idx, "options_json", vals)
                    }
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

        {/* enviar */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Crear Solicitud
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
