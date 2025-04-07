// src/pages/superadmin/Moduls/AyudaIA/RecomendacionAI.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function RecomendacionAI() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendation();
  }, []);

  async function fetchRecommendation() {
    try {
      setLoading(true);
      // Asumiendo que el endpoint para recomendación es /api/ayudaia/recomendacion/:id
      const resp = await axios.get(`${apiUrl}/ayudaia/recomendacion/${id}`);

      if (resp.data.status === "success") {
        setData(resp.data.data); // data = recommendation + prospect/user
      }
    } catch (error) {
      console.error("Error fetchRecommendation:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      {loading && <p>Cargando recomendación...</p>}
      {data && (
        <>
          <h2 className="text-xl font-bold mb-4">
            Recomendación #{data.id} para{" "}
            {data.prospectId
              ? `Prospecto ID ${data.prospectId}`
              : `Usuario ID ${data.userId}`}
          </h2>
          <pre className="whitespace-pre-wrap">{data.text}</pre>
        </>
      )}
    </div>
  );
}

export default RecomendacionAI;
