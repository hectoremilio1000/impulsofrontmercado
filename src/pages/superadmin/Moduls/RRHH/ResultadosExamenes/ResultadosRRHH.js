import React, { useEffect, useState } from "react";
import { Table, Button, Spin, Modal, Card, Typography, Divider } from "antd";
import axios from "axios";

// ChartJS (opcional, si usas gráficas)
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Radar, Bar } from "react-chartjs-2";
import { useAuth } from "../../../../../components/AuthContext";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const { Title, Text } = Typography;

function ResultadosRRHH() {
  const { auth } = useAuth();
  const token = auth?.token;

  // Ajusta según tu .env o configuración:
  // Por ejemplo: REACT_APP_API_URL=http://localhost:3333/api
  // De modo que apiUrl = "http://localhost:3333/api"
  const apiUrl = process.env.REACT_APP_API_URL;

  // 1) Lista de resultados
  const [loading, setLoading] = useState(true);
  const [resultados, setResultados] = useState([]);

  // 2) Modal para gráficas
  const [modalVisible, setModalVisible] = useState(false);
  const [graphType, setGraphType] = useState("radar"); // 'radar' o 'bar'
  const [selected, setSelected] = useState(null);

  // 3) Modal para ver RESPUESTAS
  const [answersModalVisible, setAnswersModalVisible] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  useEffect(() => {
    fetchResultados();
  }, []);

  // Cargar la lista de resultados
  const fetchResultados = async () => {
    try {
      setLoading(true);
      // Supongamos que tu Adonis define /api/rrhh/resultados
      // Ajusta si tu route real es /api/resultados
      const res = await axios.get(`${apiUrl}/rrhh/resultados`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setResultados(res.data.data);
      } else {
        console.error("Error al cargar resultados:", res.data);
      }
    } catch (error) {
      console.error("Error fetchResultados:", error);
    } finally {
      setLoading(false);
    }
  };

  // (Opcional) Traer "candidato ideal" por puesto
  const fetchIdeal = async (puesto) => {
    try {
      // Ajusta si tu endpoint real es /api/candidatoIdeal/obtener
      const resp = await axios.get(`${apiUrl}/candidatoIdeal/obtener`, {
        params: { puesto },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.status === "success") {
        return resp.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetchIdeal:", error);
      return null;
    }
  };

  // Botón para ver Gráfica (Radar o Barras)
  const handleViewGraph = async (record, type) => {
    setGraphType(type);
    const ideal = await fetchIdeal(record.puesto);
    if (!ideal) {
      alert(`No se encontró candidato ideal para ${record.puesto}`);
      return;
    }
    setSelected({ actual: record, ideal });
    setModalVisible(true);
  };

  // Botón para ver RESPUESTAS
  const handleViewAnswers = async (record) => {
    try {
      // OJO: si tu route es /api/respuestas => lo llamas:
      // e.g. http://localhost:3333/api/respuestas?candidatoId=...
      const resp = await axios.get(`${apiUrl}/respuestas`, {
        params: {
          candidatoId: record.candidatoId,
          intentoId: record.intentoId,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.status === "success") {
        setSelectedAnswers(resp.data.data);
        setAnswersModalVisible(true);
      } else {
        console.error("Error al cargar respuestas:", resp.data);
      }
    } catch (error) {
      console.error("Error handleViewAnswers:", error);
    }
  };

  // Columnas para la tabla
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Candidato ID",
      dataIndex: "candidatoId",
    },
    {
      title: "Puesto",
      dataIndex: "puesto",
    },
    {
      title: "Fecha examen",
      dataIndex: "createdAt", // ← vendrá del backend
      width: 160,
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString("es-MX", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
    },
    {
      title: "Bondad",
      dataIndex: "puntajeBondad",
    },
    {
      title: "Optimismo",
      dataIndex: "puntajeOptimismo",
    },
    {
      title: "Acciones",
      render: (record) => (
        <>
          <Button onClick={() => handleViewGraph(record, "radar")}>
            Radial
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => handleViewGraph(record, "bar")}
          >
            Barras
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => handleViewAnswers(record)}
          >
            Ver Respuestas
          </Button>
        </>
      ),
    },
  ];

  // Data para la gráfica Radar
  const labels = [
    "Bondad",
    "Optimismo",
    "Ética",
    "Curiosidad",
    "Integridad",
    "Autoconciencia",
    "Empatía",
    "Conocimientos",
  ];

  const radarData = {
    labels,
    datasets: [
      {
        label: "Candidato Actual",
        data: selected
          ? [
              selected.actual.puntajeBondad,
              selected.actual.puntajeOptimismo,
              selected.actual.puntajeEtica,
              selected.actual.puntajeCuriosidad,
              selected.actual.puntajeIntegridad,
              selected.actual.puntajeAutoconciencia,
              selected.actual.puntajeEmpatia,
              selected.actual.puntajeConocimientos,
            ]
          : [],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
      {
        label: "Candidato Ideal",
        data: selected
          ? [
              selected.ideal.puntajeBondad,
              selected.ideal.puntajeOptimismo,
              selected.ideal.puntajeEtica,
              selected.ideal.puntajeCuriosidad,
              selected.ideal.puntajeIntegridad,
              selected.ideal.puntajeAutoconciencia,
              selected.ideal.puntajeEmpatia,
              selected.ideal.puntajeConocimientos,
            ]
          : [],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  // Data para la gráfica de Barras
  const barData = {
    labels,
    datasets: [
      {
        label: "Candidato Actual",
        data: selected
          ? [
              selected.actual.puntajeBondad,
              selected.actual.puntajeOptimismo,
              selected.actual.puntajeEtica,
              selected.actual.puntajeCuriosidad,
              selected.actual.puntajeIntegridad,
              selected.actual.puntajeAutoconciencia,
              selected.actual.puntajeEmpatia,
              selected.actual.puntajeConocimientos,
            ]
          : [],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
      {
        label: "Candidato Ideal",
        data: selected
          ? [
              selected.ideal.puntajeBondad,
              selected.ideal.puntajeOptimismo,
              selected.ideal.puntajeEtica,
              selected.ideal.puntajeCuriosidad,
              selected.ideal.puntajeIntegridad,
              selected.ideal.puntajeAutoconciencia,
              selected.ideal.puntajeEmpatia,
              selected.ideal.puntajeConocimientos,
            ]
          : [],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  // Helper: mostrar una opción con su peso
  const renderOpcion = (opLetra, texto, pesoOpcion, ans) => {
    const isSelected = ans.respuestaSeleccionada === opLetra;
    return (
      <p
        style={{
          color: isSelected ? "green" : "inherit",
          fontWeight: isSelected ? "bold" : "normal",
        }}
      >
        {/* Ejemplo: "Opción A (peso: 0.10): Ignorarlo" */}
        Opción {opLetra.toUpperCase()}{" "}
        {pesoOpcion != null && ` (peso: ${pesoOpcion})`}: {texto}
      </p>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Panel RRHH - Resultados</h2>

      {loading ? (
        <Spin tip="Cargando resultados..." />
      ) : (
        <Table
          dataSource={resultados}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 6 }}
        />
      )}

      {/* Modal GRÁFICA */}
      <Modal
        visible={modalVisible}
        footer={null}
        width={800}
        onCancel={() => setModalVisible(false)}
      >
        {graphType === "radar" ? (
          <Radar data={radarData} options={radarOptions} />
        ) : (
          <Bar data={barData} options={{ responsive: true }} />
        )}
      </Modal>

      {/* Modal VER RESPUESTAS */}
      <Modal
        visible={answersModalVisible}
        footer={null}
        width={800}
        onCancel={() => setAnswersModalVisible(false)}
      >
        <Title level={4}>Detalle de Respuestas</Title>

        {selectedAnswers.map((ans, idx) => {
          // ans.pregunta con peso_pregunta, a, peso_a, ...
          const preg = ans.pregunta || {};
          return (
            <Card
              key={ans.id}
              style={{ marginBottom: 16 }}
              title={`#${idx + 1} - ${preg.texto || "Pregunta"}`}
            >
              <p>
                <strong>Peso de la pregunta:</strong> {preg.pesoPregunta ?? 0}
              </p>
              <Divider />

              {renderOpcion("a", preg.a, preg.pesoA, ans)}
              {renderOpcion("b", preg.b, preg.pesoB, ans)}
              {renderOpcion("c", preg.c, preg.pesoC, ans)}
              {renderOpcion("d", preg.d, preg.pesoD, ans)}
              {renderOpcion("e", preg.e, preg.pesoE, ans)}

              <Divider />
              <p>
                <strong>Respuesta Seleccionada:</strong>{" "}
                <Text code>
                  {ans.respuestaSeleccionada?.toUpperCase() || "N/A"}
                </Text>
                {" — "}
                <strong>Peso respuesta:</strong> {ans.pesoRespuesta || 0}
              </p>
              <p>
                <strong>¿Correcta?</strong> {ans.esCorrecta === 1 ? "Sí" : "No"}
              </p>
            </Card>
          );
        })}
      </Modal>
    </div>
  );
}

export default ResultadosRRHH;
