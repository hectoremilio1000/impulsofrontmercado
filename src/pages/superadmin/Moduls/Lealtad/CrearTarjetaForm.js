// CrearTarjetaForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { message } from "antd";
import { useAuth } from "../components/AuthContext"; // asumiendo tu AuthContext

export default function CrearTarjetaForm({ programId, onDone }) {
  const { auth } = useAuth();
  const [code, setCode] = useState("");
  const [customerName, setCustomerName] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleCreate = async () => {
    try {
      await axios.post(
        `${apiUrl}/loyalty/cards`,
        {
          program_id: programId,
          code, // si se deja vacío, el backend genera uno
          customer_name: customerName,
          is_active: true,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      message.success("Tarjeta creada con éxito");
      // onDone => para refrescar la tabla de tarjetas o cerrar modal
      if (onDone) onDone();
    } catch (err) {
      console.error(err);
      message.error("Error al crear tarjeta");
    }
  };

  return (
    <div>
      <h3>Crear Tarjeta para Program #{programId}</h3>

      <label>Code (opcional):</label>
      <input value={code} onChange={(e) => setCode(e.target.value)} />
      <br />

      <label>Customer Name (opcional):</label>
      <input
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />
      <br />

      <button onClick={handleCreate}>Crear Tarjeta</button>
    </div>
  );
}
