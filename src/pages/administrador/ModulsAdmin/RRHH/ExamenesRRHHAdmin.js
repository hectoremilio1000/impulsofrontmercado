import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";
import { Button, Spin, Typography, Card, Radio, Divider } from "antd";

const { Title, Text } = Typography;

function ExamenesRRHH() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const { candidateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Leer query params
  const searchParams = new URLSearchParams(location.search);
  const intentoId = searchParams.get("intentoId");
  const puesto = searchParams.get("puesto");

  const [loading, setLoading] = useState(true);
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  // IDs de exámenes psico => ajusta si cambian
  const psicoIds = [49, 50, 51, 52, 53, 54, 55];

  useEffect(() => {
    const fetchPreguntas = async () => {
      try {
        console.log("Voy a POST a /rrhh/preguntas/obtener con:", {
          candidatoId: candidateId,
          intentoId,
          puesto,
        });

        const res = await axios.post(
          `${apiUrl}/rrhh/preguntas/obtener`,
          {
            candidatoId: candidateId,
            intentoId,
            puesto,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Respuesta /rrhh/preguntas/obtener:", res.data);

        if (res.data.status === "success") {
          const dataPreguntas = res.data.preguntas || [];
          setPreguntas(dataPreguntas);
        } else {
          console.error(
            "Error al obtener preguntas (API status error):",
            res.data
          );
        }
      } catch (error) {
        console.error("Error fetchPreguntas (catch):", error);
      } finally {
        setLoading(false);
      }
    };

    if (candidateId && intentoId && puesto) {
      fetchPreguntas();
    } else {
      setLoading(false);
    }
  }, [candidateId, intentoId, puesto, apiUrl, token]);

  // Separar en Psicométrico vs Conocimiento
  const preguntasPsico = preguntas.filter((p) =>
    psicoIds.includes(Number(p.examenId))
  );
  const preguntasConocimiento = preguntas.filter(
    (p) => !psicoIds.includes(Number(p.examenId))
  );

  console.log("Todas las preguntas:", preguntas);
  preguntas.forEach((p, idx) => {
    console.log(idx, p);
  });
  console.log("Preguntas Psico:", preguntasPsico);
  console.log("Preguntas Conocimiento:", preguntasConocimiento);

  const handleSeleccion = (preguntaId, opcion) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcion }));
    console.log("Nueva respuesta:", { preguntaId, opcion });
  };

  const handleFinalizar = async () => {
    try {
      // 1) Guardar respuestas en masivo
      const payload = {
        candidatoId: candidateId,
        puesto,
        respuestas: Object.entries(respuestas).map(([pid, opcion]) => ({
          pregunta_id: pid,
          respuesta_seleccionada: opcion,
        })),
      };

      console.log("Envío a /rrhh/respuestas/guardar-masivo =>", payload);
      const resResp = await axios.post(
        `${apiUrl}/rrhh/respuestas/guardar-masivo`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (resResp.data.status === "success") {
        // El back me retorna el "intento" que se generó
        const newAttemptId = resResp.data.intento; // <-- OJO con esto

        // 2) Calcular resultados con el *mismo* attemptId
        const calcPayload = {
          candidatoId: candidateId,
          intentoId: newAttemptId, // <--- Aquí usamos newAttemptId
          puesto,
        };

        console.log("Envío a /rrhh/resultados/calcular =>", calcPayload);
        const resCalc = await axios.post(
          `${apiUrl}/rrhh/resultados/calcular`,
          calcPayload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (resCalc.data.status === "success") {
          alert("Examen finalizado y resultados calculados con éxito");
          navigate("/admin/examenesresultadosrrhh");
        } else {
          console.error("Error calculando resultados:", resCalc.data);
          alert("Error al calcular resultados");
        }
      } else {
        console.error("Error guardando respuestas:", resResp.data);
        alert("Error al guardar respuestas");
      }
    } catch (error) {
      console.error("Error en handleFinalizar:", error);
      alert("Error crítico al finalizar examen");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Spin tip="Cargando preguntas..." size="large" />
      </div>
    );
  }

  if (!candidateId || !intentoId || !puesto) {
    return <div>Faltan parámetros en la URL</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>
        Examen para Candidato ID {candidateId}, puesto {puesto}
      </Title>

      {/* Bloque Psicométricas */}
      <Divider>Preguntas Psicométricas</Divider>
      {preguntasPsico.length === 0 ? (
        <Text type="secondary">
          No hay preguntas psicométricas para este puesto.
        </Text>
      ) : (
        preguntasPsico.map((preg, index) => (
          <Card
            key={preg.id}
            style={{ marginBottom: 16 }}
            title={`${index + 1}. ${preg.texto}`}
          >
            <Radio.Group
              value={respuestas[preg.id] || ""}
              onChange={(e) => handleSeleccion(preg.id, e.target.value)}
            >
              {["a", "b", "c", "d", "e"].map((opcion) => {
                const texto = preg[opcion];
                if (!texto) return null;
                return (
                  <Radio
                    key={opcion}
                    value={opcion}
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    <strong>{opcion.toUpperCase()}:</strong> {texto}
                  </Radio>
                );
              })}
            </Radio.Group>
          </Card>
        ))
      )}

      {/* Bloque Conocimientos */}
      <Divider>Preguntas de Conocimiento</Divider>
      {preguntasConocimiento.length === 0 ? (
        <Text type="secondary">
          No hay preguntas de conocimiento para este puesto.
        </Text>
      ) : (
        preguntasConocimiento.map((preg, index) => (
          <Card
            key={preg.id}
            style={{ marginBottom: 16 }}
            title={`${index + 1}. ${preg.texto}`}
          >
            <Radio.Group
              value={respuestas[preg.id] || ""}
              onChange={(e) => handleSeleccion(preg.id, e.target.value)}
            >
              {["a", "b", "c", "d", "e"].map((opcion) => {
                const texto = preg[opcion];
                if (!texto) return null;
                return (
                  <Radio
                    key={opcion}
                    value={opcion}
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    <strong>{opcion.toUpperCase()}:</strong> {texto}
                  </Radio>
                );
              })}
            </Radio.Group>
          </Card>
        ))
      )}

      <div style={{ textAlign: "right", marginTop: 24 }}>
        <Button type="primary" size="large" onClick={handleFinalizar}>
          Finalizar Examen
        </Button>
      </div>
    </div>
  );
}

export default ExamenesRRHH;
