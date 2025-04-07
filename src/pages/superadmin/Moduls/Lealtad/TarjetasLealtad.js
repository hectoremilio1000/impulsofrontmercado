// TarjetasLealtad.jsx (un ejemplo)
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, message } from "antd";
import { useAuth } from "../../../../components/AuthContext";

export default function TarjetasLealtad() {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/loyalty/cards`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setCards(res.data);
    } catch (err) {
      console.error(err);
      message.error("Error al cargar tarjetas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para incrementar visita
  const handleAddVisit = async (cardId) => {
    try {
      await axios.post(
        `${apiUrl}/loyalty/cards/${cardId}/visit`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      message.success("Visita incrementada");
      fetchCards(); // volver a cargar las tarjetas
    } catch (err) {
      console.error(err);
      message.error("Error al agregar visita");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Program ID",
      dataIndex: "program_id",
    },
    {
      title: "Code",
      dataIndex: "code",
    },
    {
      title: "Visitas",
      dataIndex: "visits_count",
    },
    {
      title: "Acciones",
      render: (record) => (
        <Button onClick={() => handleAddVisit(record.id)}>+ Visita</Button>
      ),
    },
  ];

  return (
    <div>
      <h2>Tarjetas de Lealtad (Superadmin - Demo)</h2>
      <Table
        columns={columns}
        dataSource={cards}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
}
