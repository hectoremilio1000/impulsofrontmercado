import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Recomendaciones() {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombreUsuario, setNombreUsuario] = useState("");

  const { id } = useParams();

  const apiUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    if (!id) return;

    const fetchRecomendaciones = async () => {
      try {
        const response = await axios.get(`${apiUrl}/recommendations/${id}`); // Llama a la API `getrecomendaciones.js`
        if (response.data.status !== "success")
          throw new Error("Error al cargar recomendaciones");
        const data = response.data;
        console.log(data);

        setNombreUsuario(data.data.prospect.firstName);
        setRespuestas(data.data.prospect.options || []);
        setRecomendaciones(data.data.text || []);
      } catch (error) {
        console.error("Error al cargar datos:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecomendaciones();
  }, [id]);

  if (loading)
    return <p className="text-center">Cargando recomendaciones...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Hola {nombreUsuario}, estas son tus recomendaciones:
      </h1>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Tus respuestas fueron:</h2>
        <ul className="list-disc pl-5 text-gray-700">
          {respuestas.map((resp, index) => (
            <li key={index} className="mb-2">
              <strong>{resp.question.statement}:</strong> {resp.text}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6 mb-4 border border-gray-200">
        <p className="text-lg text-gray-700 whitespace-pre-line">
          {recomendaciones}
        </p>
      </div>
    </div>
  );
}
