// file: EditEncuesta.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Form, Input, Switch, Button, message, Space, Select } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

/**
 * Este componente permite editar tanto:
 * 1) SurveyRequest (cuando isRequest===true) => /survey-requests/:id
 *    - Campos: title, status, notes, questions_json
 * 2) Survey (cuando isRequest===false) => /surveys/:id
 *    - Campos: title, is_active, questions, code, etc.
 */
export default function EditEncuesta({ isRequest = false }) {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { id } = useParams(); // ID (solicitud o encuesta)

  const [loading, setLoading] = useState(false);
  const [itemData, setItemData] = useState(null);

  // Form Ant Design
  const [form] = Form.useForm();

  // Carga la solicitud o encuesta al montar
  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);

      // Endpoint: /survey-requests/:id o /surveys/:id
      const url = isRequest
        ? `${apiUrl}/survey-requests/${id}`
        : `${apiUrl}/surveys/${id}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = res.data;
      setItemData(data);

      // Si es SurveyRequest => parseamos questionsJson
      if (isRequest) {
        let questionsParsed = [];
        if (data.questionsJson) {
          // "questionsJson" puede ser string (JSON) o un array
          questionsParsed = Array.isArray(data.questionsJson)
            ? data.questionsJson
            : JSON.parse(data.questionsJson);
        }

        // Mapeamos a la forma { questionText, type, options? }
        const questionsForForm = questionsParsed.map((q) => ({
          questionText: q.question_text,
          type: q.type,
          // Si guardas array en q.options_json, lo ponemos en 'options'
          options: Array.isArray(q.options_json) ? q.options_json : [],
        }));

        // Llenamos el form con (title, status, notes, questions)
        form.setFieldsValue({
          title: data.title,
          status: data.status,
          notes: data.notes,
          questions: questionsForForm,
        });
      } else {
        // Survey => data => { title, is_active, code, questions: [...] }
        const questionsForForm = (data.questions || []).map((q) => ({
          id: q.id,
          questionText: q.questionText,
          type: q.type,
          // Si el backend usa 'optionsJson', mapeamos a 'options'
          options: Array.isArray(q.optionsJson) ? q.optionsJson : [],
        }));

        // Llenamos el form con (title, is_active, questions)
        form.setFieldsValue({
          title: data.title,
          is_active: data.isActive,
          questions: questionsForForm,
        });
      }
    } catch (err) {
      console.error("fetchItem =>", err);
      message.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (isRequest) {
        // Mapeamos las preguntas para guardarlas en questions_json
        const questionsData = (values.questions || []).map((q) => ({
          question_text: q.questionText || "Pregunta sin texto",
          type: q.type || "text",
          options_json: q.options || null,
        }));

        const payload = {
          title: values.title,
          status: values.status,
          notes: values.notes || null,
          questions_json: questionsData,
        };

        // 1) Hacemos PUT para actualizar la solicitud (tabla survey_requests)
        await axios.put(`${apiUrl}/survey-requests/${id}`, payload, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        // 2) Si el status es "approved", llamamos a POST /survey-requests/:id/approve
        if (values.status === "approved") {
          await axios.post(
            `${apiUrl}/survey-requests/${id}/approve`,
            {},
            {
              headers: { Authorization: `Bearer ${auth.token}` },
            }
          );
          message.success("Solicitud aprobada y encuesta creada correctamente");
        } else {
          message.success("Solicitud actualizada correctamente");
        }
      } else {
        // ================================
        // Para Encuesta final => /surveys/:id
        // ================================
        const parsedQuestions = (values.questions || []).map((q, index) => ({
          id: q.id,
          question_text: q.questionText || "Pregunta sin texto",
          type: q.type || "text",
          order_index: index,
          // si la app maneja un array de opciones, lo guardamos en 'options_json'
          options_json: q.options || null,
        }));

        const payload = {
          title: values.title,
          is_active: values.is_active,
          questions: parsedQuestions,
        };

        await axios.put(`${apiUrl}/surveys/${id}`, payload, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        message.success("Encuesta actualizada correctamente");
      }

      // Volvemos al panel
      navigate("/panelencuesta");
    } catch (err) {
      console.error("Error al actualizar =>", err);
      message.error("No se pudo actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 750, margin: "0 auto", padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        {isRequest
          ? `Editar Solicitud (ID: ${id})`
          : `Editar Encuesta (ID: ${id})`}
      </h2>

      {/* Muestra código si NO es request y existe itemData.code */}
      {!isRequest && itemData && itemData.code && (
        <div style={{ marginBottom: 16 }}>
          <p>
            <strong>Código:</strong> {itemData.code}
          </p>
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Título */}
        <Form.Item
          label="Título"
          name="title"
          rules={[{ required: true, message: "El título es obligatorio" }]}
        >
          <Input />
        </Form.Item>

        {/* Campos diferentes según sea Solicitud o Encuesta */}
        {isRequest ? (
          <>
            {/* Estatus de la Solicitud */}
            <Form.Item label="Estatus" name="status">
              <Select>
                <Select.Option value="pending">Pendiente</Select.Option>
                <Select.Option value="approved">Aprobada</Select.Option>
                <Select.Option value="rejected">Rechazada</Select.Option>
              </Select>
            </Form.Item>

            {/* Notas */}
            <Form.Item label="Notas" name="notes">
              <Input.TextArea rows={2} placeholder="Notas adicionales..." />
            </Form.Item>
          </>
        ) : (
          // Para Encuesta final => is_active
          <Form.Item
            label="¿Encuesta activa?"
            name="is_active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        )}

        <h3 style={{ margin: "16px 0 8px 0" }}>Preguntas</h3>

        <Form.List name="questions">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  {/* Texto de la pregunta */}
                  <Form.Item
                    {...restField}
                    label="Texto"
                    name={[name, "questionText"]}
                    rules={[
                      {
                        required: true,
                        message: "Ingresa el texto de la pregunta",
                      },
                    ]}
                  >
                    <Input style={{ width: 220 }} />
                  </Form.Item>

                  {/* Tipo de pregunta */}
                  <Form.Item
                    {...restField}
                    label="Tipo"
                    name={[name, "type"]}
                    rules={[{ required: true, message: "Selecciona el tipo" }]}
                  >
                    <Select style={{ width: 130 }}>
                      <Select.Option value="scale">Escala (1-10)</Select.Option>
                      <Select.Option value="yesno">Sí/No</Select.Option>
                      <Select.Option value="text">Texto</Select.Option>
                      <Select.Option value="multiple_choice">
                        Múltiple
                      </Select.Option>
                    </Select>
                  </Form.Item>

                  {/* Para multiple_choice => Select modo 'tags' */}
                  <Form.Item noStyle shouldUpdate>
                    {() => {
                      const curType = form.getFieldValue([
                        "questions",
                        name,
                        "type",
                      ]);
                      if (curType === "multiple_choice") {
                        return (
                          <Form.Item
                            {...restField}
                            label="Opciones"
                            name={[name, "options"]}
                          >
                            <Select mode="tags" style={{ width: 200 }} />
                          </Form.Item>
                        );
                      }
                      return null;
                    }}
                  </Form.Item>

                  {/* Botón para eliminar pregunta */}
                  <Button
                    danger
                    type="text"
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                  />
                </Space>
              ))}

              {/* Botón para agregar nueva pregunta */}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  Agregar Pregunta
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* Botón final */}
        <Button type="primary" htmlType="submit" loading={loading}>
          Guardar Cambios
        </Button>
      </Form>
    </div>
  );
}
