import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  message,
  Switch,
  Select,
  Divider,
  Space,
  Typography,
  InputNumber,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { useAuth } from "../../../components/AuthContext";

const { Text } = Typography;

export default function CrearBlog() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { auth } = useAuth();
  const token = auth?.token;
  const user = auth?.user;

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const id = search.get("id");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
    if (id) fetchPost();
  }, [id]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setUsers(res.data.data);
        if (!id) {
          form.setFieldValue("authorId", user.id);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchPost = async () => {
    try {
      const res = await axios.get(`${apiUrl}/blog-posts/id/${id}`);

      const data = res.data;
      form.setFieldsValue({
        ...data,
        published: !!data.publishedAt,
        publishedAt: data.publishedAt ? dayjs(data.publishedAt) : null,
        blocks: data.blocks || [],
        authorId: data.author?.id,
      });
    } catch (err) {
      console.error(err);
      message.error("Error al cargar post");
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const publishedAt =
        values.published && values.publishedAt
          ? dayjs(values.publishedAt).toDate()
          : null;

      const payload = {
        ...values,
        publishedAt,
        content: null,
        authorId: values.authorId || user.id,
      };

      if (id) {
        await axios.put(`${apiUrl}/blog-posts/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${apiUrl}/blog-posts`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      message.success("Post guardado correctamente");
      navigate("/panelblog");
    } catch (err) {
      console.error(err);
      message.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {id ? "Editar" : "Nuevo"} post
      </h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ blocks: [] }}
      >
        <Form.Item name="title" label="Título" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="slug" label="Slug (opcional)">
          <Input />
        </Form.Item>

        <Form.Item name="excerpt" label="Resumen (Excerpt)">
          <Input.TextArea
            rows={3}
            placeholder="Resumen opcional para vista previa"
          />
        </Form.Item>

        <Form.Item name="coverImage" label="Imagen de portada (URL)">
          <Input />
        </Form.Item>

        <Form.Item name="bannerPhrase" label="Frase de banner">
          <Input />
        </Form.Item>

        {/* Selector de autor para todos los usuarios */}
        <Form.Item
          name="authorId"
          label="Seleccionar Autor"
          rules={[{ required: true }]}
        >
          <Select placeholder="Selecciona un autor">
            {users.map((u) => (
              <Select.Option key={u.id} value={u.id}>
                {u.name} (ID: {u.id})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Divider>Bloques de contenido</Divider>

        <Form.List name="blocks">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  style={{
                    border: "1px solid #eee",
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <Space
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Text strong>Bloque #{key + 1}</Text>
                    <Button
                      type="link"
                      icon={<MinusCircleOutlined />}
                      danger
                      onClick={() => remove(name)}
                    />
                  </Space>

                  <Form.Item
                    {...restField}
                    name={[name, "type"]}
                    label="Tipo"
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="Tipo de bloque">
                      <Select.Option value="heading">Encabezado</Select.Option>
                      <Select.Option value="paragraph">Párrafo</Select.Option>
                      <Select.Option value="image">Imagen</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "order"]}
                    label="Orden"
                    rules={[
                      { required: true, message: "Debes ingresar un número" },
                    ]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>

                  <Form.Item shouldUpdate>
                    {() => {
                      const type = form.getFieldValue(["blocks", name, "type"]);
                      if (type === "image") {
                        return (
                          <Form.Item
                            {...restField}
                            name={[name, "imageUrl"]}
                            label="URL de imagen"
                            rules={[{ required: true }]}
                          >
                            <Input />
                          </Form.Item>
                        );
                      } else {
                        return (
                          <Form.Item
                            {...restField}
                            name={[name, "text"]}
                            label={type === "heading" ? "Título" : "Texto"}
                            rules={[{ required: true }]}
                          >
                            <Input.TextArea rows={4} />
                          </Form.Item>
                        );
                      }
                    }}
                  </Form.Item>
                </div>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Agregar bloque
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Divider>Publicación</Divider>

        <Form.Item name="published" label="¿Publicado?" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item
          name="publishedAt"
          label="Fecha de publicación"
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!getFieldValue("published") || value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Selecciona una fecha si marcas como publicado")
                );
              },
            }),
          ]}
        >
          <DatePicker showTime allowClear style={{ width: "100%" }} />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          {id ? "Actualizar" : "Crear"}
        </Button>
      </Form>
    </div>
  );
}
