// src/pages/superadmin/Moduls/Encuestas/EstadisticasModal.jsx

import React from "react";
import { Modal } from "antd";
import ChartForQuestion from "./ChartForQuestion";

export default function EstadisticasModal({
  visible,
  onClose,
  survey,
  responses,
}) {
  // Asegurarnos de que survey tenga 'questions' preloaded. Si no, hacemos un []
  const { questions = [] } = survey;

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      onOk={onClose}
      width={800}
      title={`Estadísticas de: ${survey.title}`}
    >
      {questions.length === 0 ? (
        <p>Esta encuesta no tiene preguntas definidas.</p>
      ) : (
        questions.map((q) => (
          <div key={q.id} style={{ marginBottom: 24 }}>
            <h4>
              Pregunta #{q.id}: {q.question_text} <br />
              <small>Tipo: {q.type}</small>
            </h4>
            <ChartForQuestion question={q} responses={responses} />
          </div>
        ))
      )}
    </Modal>
  );
}
