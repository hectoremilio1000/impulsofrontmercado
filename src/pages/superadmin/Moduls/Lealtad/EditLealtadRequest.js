import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../components/AuthContext";
import axios from "axios";
import { message, Form, Input, Select, Button } from "antd";

const { Option } = Select;

export default function EditLealtadRequest() {
  const { id } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchRequestDetail();
    // eslint-disable-next-line
  }, []);

  const fetchRequestDetail = async () => {
    console.log("=== fetchRequestDetail() called. ID:", id);
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/loyalty/requests/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      console.log("fetchRequestDetail => response.data:", res.data);

      const data = res.data;
      form.setFieldsValue({
        programType: data.programType,
        requiredVisits: data.requiredVisits ?? 0,
        requiredProducts: data.requiredProducts ?? 0,
        rewardDescription: data.rewardDescription ?? "",
        notes: data.notes ?? "",
        status: data.status ?? "pending",
      });
    } catch (err) {
      console.error("fetchRequestDetail => ERROR", err);
      message.error("Error cargando detalle de la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    console.log("=== onFinish(Editar Solicitud) ===");
    console.log("onFinish => form values:", values);

    try {
      setLoading(true);

      // Convertir a snake_case
      const payload = {
        program_type: values.programType,
        required_visits: values.requiredVisits,
        required_products: values.requiredProducts,
        reward_description: values.rewardDescription,
        notes: values.notes,
        status: values.status,
      };
      console.log("PUT => /loyalty/requests/:id => payload:", payload);

      // 1) Actualizar la solicitud
      await axios.put(`${apiUrl}/loyalty/requests/${id}`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      // 2) Si status es "approved" => /approve
      if (values.status === "approved") {
        console.log("onFinish => status=approved => POST /approve");
        const approveResp = await axios.post(
          `${apiUrl}/loyalty/requests/${id}/approve`,
          {},
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        console.log("onFinish => /approve response:", approveResp.data);
        message.success("Solicitud aprobada");
      }
      // 3) Si status es "rejected" => /reject
      else if (values.status === "rejected") {
        console.log("onFinish => status=rejected => POST /reject");
        const rejectResp = await axios.post(
          `${apiUrl}/loyalty/requests/${id}/reject`,
          {},
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        console.log("onFinish => /reject response:", rejectResp.data);
        message.success("Solicitud rechazada");
      }

      navigate("/panellealtad");
    } catch (err) {
      console.error("onFinish => ERROR:", err);
      message.error("Error al actualizar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2>Editar Solicitud de Lealtad (ID: {id})</h2>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Tipo de Programa" name="programType">
          <Select placeholder="Selecciona un tipo">
            <Option value="visits">Visitas</Option>
            <Option value="products">Productos</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Required Visits" name="requiredVisits">
          <Input type="number" min={0} />
        </Form.Item>

        <Form.Item label="Required Products" name="requiredProducts">
          <Input type="number" min={0} />
        </Form.Item>

        <Form.Item label="Descripción del Premio" name="rewardDescription">
          <Input />
        </Form.Item>

        <Form.Item label="Notas" name="notes">
          <Input />
        </Form.Item>

        <Form.Item label="Estatus" name="status">
          <Select>
            <Option value="pending">Pendiente</Option>
            <Option value="approved">Aprobado</Option>
            <Option value="rejected">Rechazado</Option>
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          Guardar
        </Button>
      </Form>
    </div>
  );
}
