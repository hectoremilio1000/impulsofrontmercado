import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import axios from "axios";

export default function FormularioProspect({ prospect, onComplete }) {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [contexto, setContexto] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [respuestas, setRespuestas] = useState([]);

  // Al cambiar "contexto", cargamos las preguntas
  useEffect(() => {
    if (!contexto) return;

    async function fetchPreguntas() {
      setCargando(true);
      setError(null);

      try {
        const response = await axios.get(
          `${apiUrl}/questionsByContext/${contexto}`
        );
        if (response.data.status === "success") {
          setPreguntas(response.data.data);
        } else {
          throw new Error(response.data.error || "Error al cargar preguntas");
        }
      } catch (err) {
        console.error("Error al cargar preguntas:", err.message);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    fetchPreguntas();
  }, [contexto, apiUrl]);

  const preguntaInicial = {
    id: 1,
    texto: "¿Ya abriste tu negocio o estás en planeación?",
    opciones: [
      { id: "planeacion", texto: "Planeación" },
      { id: "operando", texto: "Operando" },
    ],
  };

  function handleSeleccionInicial(opcion) {
    setContexto(opcion);
  }

  /**
   * Checkbox: Permite hasta 2 selecciones si es la pregunta
   * "¿Quién será tu público objetivo principal? escoge 2"
   */
  function handleCheckboxChange(pregunta, opcion) {
    setRespuestas((prev) => {
      const existe = prev.find(
        (r) =>
          r.prospect_id === prospect.id &&
          r.pregunta_id === pregunta.id &&
          r.option_id === opcion.id
      );

      const mismasPregunta = prev.filter(
        (r) => r.prospect_id === prospect.id && r.pregunta_id === pregunta.id
      );

      if (existe) {
        // Quitar la selección
        return prev.filter(
          (r) =>
            !(
              r.prospect_id === prospect.id &&
              r.pregunta_id === pregunta.id &&
              r.option_id === opcion.id
            )
        );
      } else {
        // Agregar si hay < 2
        if (mismasPregunta.length < 2) {
          return [
            ...prev,
            {
              prospect_id: prospect.id,
              pregunta_id: pregunta.id,
              option_id: opcion.id,
            },
          ];
        } else {
          message.warning("Solo puedes elegir 2 opciones en esta pregunta.");
          return prev;
        }
      }
    });
  }

  /**
   * Radio: solo 1 opción
   */
  function handleRadioChange(pregunta, opcion) {
    setRespuestas((prev) => {
      // Quitar cualquier respuesta previa para esa pregunta
      const filtradas = prev.filter(
        (r) => !(r.prospect_id === prospect.id && r.pregunta_id === pregunta.id)
      );
      return [
        ...filtradas,
        {
          prospect_id: prospect.id,
          pregunta_id: pregunta.id,
          option_id: opcion.id,
        },
      ];
    });
  }

  /**
   * Enviar formulario
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoadingAI(true); // Mostramos overlay

    try {
      // 1) Guardar respuestas en /responsesByGroup
      const payloadResponses = respuestas.map(({ prospect_id, option_id }) => ({
        prospect_id,
        option_id,
      }));
      const resp = await axios.post(
        `${apiUrl}/responsesByGroup`,
        { responses: payloadResponses },
        { headers: { "Content-Type": "application/json" } }
      );
      if (resp.data.status !== "success") {
        throw new Error(resp.data.error || "Error al guardar respuestas.");
      }
      message.success("Respuestas guardadas exitosamente.");

      // 2) Construir arreglo "amigable" para /recommendations
      const newVersionRespuestas = payloadResponses.map(({ option_id }) => {
        const p = preguntas.find((x) =>
          x.options.some((o) => o.id === option_id)
        );
        const opt = p?.options.find((o) => o.id === option_id);

        return {
          pregunta: p?.statement || "Pregunta no encontrada",
          respuestas: opt?.text ? [opt.text] : ["Desconocida"],
        };
      });

      // 3) Decidir si es user o prospect y mandar a /recommendations
      let user_id = null;
      let prospect_id = null;
      let nombre = "Sin Nombre";

      // Si es un user => .name
      if (prospect.name) {
        user_id = prospect.id;
        nombre = prospect.name;
      } else if (prospect.firstName) {
        prospect_id = prospect.id;
        nombre = prospect.firstName;
      }

      const recommendationPayload = {
        respuestas: newVersionRespuestas,
        nombreUsuario: nombre,
        user_id,
        prospect_id,
      };

      const recResp = await axios.post(
        `${apiUrl}/recommendations`,
        recommendationPayload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (recResp.data.status === "success") {
        message.success("Recomendación generada con IA");
        navigate(`/superadmin/ayudaia/recomendacion/${recResp.data.data.id}`);
      } else {
        message.error("Ocurrió un error al generar la recomendación");
      }

      // onComplete si existe
      if (onComplete) onComplete(newVersionRespuestas);
    } catch (err) {
      console.error("Error generando recomendación:", err.message);
      alert("Hubo un problema al guardar respuestas/generar recomendación.");
    } finally {
      setLoadingAI(false); // Quitamos overlay
    }
  }

  // Render condicional

  // A) Si no hay prospect o su ID
  if (!prospect || !prospect.id) {
    return <p>No hay información del prospect</p>;
  }

  // B) Si no ha elegido planeación u operando
  if (!contexto) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-bold">{preguntaInicial.texto}</h2>
        {preguntaInicial.opciones.map((op) => (
          <button
            key={op.id}
            onClick={() => handleSeleccionInicial(op.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md m-2"
          >
            {op.texto}
          </button>
        ))}
      </div>
    );
  }

  // C) Cargando
  if (cargando) {
    return <p>Cargando preguntas...</p>;
  }

  // D) Error
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  // E) Formulario final
  return (
    <div className="relative min-h-[400px]">
      {/* Spinner overlay si loadingAI */}
      {loadingAI && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
          <Spin tip="Generando recomendación con IA..." size="large" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded p-6 shadow">
        {preguntas.map((pregunta) => {
          const esPublicoObjetivo =
            pregunta.statement ===
            "¿Quién será tu público objetivo principal? escoge 2";

          return (
            <div key={pregunta.id} className="space-y-2 mb-4">
              <p className="text-lg font-bold">{pregunta.statement}</p>
              {pregunta.options.map((opcion) => {
                const isSelected = respuestas.some(
                  (r) =>
                    r.prospect_id === prospect.id &&
                    r.pregunta_id === pregunta.id &&
                    r.option_id === opcion.id
                );

                if (esPublicoObjetivo) {
                  // Checkbox
                  return (
                    <label key={opcion.id} className="block text-sm">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(pregunta, opcion)}
                      />
                      {" " + opcion.text}
                    </label>
                  );
                } else {
                  // Radio
                  return (
                    <label key={opcion.id} className="block text-sm">
                      <input
                        type="radio"
                        name={`pregunta-${pregunta.id}`}
                        checked={isSelected}
                        onChange={() => handleRadioChange(pregunta, opcion)}
                        required
                      />
                      {" " + opcion.text}
                    </label>
                  );
                }
              })}
            </div>
          );
        })}

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white">
          Enviar Respuestas
        </button>
      </form>
    </div>
  );
}
