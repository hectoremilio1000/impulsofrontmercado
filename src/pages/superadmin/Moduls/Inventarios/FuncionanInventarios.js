import React from "react";

function FuncionanInventarios() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>
        ¿Cómo funciona nuestro sistema de inventarios en Impulso Restaurantero?
      </h2>

      <p>
        En <strong>Impulso Restaurantero</strong> comenzamos realizando un{" "}
        <strong>mapeo de procesos</strong> para conocer a detalle cómo se compra
        cada insumo o producto. A continuación, identificamos las{" "}
        <strong>recetas</strong> en las que se utiliza cada producto, de forma
        que podamos llevar un control de qué, cuánto y cuándo se consume.
      </p>

      <p>
        Con esto, trabajamos en <strong>archivos de Google Sheets</strong> (o
        herramientas similares) para establecer las relaciones entre inventario
        inicial, compras y ventas. De esta manera, se obtiene el inventario
        final siguiendo la fórmula:
      </p>
      <blockquote style={{ paddingLeft: 16, borderLeft: "4px solid #ccc" }}>
        Inventario Final = Inventario Inicial + Compras - Ventas
      </blockquote>
      <p>
        Sin embargo, si este proceso se vuelve muy complejo o tardado, nos
        enfocamos en un <strong>método de costos por insumos</strong> como
        porcentaje de ventas. Eso nos permite identificar rápidamente los puntos
        donde existe mayor fuga o pérdida, y priorizar las acciones correctivas.
      </p>

      {/* Opcional: Incrusta un iframe con tu video explicativo. 
          Sustituye `src` con la URL de tu video en Sora, YouTube, etc. */}
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <h3>Video Explicativo</h3>
        <div
          style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}
        >
          <iframe
            src="https://www.youtube.com/embed/VIDEO_ID"
            // Ejemplo: "https://www.youtube.com/embed/PnIJGozHCWA"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Explicación de Inventarios"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default FuncionanInventarios;
