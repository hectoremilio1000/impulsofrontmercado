import { message } from "antd";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FormularioProspect({ prospect, onComplete }) {
  const apiUrl = process.env.REACT_APP_API_URL;
  const preguntaInicial = {
    id: 1,
    texto: "¿Ya abriste tu negocio o estás en planeación?",
    opciones: [
      { id: "planeacion", texto: "Planeación" },
      { id: "operando", texto: "Operando" },
    ],
  };

  const [contexto, setContexto] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [respuestas, setRespuestas] = useState([]); // Cambiado a array de objetos

  const handleSeleccionInicial = (opcion) => {
    setContexto(opcion);
  };

  useEffect(() => {
    if (!contexto) return;

    const fetchPreguntas = async () => {
      setCargando(true);
      setError(null);

      try {
        const response = await axios.get(
          `${apiUrl}/questionsByContext/${contexto}`
        );
        const data = response.data;
        if (data.status === "success") {
          setPreguntas(data.data);
        } else {
          throw new Error(data.error || "Error al cargar preguntas");
        }
      } catch (error) {
        console.error("Error al cargar preguntas:", error.message);
        setError(error.message);
      } finally {
        setCargando(false);
      }
    };

    fetchPreguntas();
  }, [contexto]);

  const logRespuesta = (pregunta, opcion) => {
    if (!prospect?.firstName) {
      console.error("El nombre del prospect no está disponible.");
      return;
    }
    console.log(`prospect: ${prospect.firstName} (${prospect.id})`);
    console.log(`Pregunta: ${pregunta.statement}`);
    console.log(`Opción seleccionada: ${opcion.text}`);
  };

  const handleCheckboxChange = (pregunta, opcion) => {
    setRespuestas((prev) => {
      const existing = prev.filter(
        (resp) =>
          resp.prospect_id === prospect.id && resp.option_id === opcion.id
      );

      if (existing.length > 0) {
        // Quitar la opción si ya está seleccionada
        logRespuesta(pregunta, opcion);
        return prev.filter(
          (resp) =>
            !(resp.prospect_id === prospect.id && resp.option_id === opcion.id)
        );
      } else {
        // Agregar la opción si no está seleccionada y permitir hasta 2 respuestas
        const respuestasPregunta = prev.filter(
          (resp) =>
            resp.prospect_id === prospect.id && resp.pregunta_id === pregunta.id
        );

        if (respuestasPregunta.length < 2) {
          logRespuesta(pregunta, opcion);
          return [
            ...prev,
            {
              prospect_id: prospect.id,
              pregunta_id: pregunta.id,
              option_id: opcion.id,
            },
          ];
        }

        return prev; // No permitir más de 2 selecciones
      }
    });
  };

  const handleRadioChange = (pregunta, opcion) => {
    setRespuestas((prev) => {
      logRespuesta(pregunta, opcion);
      // Reemplazar cualquier respuesta existente para esta pregunta
      return [
        ...prev.filter((resp) => resp.pregunta_id !== pregunta.id),
        {
          prospect_id: prospect.id,
          pregunta_id: pregunta.id,
          option_id: opcion.id,
        },
      ];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newRespuestas = respuestas.map(({ prospect_id, option_id }) => ({
      prospect_id,
      option_id,
    }));

    const payload = {
      responses: newRespuestas,
    };
    try {
      const response = await axios.post(`${apiUrl}/responsesByGroup`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log(response);

      if (response.data.status !== "success") {
        throw new Error(response.data.error || "Error al guardar respuestas.");
      }

      message.success("Respuestas guardadas exitosamente.");
      const newVersionRespuestas = newRespuestas.map(({ option_id }) => {
        // Buscar la pregunta que contiene la opción
        const pregunta = preguntas.find((pregunta) =>
          pregunta.options.some((option) => option.id === option_id)
        );

        // Extraer la opción específica
        const respuesta = pregunta?.options.find(
          (option) => option.id === option_id
        );

        // Retornar el nuevo formato
        return {
          pregunta: pregunta?.statement || "Pregunta no encontrada",
          respuesta: respuesta?.text || "Respuesta no encontrada",
        };
      });

      console.log(newVersionRespuestas);
      onComplete(newVersionRespuestas);
    } catch (error) {
      console.error("Error al guardar respuestas:", error.message);
      alert("Hubo un problema al guardar las respuestas.");
    }
  };

  if (!contexto) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-bold">{preguntaInicial.texto}</h2>
        {preguntaInicial.opciones.map((opcion) => (
          <button
            key={opcion.id}
            onClick={() => handleSeleccionInicial(opcion.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            {opcion.texto}
          </button>
        ))}
      </div>
    );
  }

  if (cargando) return <p>Cargando preguntas...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded p-6 shadow">
      {preguntas.map((pregunta) => (
        <div key={pregunta.id} className="space-y-2">
          <p className="text-lg font-bold">{pregunta.statement}</p>
          {pregunta.statement ===
          "¿Quién será tu público objetivo principal? escoge 2"
            ? // Checkbox para esta pregunta específica
              pregunta.options.map((opcion) => (
                <label key={opcion.id} className="block text-sm">
                  <input
                    type="checkbox"
                    value={opcion.id}
                    onChange={() => handleCheckboxChange(pregunta, opcion)}
                    checked={respuestas.some(
                      (resp) =>
                        resp.pregunta_id === pregunta.id &&
                        resp.option_id === opcion.id
                    )}
                  />
                  {opcion.text}
                </label>
              ))
            : // Radio para las demás preguntas
              pregunta.options.map((opcion) => (
                <label key={opcion.id} className="block text-sm">
                  <input
                    type="radio"
                    value={opcion.id}
                    onChange={() => handleRadioChange(pregunta, opcion)}
                    checked={respuestas.some(
                      (resp) =>
                        resp.pregunta_id === pregunta.id &&
                        resp.option_id === opcion.id
                    )}
                    required
                  />
                  {opcion.text}
                </label>
              ))}
        </div>
      ))}
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white">
        Enviar Respuestas
      </button>
    </form>
  );
}
