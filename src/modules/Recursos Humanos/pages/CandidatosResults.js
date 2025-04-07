import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const CandidateResults = () => {
  const { id } = useParams();
  const chartRef = useRef(null);

  const scores = {
    responsabilidad: 8,
    trabajoEquipo: 7,
    honestidad: 9,
    puntualidad: 8,
    carisma: 6,
    conocimientos: 7,
    ingles: 8,
  };

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    new Chart(ctx, {
      type: "radar",
      data: {
        labels: [
          "Responsabilidad",
          "Trabajo en equipo",
          "Honestidad",
          "Puntualidad",
          "Carisma",
          "Conocimientos",
          "Inglés",
        ],
        datasets: [
          {
            label: `Resultados del Candidato ${id}`,
            data: Object.values(scores),
            backgroundColor: "rgba(34, 202, 236, 0.2)",
            borderColor: "rgba(34, 202, 236, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(34, 202, 236, 1)",
          },
        ],
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            max: 10,
          },
        },
      },
    });
  }, [id]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Resultados del Candidato {id} Jose Ventura
      </h1>
      <canvas ref={chartRef} width={400} height={400}></canvas>
      <div className="mt-4">
        {Object.entries(scores).map(([key, value]) => (
          <p key={key} className="text-lg">
            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
            {value}/10
          </p>
        ))}
      </div>
    </div>
  );
};

export default CandidateResults;
