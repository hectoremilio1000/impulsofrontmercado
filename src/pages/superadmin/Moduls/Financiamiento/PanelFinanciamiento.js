import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Table, message, Button, Modal, Input } from "antd";

function PanelFinanciamiento() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal para aprobar
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [interestRate, setInterestRate] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");

  // Cargar solicitudes
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/financing-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setRequests(res.data.data);
      } else {
        message.error("Error al cargar solicitudes");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  // Aprobar
  const handleOpenApproveModal = (record) => {
    setRequestToApprove(record);
    setInterestRate("");
    setApprovedAmount("");
    setApproveModalOpen(true);
  };

  const handleApprove = async () => {
    if (!interestRate || !approvedAmount) {
      message.error("Completa la tasa de interés y el monto aprobado");
      return;
    }
    try {
      const res = await axios.post(
        `${apiUrl}/financing-requests/${requestToApprove.id}/approve`,
        {
          interest_rate: interestRate,
          approved_amount: approvedAmount,
          // podrías agregar start_date, end_date, monthly_payment, etc.
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.status === "success") {
        message.success("Solicitud aprobada");
        setApproveModalOpen(false);
        fetchRequests();
      } else {
        message.error("No se pudo aprobar la solicitud");
      }
    } catch (error) {
      console.error("Error al aprobar:", error);
      message.error("Error al aprobar la solicitud");
    }
  };

  // Rechazar
  const handleReject = async (id) => {
    try {
      const res = await axios.post(
        `${apiUrl}/financing-requests/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.status === "success") {
        message.success("Solicitud rechazada");
        fetchRequests();
      } else {
        message.error("No se pudo rechazar la solicitud");
      }
    } catch (error) {
      console.error("Error al rechazar:", error);
      message.error("Error al rechazar la solicitud");
    }
  };

  // Columnas
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Usuario",
      key: "user",
      render: (text, record) => record.user?.name || record.user?.email,
    },
    { title: "Monto Solicitado", dataIndex: "amount", key: "amount" },
    { title: "Razón", dataIndex: "reason", key: "reason" },
    { title: "Estado", dataIndex: "status", key: "status" },
    {
      title: "Acciones",
      key: "actions",
      render: (text, record) => (
        <div>
          {record.status === "pending" && (
            <>
              <Button
                onClick={() => handleOpenApproveModal(record)}
                style={{ marginRight: 8 }}
              >
                Aprobar
              </Button>
              <Button danger onClick={() => handleReject(record.id)}>
                Rechazar
              </Button>
            </>
          )}
          {record.status === "approved" && <span>Aprobada</span>}
          {record.status === "rejected" && <span>Rechazada</span>}
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Panel de Financiamiento (Superadmin)
      </h2>

      <Table
        dataSource={requests}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      {/* Modal de Aprobación */}
      <Modal
        visible={approveModalOpen}
        title="Aprobar Solicitud"
        onCancel={() => setApproveModalOpen(false)}
        onOk={handleApprove}
        okText="Aprobar"
      >
        <div style={{ marginBottom: 16 }}>
          <strong>Solicitud ID: </strong>
          {requestToApprove?.id}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Tasa de Interés (%): </label>
          <Input
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            type="number"
          />
        </div>
        <div>
          <label>Monto Aprobado: </label>
          <Input
            value={approvedAmount}
            onChange={(e) => setApprovedAmount(e.target.value)}
            type="number"
          />
        </div>
      </Modal>
    </div>
  );
}

export default PanelFinanciamiento;
