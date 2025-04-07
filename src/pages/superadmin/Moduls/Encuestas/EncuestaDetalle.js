// src/pages/superadmin/Moduls/Encuestas/EncuestaDetalle.jsx

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/**
 * Props esperados:
 *  - survey: { id, title, questions: [...], userId, ... }
 *  - allResponses: array de SurveyResponse (cada uno con .surveyId, .customerName, .answers[])
 *  - dateRange: [start, end] (si filtras por fecha) - opcional
 */
export default function EncuestaDetalle({ survey, allResponses, dateRange }) {
  // 1) Filtra las responses que correspondan a este survey.id
  const responses = useMemo(() => {
    return allResponses.filter((r) => r.surveyId === survey.id);
  }, [allResponses, survey.id]);

  // Manejo de preguntas vacías
  if (!survey.questions || survey.questions.length === 0) {
    return <div>No hay preguntas en esta encuesta.</div>;
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Detalles de la Encuesta: {survey.title}</h3>
      <p>Total de respuestas: {responses.length}</p>

      {survey.questions.map((q) => (
        <QuestionChart key={q.id} question={q} responses={responses} />
      ))}
    </div>
  );
}

/**
 * Muestra la data de UNA pregunta en forma de gráfica o lista.
 */
function QuestionChart({ question, responses }) {
  // Recolectar y preparar los datos para la gráfica/lista
  const dataForChart = useMemo(() => {
    let relevantAnswers = [];

    // 1) Recorrer cada response y buscar la respuesta de esta question
    responses.forEach((resp) => {
      const ans = resp.answers.find((a) => a.surveyQuestionId === question.id);
      if (ans) {
        // Guardamos también el nombre de quien respondió, si existe
        relevantAnswers.push({
          answerNumber: ans.answerNumber,
          answerText: ans.answerText || "",
          customerName: resp.customerName || "",
        });
      }
    });

    // 2) Según el tipo de pregunta, transformamos a la data que usará el render
    switch (question.type) {
      // ----- Pregunta tipo "text" => lista de comentarios -----
      case "text":
        // Devolvemos un array con { value, name }
        return relevantAnswers.map((obj) => ({
          value: obj.answerText,
          name: obj.customerName || "Anónimo",
        }));

      // ----- Escala 1..10 -----
      case "scale": {
        let countsScale = {};
        for (let i = 1; i <= 10; i++) countsScale[i] = 0;

        relevantAnswers.forEach((a) => {
          if (a.answerNumber >= 1 && a.answerNumber <= 10) {
            countsScale[a.answerNumber] =
              (countsScale[a.answerNumber] || 0) + 1;
          }
        });

        // Transformar a un array para Recharts: [{ value: "1", count: 2 }, ... ]
        return Object.keys(countsScale).map((val) => ({
          value: val,
          count: countsScale[val],
        }));
      }

      // ----- Sí/No -----
      case "yesno": {
        let yesCount = 0;
        let noCount = 0;
        relevantAnswers.forEach((a) => {
          if (a.answerText === "yes") yesCount++;
          if (a.answerText === "no") noCount++;
        });

        return [
          { value: "Sí", count: yesCount },
          { value: "No", count: noCount },
        ];
      }

      // ----- Opción múltiple -----
      case "multiple_choice": {
        let opts = question.optionsJson || [];
        let countsMulti = opts.map(() => 0);

        relevantAnswers.forEach((a) => {
          let idx = a.answerNumber;
          if (idx >= 0 && idx < opts.length) {
            countsMulti[idx]++;
          }
        });

        // Retornamos [{ value: "Opción1", count: X }, ...]
        return opts.map((label, i) => ({
          value: label,
          count: countsMulti[i],
        }));
      }

      // ----- Por defecto, igual a "text" -----
      default:
        return relevantAnswers.map((obj) => ({
          value: obj.answerText,
          name: obj.customerName || "Anónimo",
        }));
    }
  }, [responses, question]);

  // 3) Renderizamos según el tipo de la pregunta
  // Si no hay data
  if (!dataForChart || dataForChart.length === 0) {
    return (
      <div style={{ marginTop: 16 }}>
        <h4>{question.questionText}</h4>
        <p>No hay respuestas para esta pregunta.</p>
      </div>
    );
  }

  // ----- Si es texto, se muestra lista con el nombre -----
  if (question.type === "text") {
    return (
      <div style={{ marginTop: 16 }}>
        <h4>{question.questionText}</h4>
        <ul>
          {dataForChart.map((item, idx) => (
            <li key={idx} style={{ whiteSpace: "pre-wrap" }}>
              <strong>{item.name}:</strong> {item.value}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ----- Gráfica de barras para scale, yesno, multiple_choice -----
  return (
    <div style={{ marginTop: 16 }}>
      <h4>{question.questionText}</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={dataForChart}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="value" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
