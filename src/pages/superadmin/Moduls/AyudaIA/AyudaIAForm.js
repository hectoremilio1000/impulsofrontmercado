import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import FormularioProspect from "./FormularioProspect"; // <-- Tu formulario de encuestas

export default function AyudaIAForm() {
  // 1. URL base de tu API (ajusta si usas otra variable)
  const apiUrl = process.env.REACT_APP_API_URL;

  // 2. Leer el query string: ?type=prospect&id=15
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type"); // "prospect" o "user"
  const id = searchParams.get("id"); // ej: "15"

  // 3. Estado para almacenar prospect o user
  const [prospect, setProspect] = useState(null);
  const [user, setUser] = useState(null);

  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 4. Al montar, si type=prospect => loadProspect, si type=user => loadUser
  useEffect(() => {
    if (type === "prospect" && id) {
      loadProspect(id);
    } else if (type === "user" && id) {
      loadUser(id);
    }
  }, [type, id]);

  async function loadProspect(prospectId) {
    try {
      setLoading(true);
      setError(null);

      const resp = await axios.get(`${apiUrl}/prospects/${prospectId}`);
      if (resp.data.status === "success") {
        // Guardo el prospect
        setProspect(resp.data.data); // { id, first_name, last_name, ...}
      } else {
        throw new Error("Prospect no encontrado");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error loadProspect:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadUser(userId) {
    try {
      setLoading(true);
      setError(null);

      const resp = await axios.get(`${apiUrl}/users/${userId}`);
      if (resp.data.status === "success") {
        // Guardo el user
        setUser(resp.data.data); // { id, name, email, ...}
      } else {
        throw new Error("Usuario no encontrado");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error loadUser:", err);
    } finally {
      setLoading(false);
    }
  }

  // 5. Manejo de "onComplete" cuando termine la encuesta
  const handleComplete = (respuestas) => {
    message.success("Encuesta completada con éxito");
    // Podrías hacer aquí un POST /recommendations o lo que desees
  };

  // 6. Render condicional
  if (loading) {
    return <p>Cargando datos...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  // A) Caso type=prospect
  if (type === "prospect") {
    // si no tengo prospect, aviso
    if (!prospect) {
      return <p>No se ha cargado el prospect (ID inválido o en proceso)</p>;
    }

    // si sí tengo prospect => mostrar formulario
    return (
      <div style={{ padding: 16 }}>
        <h1>Encuesta para el prospecto: {prospect.firstName}</h1>
        <FormularioProspect prospect={prospect} onComplete={handleComplete} />
      </div>
    );
  }

  // B) Caso type=user
  if (type === "user") {
    if (!user) {
      return <p>No se ha cargado el usuario (ID inválido o en proceso)</p>;
    }

    // OJO: Reutilizamos el mismo FormularioProspect, pero pasándole "prospect={user}".
    // Podrías renombrarlo internamente o adaptar la lógica.
    return (
      <div style={{ padding: 16 }}>
        <h1>Encuesta para {user.name}</h1>
        <FormularioProspect prospect={user} onComplete={handleComplete} />
      </div>
    );
  }

  // C) Cualquier otro type
  return <p>Parámetros de URL inválidos (falta ?type= o ?id=)</p>;
}
