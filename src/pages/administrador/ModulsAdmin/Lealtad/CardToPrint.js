import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export const CardToPrint = React.forwardRef((props, ref) => {
  // Obtenemos la tarjeta desde props.card
  const { card } = props;
  const apiUrl = process.env.REACT_APP_API_URL;

  // Usamos `ref` en el contenedor principal para que react-to-print sepa qué imprimir
  return (
    <div ref={ref} style={{ width: "300px", padding: "16px" }}>
      <h2>Tarjeta ID: {card.id}</h2>
      <p>Cliente: {card.customer_name || "N/A"}</p>
      <p>Código: {card.code}</p>
      <p>Visitas: {card.visits_count || 0}</p>

      <div style={{ marginTop: 16 }}>
        <QRCodeCanvas
          value={`${apiUrl}/loyalty/scan?code=${card.code}`}
          size={128}
        />
      </div>
    </div>
  );
});
