// src/pages/superadmin/Moduls/Encuestas/EncuestasList.jsx
import React, { useEffect, useRef, useState } from "react";
import { Table, Button, message } from "antd";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import EncuestaToPrint from "./EncuestaToPrint"; // componente que contiene la info a imprimir (similar a CardToPrint)

export default function EncuestasList() {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [encuestaToPrint, setEncuestaToPrint] = useState(null);
  const contentRef = useRef(null);

  // Manejo de impresión (similar a TarjetasList)
  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: "Encuesta",
    onAfterPrint: () => setEncuestaToPrint(null),
  });

  useEffect(() => {
    if (encuestaToPrint) {
      // Cuando encuestaToPrint cambia, lanzamos impresión
      handlePrint();
    }
  }, [encuestaToPrint, handlePrint]);

  // === Cargar encuestas (tabla surveys) ===
  const fetchEncuestas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/surveys`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setEncuestas(res.data); // Devuelve array de encuestas
    } catch (err) {
      console.error("fetchEncuestas =>", err);
      message.error("Error cargando las encuestas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncuestas();
    // eslint-disable-next-line
  }, []);

  // Lógica para imprimir la encuesta
  const onPrintEncuesta = (record) => {
    setEncuestaToPrint(record);
  };

  // Columnas de la tabla
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
      width: 130,
    },
    {
      title: "Código",
      dataIndex: "code",
      key: "code",
      width: 120,
    },
    {
      title: "QR",
      key: "qr",
      width: 100,
      render: (_, record) => (
        <QRCodeCanvas
          value={`${apiUrl}/api/surveys/fill?code=${record.code}`}
          size={64}
        />
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <>
          <Button
            onClick={() => onPrintEncuesta(record)}
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
      <h2 style={{ marginBottom: 16 }}>Encuestas (QR e Imprimir)</h2>

      <Table
        columns={columns}
        dataSource={encuestas}
        rowKey="id"
        loading={loading}
        scroll={{ x: 800 }}
      />

      {/* Contenedor oculto para imprimir */}
      <div style={{ display: "none" }}>
        <div ref={contentRef}>
          {encuestaToPrint && (
            <EncuestaToPrint encuesta={encuestaToPrint} apiUrl={apiUrl} />
          )}
        </div>
      </div>
    </div>
  );
}
