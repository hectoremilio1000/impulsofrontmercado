import React, { useEffect, useState } from "react";
import { Button, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

function AyudaIAAdmin() {
  const navigate = useNavigate();
  const { auth } = useAuth(); // de tu contexto de autenticación
  const apiUrl = process.env.REACT_APP_API_URL;

  // ID del usuario logueado
  const userId = auth?.user?.id;

  // Estados
  const [loading, setLoading] = useState(true);
  const [hasRecommendation, setHasRecommendation] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Al montar el componente, verificamos si ESTE usuario ya tiene recomendacion
   */
  useEffect(() => {
    checkIfHasRecommendation();
    // eslint-disable-next-line
  }, []);

  async function checkIfHasRecommendation() {
    try {
      setLoading(true);

      // Opción A) Llamar tu endpoint /recommendations y filtrar en front
      // const resp = await axios.get(`${apiUrl}/recommendations`);
      // const recs = resp.data.data || [];
      // const found = recs.some((item) => item.userId === userId);
      // setHasRecommendation(found);

      // Opción B) Tener un endpoint que responda directo si YO ya tengo (algo tipo /recommendations/check?userId=...)
      // Ajusta según tu backend. Aquí muestro la forma "A".
      const resp = await axios.get(`${apiUrl}/recommendations`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      if (resp.data.status === "success") {
        const list = resp.data.data || [];
        // Buscamos si hay recomendación con userId = userId
        const yaTiene = list.some((item) => item.userId === userId);
        setHasRecommendation(yaTiene);
      } else {
        throw new Error("No se pudo cargar la info de recomendaciones");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      message.error("Error verificando recomendación");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Cuando se da clic en “Crear Encuesta”
   * Simplemente navegamos a la ruta (sin crear prospect, etc.)
   * type=user&id=...
   */
  function handleCrearEncuesta() {
    if (!userId) {
      message.error(
        "No se encontró el ID de tu usuario (¿no estás logueado?)."
      );
      return;
    }
    // Redirigimos a la ruta para llenar la encuesta
    navigate(`/ayudaiaadmin/llenar-encuesta?type=user&id=${userId}`);
  }

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <Spin tip="Verificando recomendación..." />
      </div>
    );
  }

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 className="text-2xl font-bold mb-4">
        Panel de “Ayuda con IA” (Admin)
      </h1>

      {hasRecommendation ? (
        <p>
          <strong>Ya cuentas con una recomendación de IA.</strong> No puedes
          crear otra.
        </p>
      ) : (
        <Button type="primary" onClick={handleCrearEncuesta}>
          Crear Recomendación (para mí)
        </Button>
      )}
    </div>
  );
}

export default AyudaIAAdmin;
