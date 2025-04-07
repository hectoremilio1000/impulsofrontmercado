import React, { useEffect, useState } from "react";
import FormularioProspect from "../../../components/rolSuperAdmin/FormularioProspecto";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { message } from "antd";

const LlenarEncuestaProspect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prospect, setProspect] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    if (id) {
      const search_user = async () => {
        try {
          const response = await axios.get(`${apiUrl}/prospects/${id}`);
          const data = response.data;
          if (data.status === "success") {
            message.success("Usuario Encontrado");
            setProspect(data.data);
          } else {
            throw new Error("No se encontraron preguntas para este usuario");
          }
        } catch (error) {
          console.log(error);
        }
      };
      search_user();
    } else {
      message.error("No existe este usuario");
    }
  }, [id, apiUrl]);

  const handleFormularioCompleto = async (respuestas) => {
    try {
      // Generar recomendaciones
      const response = await axios.post(`${apiUrl}/recommendations`, {
        respuestas: respuestas,
        nombreUsuario: prospect.firstName,
        prospect_id: prospect.id,
      });
      const data = response.data;

      if (data.status !== "success")
        throw new Error("Error al generar recomendaciones.");

      message.success("Recomendaciones generadas con éxito.");
      navigate(`/recomendaciones/${data.data.id}`);
    } catch (error) {
      alert("Error al generar recomendaciones: " + error.message);
    }
  };
  return (
    <div className="p-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Preguntas</h1>

      <FormularioProspect
        prospect={prospect}
        onComplete={handleFormularioCompleto}
      />
    </div>
  );
};

export default LlenarEncuestaProspect;
