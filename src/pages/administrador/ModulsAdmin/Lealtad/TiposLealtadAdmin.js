// src/pages/superadmin/Moduls/Lealtad/TiposLealtad.jsx
import React, { useState } from "react";
import { Card, Row, Col, Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";

export default function TiposLealtad() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  // Función para abrir el modal con la URL del video que quieras mostrar
  const showVideoExample = (url) => {
    setVideoUrl(url);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setVideoUrl("");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tipos de Programa de Lealtad</h1>
      <p className="mb-6">
        Ofrecemos dos tipos básicos de programas de lealtad:{" "}
        <strong>Visitas</strong> y <strong>Productos</strong>.
      </p>

      <Row gutter={[16, 16]}>
        {/* Programa de Visitas */}
        <Col xs={24} md={12}>
          <Card title="Programa de Visitas" className="mb-4">
            <p>
              Con este programa, cada <strong>visita</strong> de tu cliente suma
              hasta llegar a un número requerido, y luego se obtiene un premio
              (ej. “Compra 3 y la 4ta es gratis”).
            </p>

            <div className="flex space-x-2">
              <Button
                type="primary"
                onClick={() => navigate("/solicitarlealtadadmin")}
              >
                Solicitar programa de visitas
              </Button>

              {/* Botón para ver un ejemplo en video */}
              <Button
                onClick={() =>
                  showVideoExample(
                    "https://www.youtube.com/embed/tuVideoDeEjemplo"
                  )
                }
              >
                Ver Ejemplo
              </Button>
            </div>
          </Card>
        </Col>

        {/* Programa de Productos */}
        <Col xs={24} md={12}>
          <Card title="Programa de Productos" className="mb-4">
            <p>
              Con este programa, cada <strong>producto</strong> comprado suma, y
              al llegar a un número requerido, se obtiene un premio (ej. “Compra
              5 productos y el 6to es gratis”).
            </p>

            <div className="flex space-x-2">
              <Button
                type="primary"
                onClick={() => navigate("/solicitarlealtadadmin")}
              >
                Solicitar programa de productos
              </Button>

              <Button
                onClick={() =>
                  showVideoExample(
                    "https://www.youtube.com/embed/otroVideoEjemplo"
                  )
                }
              >
                Ver Ejemplo
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modal para mostrar el video */}
      <Modal
        visible={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={800} // Ajusta el ancho a tu gusto
        destroyOnClose
      >
        {videoUrl && (
          <div
            className="relative"
            style={{ paddingBottom: "56.25%", height: 0 }}
          >
            <iframe
              src={videoUrl}
              title="Video de ejemplo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
