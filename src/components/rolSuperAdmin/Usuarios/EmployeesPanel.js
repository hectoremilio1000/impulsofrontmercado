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

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form] = Form.useForm();

  // Estado local para positions (catalogo desde DB)
  const [positions, setPositions] = useState([]);

  // Catálogo local de puestos

  useEffect(() => {
    if (companyId) {
      fetchEmployees();
    }
    fetchPositions();
  }, [companyId]);

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
      const resp = await axios.get(`${apiUrl}/positions`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setPositions(resp.data.data || []);
    } catch (error) {
      console.error(error);
      message.error("No se pudieron cargar las posiciones");
    }
  };

  const handleCreate = () => {
    setEditItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setEditItem(employee);
    // Ojo: el "value" esperado es positionId, pero en "employee.position" viene el objeto precargado
    // Si tu API precarga => employee.position.id, ajusta a { positionId: employee.position?.id }
    form.setFieldsValue({
      ...employee,
      positionId: employee.position ? employee.position.id : null,
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
      const values = await form.validateFields();
      if (editItem) {
        // Update
        await axios.put(
          `${apiUrl}/companies/${companyId}/employees/${editItem.id}`,
          values,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        message.success("Empleado actualizado");
      } else {
        // Create
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

  const columns = [
    { title: "Nombre", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Teléfono", dataIndex: "phone" },
    {
      title: "Puesto",
      dataIndex: "position", // La API de EmployeesController preload('position')
      render: (pos) => pos?.nombre || "-", // pos es un objeto con {id, nombre, ...}
    },
    {
      title: "Acciones",
      render: (_, record) => (
        <div className="flex gap-2">
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
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Empleados de la Empresa</h2>
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
      >
        <Form form={form} layout="vertical">
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
