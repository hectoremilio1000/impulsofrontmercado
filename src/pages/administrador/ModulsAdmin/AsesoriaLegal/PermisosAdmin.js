// src/pages/administrador/ModulsAdmin/AsesoriaLegal/PermisosAdmin.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, message, Spin } from "antd";
import { useAuth } from "../../../../components/AuthContext";

function PermisosAdmin() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar permisos al montar
  useEffect(() => {
    fetchPermisos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPermisos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/permisos-legales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setPermisos(res.data.data);
      } else {
        message.error("Error al cargar permisos legales");
      }
    } catch (error) {
      console.error("Error al cargar permisos:", error);
      message.error("Error de conexión al cargar permisos");
    } finally {
      setLoading(false);
    }
  };

  // Columnas de la tabla (sin acciones de editar/eliminar)
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 50,
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      width: 180,
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Institución",
      dataIndex: "institucion",
      key: "institucion",
      width: 120,
    },
    {
      title: "Costo",
      dataIndex: "costo",
      key: "costo",
      width: 80,
    },
    {
      title: "Link",
      dataIndex: "tramiteLink", // Nombre de la propiedad en tu backend
      key: "tramiteLink",
      width: 180,
      render: (text) =>
        text ? (
          <a href={text} target="_blank" rel="noopener noreferrer">
            Tramite
          </a>
        ) : (
          "N/A"
        ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Permisos Legales en CDMX para operar un Restaurante
      </h2>

      {loading ? (
        <Spin />
      ) : (
        <Table
          dataSource={permisos}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      )}
    </div>
  );
}

export default PermisosAdmin;
