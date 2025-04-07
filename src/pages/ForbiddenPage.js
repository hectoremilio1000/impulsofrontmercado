// src/pages/ForbiddenPage.js
import React, { useState, useEffect } from "react";
import { Spin } from "antd";

function ForbiddenPage() {
  const [loading, setLoading] = useState(true);

  // Simulamos alguna carga o verificación
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); // medio segundo o el tiempo que quieras
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Spin tip="Verificando acceso..." />;
  }

  return (
    <div>
      <h2>403 - Acceso prohibido</h2>
      <p>No tienes permisos para acceder a esta sección.</p>
    </div>
  );
}

export default ForbiddenPage;
