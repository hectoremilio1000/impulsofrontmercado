import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message } from "antd";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

const { Option } = Select;

export default function SolicitarLealtadAdmin() {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Lista de empresas
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // user actual
  const currentUser = auth?.user || {};

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line
  }, []);

  const fetchCompanies = async () => {
    try {
      const resp = await axios.get(`${apiUrl}/companies`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      // Aquí asume que el endpoint /companies devuelve algo como { status: 'success', data: [...] }
      if (resp.data?.data) {
        setCompanies(resp.data.data);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error("Error al cargar empresas:", error);
      message.error("No se pudieron cargar las empresas");
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (!selectedCompany) {
        message.warning("Por favor, selecciona una empresa");
        return;
      }

      // Preparamos el payload
      const payload = {
        user_id: currentUser.id,
        company_id: selectedCompany, // <-- La empresa escogida
        program_type: values.program_type,
        required_visits:
          values.program_type === "visits" ? values.required_units : null,
        required_products:
          values.program_type === "products" ? values.required_units : null,
        reward_description: values.reward_description,
        notes: values.notes,
      };

      await axios.post(`${apiUrl}/loyalty/requests`, payload, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      message.success("Solicitud de lealtad enviada con éxito");
      form.resetFields();
      setSelectedCompany(null); // Limpiamos la empresa, si quieres
    } catch (error) {
      console.error("Error al crear la solicitud:", error);
      message.error("Error al crear la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Solicitar Programa de Lealtad (Admin)
      </h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ program_type: "visits" }}
      >
        {/* SELECT para la empresa */}
        <Form.Item label="Empresa">
          <Select
            placeholder="Selecciona la empresa"
            value={selectedCompany ?? ""}
            onChange={(val) => setSelectedCompany(val)}
            style={{ width: "100%" }}
          >
            {companies.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name} (ID: {c.id})
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
              message: "Indica cuántas unidades se requieren",
            },
          ]}
        >
          <Input type="number" min={1} />
        </Form.Item>

        <Form.Item label="Descripción del premio" name="reward_description">
          <Input.TextArea
            rows={3}
            placeholder="Ej. 1 cerveza gratis al llegar a 10 visitas"
          />
        </Form.Item>

        <Form.Item label="Notas" name="notes">
          <Input.TextArea rows={3} placeholder="Información adicional" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Enviar Solicitud
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
