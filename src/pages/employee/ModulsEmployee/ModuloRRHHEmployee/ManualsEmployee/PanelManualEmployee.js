import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, message } from "antd";
import { useAuth } from "../../../../../components/AuthContext";

function PanelManualEmployee() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  // Estado para la lista de manuales
  const [manuals, setManuals] = useState([]);
  // Estado para mostrar loading en la tabla
  const [loading, setLoading] = useState(false);

  // Estado para el modal de ver manual
  const [manualSelected, setManualSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Al montar el componente, obtenemos los manuales del empleado actual
  useEffect(() => {
    fetchEmployeeAndManuals();
    // eslint-disable-next-line
  }, []);

  /**
   * 1) Pide los datos del empleado asociado al usuario actual: /api/me/employee
   * 2) Toma companyId y positionId
   * 3) Llama a /api/training-manuals?companyId=...&positionId=...
   */
  const fetchEmployeeAndManuals = async () => {
    setLoading(true);

    try {
      // 1) Obtener employee del usuario autenticado
      const respMe = await axios.get(`${apiUrl}/me/employee`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (respMe.data?.status === "success") {
        const employee = respMe.data.data;
        const companyId = employee.companyId;
        const positionId = employee.positionId;

        // 2) Obtener manuales filtrados
        const respManuals = await axios.get(`${apiUrl}/training-manuals`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            companyId,
            positionId,
          },
        });

        if (respManuals.data?.status === "success") {
          setManuals(respManuals.data.data);
        } else {
          setManuals([]);
        }
      } else {
        message.warning("No se pudo obtener los datos del empleado.");
      }
    } catch (error) {
      console.error(error);
      message.error("Error al obtener manuales del empleado.");
    } finally {
      setLoading(false);
    }
  };

  // Columnas para la tabla
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (text, record) => (
        <Button
          size="small"
          onClick={() => {
            setManualSelected(record);
            setModalVisible(true);
          }}
        >
          Ver
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h3>Mis Manuales</h3>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={manuals}
        loading={loading}
      />

      {/* Modal para Ver Manual */}
      <Modal
        title={manualSelected?.title}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {manualSelected && (
          <div>
            <p>
              <strong>ID:</strong> {manualSelected.id}
            </p>
            <p>
              <strong>Contenido:</strong> {manualSelected.content}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PanelManualEmployee;
