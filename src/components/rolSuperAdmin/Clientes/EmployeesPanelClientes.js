// file: src/components/rolSuperAdmin/EmployeesPanel.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, message, Spin, Select } from "antd";
import { useAuth } from "../../AuthContext";

function EmployeesPanel({ companyId }) {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { auth } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Para el listado de positions
  const [positions, setPositions] = useState([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form] = Form.useForm();

  // Cargar employees cuando cambie companyId
  useEffect(() => {
    if (companyId) {
      fetchEmployees();
    }
  }, [companyId]);

  // Cargar el catálogo de positions 1 sola vez
  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(
        `${apiUrl}/companies/${companyId}/employees`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setEmployees(resp.data.data || []);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      // GET /api/positions => regresa una lista de { id, nombre, tipo, ...}
      const resp = await axios.get(`${apiUrl}/positions`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (resp.data.status === "success") {
        setPositions(resp.data.data); // array de positions
      }
    } catch (error) {
      console.error(error);
      message.error("Error al cargar puestos (positions)");
    }
  };

  const handleCreate = () => {
    setEditItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setEditItem(employee);
    // Si en tu backend tienes employee.positionId,
    // pero en la tabla sale "position" como string, lo ideal es:
    //   form.setFieldsValue({ positionId: employee.positionId })
    //   y no 'employee.position'
    form.setFieldsValue({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      positionId: employee.positionId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (employeeId) => {
    Modal.confirm({
      title: "¿Eliminar empleado?",
      content: "Esta acción no se puede revertir",
      okText: "Sí, eliminar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.delete(
            `${apiUrl}/companies/${companyId}/employees/${employeeId}`,
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            }
          );
          message.success("Empleado eliminado");
          fetchEmployees();
        } catch (error) {
          console.error(error);
          message.error("No se pudo eliminar al empleado");
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      // values = { name, email, phone, positionId }
      const values = await form.validateFields();
      // si editItem existe, es UPDATE, sino CREATE
      if (editItem) {
        // PUT /api/companies/:companyId/employees/:id
        await axios.put(
          `${apiUrl}/companies/${companyId}/employees/${editItem.id}`,
          values,
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        message.success("Empleado actualizado");
      } else {
        // POST /api/companies/:companyId/employees
        await axios.post(`${apiUrl}/companies/${companyId}/employees`, values, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        message.success("Empleado creado");
      }
      setIsModalOpen(false);
      setEditItem(null);
      fetchEmployees();
    } catch (error) {
      console.error(error);
      message.error("Error guardando empleado");
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  // Revisamos si en la DB ya traes .position?.nombre,
  // o en tu "employee.position" guardas un string.
  // Si no lo tienes, sólo mostrará "record.positionId".
  const columns = [
    { title: "Nombre", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Teléfono", dataIndex: "phone" },
    {
      title: "Puesto",
      render: (_, record) => {
        // Si tu backend no hace preload('position'),
        //  record.position será undefined
        //  en ese caso, quizás muestras record.positionId
        //  o un fallback:
        return record.position?.nombre || record.position || "Sin asignar";
      },
    },
    {
      title: "Acciones",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "4px" }}>
          <Button size="small" onClick={() => handleEdit(record)}>
            Editar
          </Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>Empleados de la Empresa</h2>
        <Button type="primary" onClick={handleCreate}>
          Nuevo Empleado
        </Button>
      </div>

      {loading ? (
        <Spin />
      ) : (
        <Table
          rowKey="id"
          dataSource={employees}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        title={editItem ? "Editar Empleado" : "Nuevo Empleado"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: "Ingresa el nombre" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Ingresa el email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="Teléfono">
            <Input />
          </Form.Item>

          {/* En vez de un <Input />, un <Select> con los positions que obtuviste de la API */}
          <Form.Item name="positionId" label="Puesto">
            <Select placeholder="Selecciona el puesto">
              {positions.map((pos) => (
                <Select.Option key={pos.id} value={pos.id}>
                  {pos.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default EmployeesPanel;
