import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export const SurveyCardToPrint = React.forwardRef(({ survey, apiUrl }, ref) => {
  return (
    <div ref={ref} style={{ width: "300px", padding: "16px" }}>
      <h2>Encuesta: {survey.title}</h2>
      <p>
        Usuario: {survey.user ? survey.user.name : "N/A"} (ID:{" "}
        {survey.user?.id || "N/A"})
      </p>
      <p>Código: {survey.code}</p>
      <p>Activo: {survey.is_active ? "Sí" : "No"}</p>

      <div style={{ marginTop: 16 }}>
        <QRCodeCanvas
          value={`${apiUrl}/surveys/fill?code=${survey.code}`}
          size={128}
        />
      </div>
    </div>
  );
});
