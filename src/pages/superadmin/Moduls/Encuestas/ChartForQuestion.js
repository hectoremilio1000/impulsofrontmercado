// src/pages/superadmin/Moduls/Encuestas/ChartForQuestion.jsx

import React, { useMemo } from "react";
import { Pie, Column } from "@ant-design/plots";

/**
 * Muestra una gráfica según el tipo de pregunta:
 * "yesno", "scale", "multiple_choice", o "text".
 */
export default function ChartForQuestion({ question, responses }) {
  // 1) Obtener las answers *solo* de esta pregunta
  const answers = useMemo(() => {
    let arr = [];
    responses.forEach((resp) => {
      if (resp.answers) {
        const found = resp.answers.filter(
          (a) => a.surveyQuestionId === question.id
        );
        arr = arr.concat(found);
      }
    });
    return arr;
  }, [responses, question.id]);

  // 2) Lógica por tipo:
  if (question.type === "yesno") {
    // Contar yes/no
    let yesCount = 0;
    let noCount = 0;
    answers.forEach((a) => {
      if (a.answerText === "yes") yesCount++;
      if (a.answerText === "no") noCount++;
    });

    const data = [
      { type: "Sí", value: yesCount },
      { type: "No", value: noCount },
    ];

    // Para Pie, quita "type: 'inner'" en label
    const config = {
      data,
      angleField: "value",
      colorField: "type",
      radius: 0.8,
      label: {
        // Eliminamos type: 'inner'
        offset: "-30%",
        content: "{value}",
        style: { textAlign: "center", fontSize: 14 },
      },
      interactions: [{ type: "element-active" }],
    };
    return <Pie {...config} />;
  }

  if (question.type === "scale") {
    // Promedio de "answerNumber"
    let sum = 0;
    let count = 0;
    answers.forEach((a) => {
      if (typeof a.answerNumber === "number") {
        sum += a.answerNumber;
        count++;
      }
    });
    const avg = count === 0 ? 0 : sum / count;

    const data = [{ category: "Promedio", value: avg }];
    // Cambiamos label.position a "top" en lugar de "middle"
    const config = {
      data,
      xField: "category",
      yField: "value",
      columnWidthRatio: 0.5,
      label: {
        position: "top",
        style: { fill: "#000" },
      },
      meta: { value: { alias: "Promedio" } },
    };
    return <Column {...config} />;
  }

  if (question.type === "multiple_choice") {
    // Contar cuántas veces se eligió cada índice
    const counts = {};
    answers.forEach((a) => {
      const val = a.answerNumber;
      if (val != null) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    // Data para Column
    const data = Object.keys(counts).map((key) => ({
      opcion: `Opción #${key}`,
      cantidad: counts[key],
    }));

    const config = {
      data,
      xField: "opcion",
      yField: "cantidad",
      seriesField: "opcion",
      legend: false,
      label: {
        position: "top", // en vez de "middle"
        style: { fill: "#000" },
      },
    };
    return <Column {...config} />;
  }

  if (question.type === "text") {
    // Solo listamos la respuesta en <ul>
    return (
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {answers.length === 0 ? (
          <p>No hay respuestas de texto.</p>
        ) : (
          <ul>
            {answers.map((a) => (
              <li key={a.id}>{a.answerText || <em>(vacío)</em>}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return <p>Tipo de pregunta no soportado: {question.type}</p>;
}
