import React from "react";

const AdminPanel = () => {
  const modules = [
    { name: "Inventario", path: "/inventario" },
    { name: "Punto de Venta", path: "/pos" },
    { name: "Configuración", path: "/configuracion" },
    // Agrega más módulos según sea necesario
  ];

  return (
    <div>
      <h1>Panel de Control</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        {modules.map((module, index) => (
          <div
            key={index}
            style={{ border: "1px solid black", padding: "20px" }}
          >
            <h2>{module.name}</h2>
            <button onClick={() => (window.location.href = module.path)}>
              Ir a {module.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
