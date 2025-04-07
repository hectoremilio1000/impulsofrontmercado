// src/pages/superadmin/Moduls/Lealtad/SolicitarPrograma.jsx
import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message } from "antd";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

const { Option } = Select;

export default function SolicitarPrograma() {
  const { auth } = useAuth(); // Igual que en Usuarios.jsx
  const apiUrl = process.env.REACT_APP_API_URL;
  const [form] = Form.useForm();
  console.log("auth.token =", auth.token);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Cargar usuarios (similar a fetchUsuarios en Usuarios.jsx)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${apiUrl}/users`, {
        headers: {
          Authorization: `Bearer ${auth.token}`, // Usamos el token
        },
      });
      // Como en tu ejemplo de Usuarios.jsx, la respuesta es { data: [...] }
      const allUsers = resp.data.data || [];

      // Filtramos roles 2 o 3, igual que en tu Usuarios.jsx
      const filtrados = allUsers.filter((u) => {
        const roleId = u.rol?.id;
        return roleId === 2 || roleId === 3; // Ajusta según tu necesidad
      });

      setUsers(filtrados);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // 2. onFinish => POST /loyalty/requests
  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Creamos el payload
      const payload = {
        program_type: values.program_type,
        required_visits:
          values.program_type === "visits" ? values.required_units : null,
        required_products:
          values.program_type === "products" ? values.required_units : null,
        reward_description: values.reward_description,
        notes: values.notes,
        user_id: values.user_id, // Si tu backend lo acepta
      };

      // Hacemos la petición con Bearer token, igual que en Usuarios.jsx
      await axios.post(`${apiUrl}/loyalty/requests`, payload, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      message.success("Solicitud creada correctamente");
      form.resetFields();
    } catch (err) {
      console.error("Error al crear la solicitud:", err);
      message.error("Error al crear la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Solicitar Programa (Super Admin)
      </h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ program_type: "visits" }}
      >
        <Form.Item
          label="Seleccionar Usuario"
          name="user_id"
          rules={[{ required: true, message: "Selecciona un usuario" }]}
        >
          <Select placeholder="Elige un usuario" loading={loading} allowClear>
            {users.map((u) => (
              <Option key={u.id} value={u.id}>
                {u.name} (ID: {u.id})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Tipo de Programa"
          name="program_type"
          rules={[
            { required: true, message: "Selecciona un tipo de programa" },
          ]}
        >
          <Select>
            <Option value="visits">Visitas</Option>
            <Option value="products">Productos</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Requerido (número de visitas o productos)"
          name="required_units"
          rules={[
            {
              required: true,
              message: "Especifica cuántas unidades se requieren",
            },
          ]}
        >
          <Input type="number" min={1} />
        </Form.Item>

        <Form.Item label="Descripción del premio" name="reward_description">
          <Input.TextArea rows={3} placeholder="Ej. Un carajillo gratis" />
        </Form.Item>

        <Form.Item label="Notas" name="notes">
          <Input.TextArea rows={3} placeholder="Notas adicionales" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Crear Solicitud
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
