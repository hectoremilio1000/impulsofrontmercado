/* TarjetasList.jsx */
import React, { useEffect, useRef, useState } from "react";
import { Table, Button, message } from "antd";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import { CardToPrint } from "./CardToPrint";
import CrearTarjetaModal from "./CrearTarjetaModal"; // Modal que maneja user_id + customer_name

export default function TarjetasList({ programId }) {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cardToPrint, setCardToPrint] = useState(null);
  const contentRef = useRef(null);

  // Para react-to-print (usando contentRef)
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Tarjeta de Lealtad",
    onAfterPrint: () => setCardToPrint(null),
  });

  const onPrintCard = (record) => {
    setCardToPrint(record);
  };

  useEffect(() => {
    if (cardToPrint) {
      handlePrint();
    }
  }, [cardToPrint, handlePrint]);

  // === Cargar tarjetas ===
  const fetchCards = async () => {
    setLoading(true);
    try {
      let url = `${apiUrl}/loyalty/cards`;
      if (programId) {
        url += `?program_id=${programId}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setCards(res.data);
    } catch (err) {
      console.error("fetchCards =>", err);
      message.error("Error cargando las tarjetas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line
  }, [programId]);

  // === +1 visita ===
  const incrementVisit = async (cardId) => {
    try {
      // Llamamos al endpoint que incrementa la visita
      const { data } = await axios.post(
        `${apiUrl}/loyalty/cards/${cardId}/visit`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      // Si data.reward_description existe, significa que se canjeó el premio
      if (data.reward_description) {
        message.success(
          `Visita incrementada y dale al cliente el premio: "${data.reward_description}"`
        );
      } else {
        // Sino, usamos el data.message normal
        message.success(data.message || "Visita incrementada");
      }

      fetchCards(); // refresca la lista
    } catch (err) {
      console.error(err);
      message.error("Error al incrementar visita");
    }
  };

  // === Columnas de la tabla ===
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Programa",
      dataIndex: ["program", "name"],
      key: "programName",
      width: 130,
      render: (val, record) => record.program?.name || record.program_id,
    },
    {
      title: "Cliente",
      dataIndex: "customerName", // no se cambia
      key: "customer_name",
      width: 130,
    },
    {
      title: "Usuario",
      key: "usuario",
      width: 130,
      render: (_, record) =>
        record.user ? record.user.name : `User ID: ${record.user_id || "N/A"}`,
    },
    {
      title: "Código",
      dataIndex: "code",
      key: "code",
      width: 120,
    },
    {
      title: "Visitas",
      dataIndex: "visitsCount",
      key: "visits_count",
      width: 80,
    },
    {
      title: "QR",
      key: "qr",
      width: 100,
      render: (_, record) => (
        <QRCodeCanvas
          value={`${apiUrl}/loyalty/scan?code=${record.code}`}
          size={64}
        />
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      fixed: "right",
      width: 220,
      render: (_, record) => (
        <>
          <Button
            onClick={() => incrementVisit(record.id)}
            style={{ marginRight: 8 }}
          >
            +1 Visita
          </Button>
          <Button
            onClick={() => onPrintCard(record)}
            style={{ marginRight: 8 }}
          >
            Imprimir
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Lista de Tarjetas</h2>

      {programId && (
        <Button
          type="primary"
          onClick={() => setIsCreateModalOpen(true)}
          style={{ marginBottom: 16 }}
        >
          Crear Tarjeta
        </Button>
      )}

      <Table
        columns={columns}
        dataSource={cards}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
      />

      {/* Modal para crear Tarjeta (con user_id y customer_name) */}
      <CrearTarjetaModal
        programId={programId}
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchCards}
      />

      {/* Contenedor oculto para imprimir */}
      <div className="print-container" ref={contentRef}>
        {cardToPrint && <CardToPrint card={cardToPrint} />}
      </div>

      {/* Estilos para el contenedor de impresión */}
      <style>{`
        .print-container {
          display: none;
        }
        @media print {
          .print-container {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
