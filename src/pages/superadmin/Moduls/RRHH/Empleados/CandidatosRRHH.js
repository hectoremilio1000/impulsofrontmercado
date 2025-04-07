// src/pages/rrhh/CandidatosRRHH.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Select,
  Input,
  Button,
  message,
  Dropdown,
  Menu,
  Modal,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../../components/AuthContext";

const { Option } = Select;
const { TextArea } = Input;

function CandidatosRRHH() {
  const { auth } = useAuth();
  const token = auth?.token;
  const apiUrl = process.env.REACT_APP_API_URL;

  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Para filtrar
  const [users, setUsers] = useState([]);
  const [selectedUserFilter, setSelectedUserFilter] = useState(null);
  const [selectedPositionFilter, setSelectedPositionFilter] = useState(null);

  // Para mostrar el CV en un modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCVPath, setCurrentCVPath] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidatos();
    fetchUsers();
  }, []);

  // Cargar candidatos
  const fetchCandidatos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setCandidatos(res.data.data);
      } else {
        message.error("Error al obtener candidatos");
      }
    } catch (error) {
      console.error("Error al obtener candidatos:", error);
      message.error("Error de servidor al obtener candidatos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios (si quieres filtrar por user)
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.data) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  // Guardar comentarios
  const handleCommentSave = async (candidateId, comments) => {
    if (!candidateId) return;
    try {
      await axios.put(
        `${apiUrl}/candidates/comments`,
        {
          id: candidateId,
          comments,
          status: "Por Revisar",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Comentarios guardados");
    } catch (error) {
      console.error("Error al enviar comentarios:", error);
      message.error("No se pudieron guardar los comentarios");
    }
  };

  const handleOpenCVModal = (cvPath) => {
    setCurrentCVPath(`${apiUrl}/${cvPath}`);
    setIsModalVisible(true);
  };

  // Cambiar estado del candidato
  const handleEstadoChange = async (candidate, newEstado) => {
    if (newEstado === "Start Exam") {
      try {
        const res = await axios.post(
          `${apiUrl}/rrhh/preguntas/iniciar-examen`,
          {
            candidatoId: candidate.id,
            puesto: candidate.position,
            etapa: "psicométricos", // ajusta según tu backend
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.status === 200) {
          const data = res.data;
          // data.intentoId -> "intento-12345"
          navigate(
            `/examenesrrhh/${candidate.id}?intentoId=${data.intentoId}&puesto=${candidate.position}`
          );
        } else {
          message.error("No se pudo iniciar el examen");
        }
      } catch (error) {
        console.error("Error al iniciar examen:", error);
        message.error("Error de servidor al iniciar examen");
      }
      return;
    }

    // Para otros estados
    try {
      await axios.put(
        `${apiUrl}/candidates/status`,
        {
          id: candidate.id,
          status: newEstado,
          comments: candidate.comments || "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCandidatos((prev) =>
        prev.map((c) =>
          c.id === candidate.id ? { ...c, status: newEstado } : c
        )
      );
      message.success("Estado actualizado correctamente");
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      message.error("Error de servidor al cambiar estado");
    }
  };

  // Filtrado en memoria
  const filteredData = candidatos.filter((cand) => {
    if (selectedUserFilter && cand.user_id !== selectedUserFilter) {
      return false;
    }
    if (selectedPositionFilter && cand.position !== selectedPositionFilter) {
      return false;
    }
    return true;
  });

  // Definición columnas
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      fixed: "left",
    },
    {
      title: "Nombre",
      dataIndex: "name",
      width: 150,
      fixed: "left",
    },
    {
      title: "Puesto",
      dataIndex: "position",
      width: 140,
      fixed: "left",
    },
    {
      title: "Fecha Aplicación",
      dataIndex: "createdAt",
      width: 150,
      render: (val) => {
        if (!val) return "N/A";
        const fecha = new Date(val);
        return fecha.toLocaleDateString("es-MX", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      title: "WhatsApp",
      dataIndex: "whatsapp",
      render: (val) =>
        val ? (
          <a
            href={`https://wa.me/${val}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {val}
          </a>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "CV",
      dataIndex: "cvPath",
      render: (cv) => {
        if (!cv || cv === "null") return "No disponible";
        return (
          <Button type="link" onClick={() => handleOpenCVModal(cv)}>
            Ver CV
          </Button>
        );
      },
    },
    {
      title: "Ref1 Empresa",
      dataIndex: "reference1Company",
      render: (val) => val || "N/A",
    },
    {
      title: "Ref1 WhatsApp",
      dataIndex: "reference1Whatsapp",
      render: (val) =>
        val ? (
          <a
            href={`https://wa.me/${val}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {val}
          </a>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Ref2 Empresa",
      dataIndex: "reference2Company",
      render: (val) => val || "N/A",
    },
    {
      title: "Ref2 WhatsApp",
      dataIndex: "reference2Whatsapp",
      render: (val) =>
        val ? (
          <a
            href={`https://wa.me/${val}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {val}
          </a>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Comentarios",
      dataIndex: "comments",
      render: (value, record) => (
        <div>
          <TextArea
            rows={2}
            value={record.comments || ""}
            onChange={(e) => {
              const newValue = e.target.value;
              setCandidatos((prev) =>
                prev.map((cand) =>
                  cand.id === record.id ? { ...cand, comments: newValue } : cand
                )
              );
            }}
            placeholder="Agregar comentarios"
          />
          <Button
            size="small"
            type="primary"
            style={{ marginTop: 4 }}
            onClick={() => handleCommentSave(record.id, record.comments)}
          >
            Guardar
          </Button>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Acciones",
      dataIndex: "status",
      render: (status, record) => {
        const menu = (
          <Menu
            onClick={({ key }) => handleEstadoChange(record, key)}
            items={[
              { key: "To Review", label: "To Review" },
              { key: "Start Exam", label: "Start Exam" },
              { key: "Exam Completed", label: "Exam Completed" },
              { key: "Approved", label: "Approved" },
              { key: "Discarded", label: "Discarded" },
            ]}
          />
        );
        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <h2>Lista de Candidatos</h2>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ marginRight: 8 }}>Filtrar por Usuario:</label>
          <Select
            placeholder="Selecciona un user"
            allowClear
            style={{ width: 200 }}
            value={selectedUserFilter}
            onChange={(val) => setSelectedUserFilter(val || null)}
          >
            {users.map((u) => (
              <Option key={u.id} value={u.id}>
                {u.name} (ID {u.id})
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <label style={{ marginRight: 8 }}>Filtrar por Puesto:</label>
          <Select
            placeholder="Selecciona un puesto"
            allowClear
            style={{ width: 200 }}
            value={selectedPositionFilter}
            onChange={(val) => setSelectedPositionFilter(val || null)}
          >
            <Option value="Mesero">Mesero</Option>
            <Option value="Gerente">Gerente</Option>
            <Option value="Barman">Barman</Option>
            <Option value="Cocinero">Cocinero</Option>
            <Option value="Lavaloza">Lavaloza</Option>
          </Select>
        </div>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 2000, y: 450 }}
      />
      <Modal
        open={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        width="80%"
      >
        {currentCVPath ? (
          <iframe
            src={currentCVPath}
            style={{ width: "100%", height: "80vh", border: "none" }}
            title="CV Preview"
          />
        ) : (
          <p>CV no disponible</p>
        )}
      </Modal>
    </div>
  );
}

export default CandidatosRRHH;
