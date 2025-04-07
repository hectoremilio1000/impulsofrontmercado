import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, message, Modal } from "antd";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const { Option } = Select;

export default function EditLealtadProgram() {
  const [form] = Form.useForm();
  const { id } = useParams(); // el :id en /panellealtad/edit-program/:id
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL; // "http://localhost:3333/api"

  const [loading, setLoading] = useState(false);

  // Para manejar el QR
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrData, setQrData] = useState(""); // aquí guardaremos el base64 del QR

  // Estado local para guardar datos del programa (incluido code, si existe)
  const [programData, setProgramData] = useState(null);

  useEffect(() => {
    const fetchProgram = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/loyalty/programs/${id}`);
        const program = res.data;
        setProgramData(program);

        // Prellenar el formulario
        form.setFieldsValue({
          name: program.name,
          type: program.type,
          required_visits: program.required_visits,
          required_products: program.required_products,
          reward_description: program.reward_description,
          is_active: program.is_active,
        });
      } catch (error) {
        console.error(error);
        message.error("Error al cargar el programa");
      } finally {
        setLoading(false);
      }
    };
    fetchProgram();
    // eslint-disable-next-line
  }, [id]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await axios.put(`${apiUrl}/loyalty/programs/${id}`, values);
      message.success("Programa actualizado");
      navigate("/panellealtad");
    } catch (error) {
      console.error(error);
      message.error("Error al actualizar el programa");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generar QR a partir de un "code"
   * - Si tu "programData" tuviera un campo "code", lo usas.
   * - O generas uno al vuelo, o usas program.id.
   */
  const handleGenerateQr = async () => {
    if (!programData) {
      return message.warning("No se ha cargado aún el programa");
    }

    try {
      // Supongamos que tienes un 'code' en programData o usas ID:
      const code = programData.code || `program-${programData.id}`;

      // Petición a tu endpoint: POST /loyalty/generate-qr
      const res = await axios.post(`${apiUrl}/loyalty/generate-qr`, { code });

      // res.data.qr es la imagen base64
      setQrData(res.data.qr || "");
      // Abres el modal para mostrar la imagen
      setQrModalVisible(true);
    } catch (err) {
      console.error(err);
      message.error("No se pudo generar el QR");
    }
  };

  // Cerrar modal del QR
  const closeQrModal = () => {
    setQrModalVisible(false);
    setQrData("");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Editar Programa de Lealtad (ID: {id})
      </h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ type: "visits", is_active: true }}
      >
        <Form.Item label="Nombre" name="name">
          <Input />
        </Form.Item>

        <Form.Item label="Tipo" name="type">
          <Select>
            <Option value="visits">Visitas</Option>
            <Option value="products">Productos</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Required Visits" name="required_visits">
          <Input type="number" />
        </Form.Item>

        <Form.Item label="Required Products" name="required_products">
          <Input type="number" />
        </Form.Item>

        <Form.Item label="Descripción del Premio" name="reward_description">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="Activo?" name="is_active" valuePropName="checked">
          <Input type="checkbox" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Guardar Cambios
          </Button>

          {/* Botón para generar QR */}
          <Button
            style={{ marginLeft: 8 }}
            onClick={handleGenerateQr}
            disabled={!programData}
          >
            Generar QR
          </Button>
        </Form.Item>
      </Form>

      {/* Modal para mostrar el QR base64 */}
      <Modal
        visible={qrModalVisible}
        onCancel={closeQrModal}
        footer={null}
        title="Código QR"
      >
        {qrData ? (
          <img
            src={qrData}
            alt="QR Code"
            style={{ maxWidth: "100%", display: "block", margin: "0 auto" }}
          />
        ) : (
          <p>No hay QR disponible.</p>
        )}
      </Modal>
    </div>
  );
}
