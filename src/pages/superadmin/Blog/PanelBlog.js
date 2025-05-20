import { useEffect, useState } from "react";
import { Table, Button, Popconfirm, Tag, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function PanelBlog() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/blog-posts?limit=100`);
      setData(res.data.data); // paginator -> data
    } catch (err) {
      message.error("No se pudo cargar el blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const columns = [
    { title: "Título", dataIndex: "title", key: "title" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    {
      title: "Publicado",
      dataIndex: "publishedAt",
      render: (v) => (v ? <Tag color="green">Sí</Tag> : <Tag>No</Tag>),
    },
    {
      title: "Acciones",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            size="small"
            onClick={() => navigate(`/crearblog?id=${record.id}`)}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Seguro de eliminar?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger size="small" className="ml-2">
              Borrar
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/blog-posts/${id}`);
      message.success("Eliminado");
      setData(data.filter((p) => p.id !== id));
    } catch {
      message.error("Error al eliminar");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Blog – Panel</h1>
        <Button type="primary" onClick={() => navigate("/crearblog")}>
          Nuevo post
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
      />
    </>
  );
}
