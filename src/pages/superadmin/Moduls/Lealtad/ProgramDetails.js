import React, { useState, useEffect } from "react";
import { Table, Button, message, Popconfirm } from "antd";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../../components/AuthContext";
import { QRCodeCanvas } from "qrcode.react";

export default function ProgramDetails() {
  const { programId } = useParams();
  const { auth } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchCards = async () => {
    try {
      setLoading(true);
      // GET /loyalty/programs/:programId/cards
      const res = await axios.get(
        `${apiUrl}/loyalty/programs/${programId}/cards`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setCards(res.data);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar tarjetas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line
  }, [programId]);

  const incrementVisit = async (cardId) => {
    try {
      await axios.post(
        `${apiUrl}/loyalty/cards/${cardId}/visit`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      message.success("Visita incrementada");
      fetchCards(); // refresca la lista
    } catch (err) {
      console.error(err);
      message.error("Error al incrementar visita");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Code", dataIndex: "code", key: "code" },
    {
      title: "Visitas",
      dataIndex: "visits_count",
      key: "visits_count",
      width: 80,
    },
    {
      title: "QR",
      key: "qr",
      render: (_, record) => (
        <QRCodeCanvas
          value={`https://TU_DOMINIO/scan?code=${record.code}`}
          size={64}
        />
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Button onClick={() => incrementVisit(record.id)}>+1 Visita</Button>
      ),
    },
  ];

  return (
    <div>
      <h2>Tarjetas del Programa #{programId}</h2>
      {/* Un botón "Crear Tarjeta" para este programa */}
      {/* <CrearTarjetaModal ... programId={programId} ... /> */}

      <Table
        columns={columns}
        dataSource={cards}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
}
