import React, { useState, useEffect } from "react";
import { Button, Input, message, Modal, Select, Table, Tag } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css";
import axios from "axios";
import { useAuth } from "../../../components/AuthContext";

const { Option } = Select;

const initialData = [
  {
    id: 10,
    name: "sadasd",
    whatsapp: "5521293811",
    email: "hector@gmail.com",
    position: "Subgerente",
    cv: "/files/cv10.pdf",
    comments: "ya se reviso",
    status: "creado",
  },
  {
    id: 9,
    name: "hector",
    whatsapp: "5521293811",
    email: "hector@gmail.com",
    position: "Mesero",
    cv: "/files/cv9.pdf",
    comments: "checar",
    status: "creado",
  },
  {
    id: 2,
    name: "asda",
    whatsapp: "5521293811",
    email: "dsd@gmail.com",
    position: "Gerente",
    cv: "/files/cv2.pdf",
    comments: "",
    status: "descartar",
  },
];

const Candidatos = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const iniciarExamen = (candidate_id, status, puesto) => {
    try {
      navigate(`/examen/${candidate_id}?intentoId=${1}&puesto=${puesto}`);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "WhatsApp",
      dataIndex: "whatsapp",
      key: "whatsapp",
      render: (text) => <a href={`tel:${text}`}>{text}</a>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Puesto",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "CV",
      dataIndex: "cv",
      key: "cv",
      render: (url) => (
        <a href={url} target="_blank" rel="noreferrer">
          Ver/Descargar
        </a>
      ),
    },
    {
      title: "Comentarios",
      dataIndex: "comments",
      key: "comments",
      render: (text, record) => (
        <Input
          defaultValue={text}
          // onBlur={(e) => updateComments(record.id, e.target.value)}
        />
      ),
    },
    // {
    //   title: "Acciones",
    //   key: "actions",
    //   render: (_, record) => (
    //     <div className="flex gap-2">
    //       {record.status === "descartar" ? (
    //         <>
    //           <Tag color="red">Descartado</Tag>
    //           <Button
    //             type="default"
    //             onClick={() => updateStatus(record.id, "iniciar examen")}
    //           >
    //             No descartar
    //           </Button>
    //         </>
    //       ) : record.status === "creado" ? (
    //         <>
    //           <Button
    //             type="default"
    //             onClick={() => updateStatus(record.id, "iniciar examen")}
    //           >
    //             Iniciar Examen
    //           </Button>
    //           <Button
    //             type="danger"
    //             onClick={() => updateStatus(record.id, "descartar")}
    //           >
    //             Descartar
    //           </Button>
    //         </>
    //       ) : record.status === "iniciar examen" ? (
    //         <>
    //           <Link to={`${record.id}/examen`}>
    //             <Button type="primary">Abrir Examen</Button>
    //           </Link>
    //           <Button
    //             type="default"
    //             onClick={() => updateStatus(record.id, "aprobado")}
    //           >
    //             Aprobar
    //           </Button>
    //           <Button
    //             type="danger"
    //             onClick={() => updateStatus(record.id, "descartar")}
    //           >
    //             Descartar
    //           </Button>
    //         </>
    //       ) : record.status === "aprobado" ? (
    //         <Tag color="green">Aprobado</Tag>
    //       ) : null}
    //     </div>
    //   ),
    // },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          {record.status === "descartar" ? (
            <>
              <Tag color="red">Descartado</Tag>
              <Button
                type="default"
                // onClick={() => updateStatus(record.id, "iniciar examen")}
              >
                No descartar
              </Button>
            </>
          ) : record.status === "To Review" ? (
            <>
              <Tag color="yellow">Por revisar</Tag>
              <Button
                type="default"
                onClick={() =>
                  iniciarExamen(record.id, "iniciar examen", record.position)
                }
              >
                Iniciar Examen
              </Button>
              <Button
                type="danger"
                // onClick={() => updateStatus(record.id, "descartar")}
              >
                Descartar
              </Button>
            </>
          ) : record.status === "iniciar examen" ? (
            <>
              <Link to={`${record.id}/examen`}>
                <Button type="primary">Abrir Examen</Button>
              </Link>
              <Button
                type="default"
                // onClick={() => updateStatus(record.id, "aprobado")}
              >
                Aprobar
              </Button>
              <Button
                type="danger"
                // onClick={() => updateStatus(record.id, "descartar")}
              >
                Descartar
              </Button>
            </>
          ) : record.status === "aprobado" ? (
            <>
              <Tag color="green">Aprobado</Tag>
              <Link to={`${record.id}/resultados`}>
                <Button type="primary">Ver Resultados</Button>
              </Link>
            </>
          ) : null}
        </div>
      ),
    },
  ];
  const apiUrl = process.env.REACT_APP_API_URL;
  const apiUrlFiles = process.env.REACT_APP_API_URL_FILES;
  const [candidates, setCandidates] = useState([]);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
  const [candidateCreate, setCandidateCreate] = useState({
    position: "Mesero",
    name: "",
    whatsapp: "",
    email: "",
    cv_path: "1234", //curriculum vitae del candidate
    reference1Company: "",
    reference1Position: "",
    reference1Name: "",
    reference1Timeworked: "",
    reference1Whatsapp: "",
    reference2Company: "",
    reference2Position: "",
    reference2Name: "",
    reference2Timeworked: "",
    reference2Whatsapp: "",
  });

  const abrirModalCreate = (e) => {
    e.stopPropagation();
    setIsModalOpenCreate(true);
  };

  const buscar_candidates = async () => {
    try {
      const response = await axios.get(`${apiUrl}/candidates`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });
      console.log(response);
      const data = response.data;
      console.log(data);
      if (data.status === "success") {
        setCandidates(data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error al obtener los modulos:", error);
    }
  };
  useEffect(() => {
    buscar_candidates();
  }, [auth, apiUrl]);

  // SECTION CREATE CANDIDATES
  const handleCreateChange = (key, value) => {
    setCandidateCreate((prev) => {
      const newCandidate = { ...prev, [key]: value };

      return newCandidate;
    });
  };
  const [cvFileCandidate, setCvFileCandidate] = useState("");
  const sendCvFile = async (modelosFiles) => {
    return new Promise(async (resolve, reject) => {
      const token = auth.token;
      const formData = new FormData();

      formData.append("propertyName", "curriculum"); //carpeta donde se almacenara el file

      modelosFiles.forEach((img, index) => {
        formData.append(`modelosFiles[${index}]`, img.file);
      });

      try {
        const response = await axios.post(
          `${apiUrlFiles}/uploadimg`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        resolve(data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
  };

  const createCandidate = async (newCandidate) => {
    const token = auth.token;

    try {
      const response = await axios.post(
        `${apiUrl}/candidates`,
        { candidate: newCandidate },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      return response.data; // Simplemente devuelve los datos
    } catch (error) {
      console.error("Upload error:", error);
      throw error; // Lanza el error para que pueda ser capturado en el llamado
    }
  };
  const handleOkCreate = async () => {
    setLoadingCreate(true);

    try {
      let urlFile = "";
      if (cvFileCandidate !== "") {
        const sendImagen = await sendCvFile([{ file: cvFileCandidate }]);
        console.log(sendImagen);
        urlFile = sendImagen.modelosImages[0];
      }
      const newCandidate = {
        ...candidateCreate,
        cv_path: urlFile,
      };
      const candidateData = await createCandidate(newCandidate);
      console.log(candidateData);
      if (candidateData.status === "success") {
        message.success("Se ha creado el candidato correctamente");

        await buscar_candidates();
        handleCancelCreate();
      } else {
        message.error("Ocurrio un error al crear la empresa");
      }
    } catch (error) {
      message.error("Ocurrió un error durante la creación del cliente");
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleCancelCreate = () => {
    setCandidateCreate({
      position: "Mesero",
      name: "",
      whatsapp: "",
      email: "",
      cv_path: "123", //curriculum vitae del candidate
      reference1Company: "",
      reference1Position: "",
      reference1Name: "",
      reference1Timeworked: "",
      reference1Whatsapp: "",
      reference2Company: "",
      reference2Position: "",
      reference2Name: "",
      reference2Timeworked: "",
      reference2Whatsapp: "",
    });

    setIsModalOpenCreate(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4 gap-6">
        <h1 className="text-md md:text-2xl font-bold mb-4">
          Lista de Candidatos
        </h1>
        <button
          onClick={() => setIsModalOpenCreate(true)}
          className="text-sm px-3 py-2 rounded bg-dark-purple text-white"
        >
          Nuevo Candidato
        </button>
      </div>
      <Modal
        footer={null}
        title="Register"
        open={isModalOpenCreate}
        onCancel={handleCancelCreate}
      >
        <div className="relative w-full">
          {loadingCreate ? (
            <div className="bg-dark-purple z-50 text-white absolute top-0 left-0 right-0 bottom-0 w-full flex items-center justify-center">
              Loading
            </div>
          ) : null}
          <div className="w-full mb-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="w-full">
                <label className="font-bold text-sm" htmlFor="">
                  Nombres Completos
                </label>
                <input
                  value={candidateCreate?.name}
                  onChange={(e) => handleCreateChange("name", e.target.value)}
                  type="text"
                  className="px-3 py-2 rounded bg-gray-200 focus:outline-none text-sm w-full"
                />
              </div>
              <div className="w-full">
                <label className="font-bold text-sm" htmlFor="">
                  WhatsApp
                </label>
                <input
                  value={candidateCreate?.whatsapp}
                  onChange={(e) =>
                    handleCreateChange("whatsapp", e.target.value)
                  }
                  type="text"
                  className="px-3 py-2 rounded bg-gray-200 focus:outline-none text-sm w-full"
                />
              </div>
              <div className="w-full">
                <label className="font-bold text-sm" htmlFor="">
                  Correo Electrónico
                </label>
                <input
                  value={candidateCreate?.email}
                  onChange={(e) => handleCreateChange("email", e.target.value)}
                  type="text"
                  className="px-3 py-2 rounded bg-gray-200 focus:outline-none text-sm w-full"
                />
              </div>
            </div>
            <div className="w-ful">
              <label className="font-bold text-sm" htmlFor="sue tu cv">
                Curriculum Vitae
              </label>
              <div className="w-full px-3 py-2 bg-gray-200">
                <input
                  type="file"
                  onChange={(e) => setCvFileCandidate(e.target.files[0])}
                />
              </div>
            </div>
            <div className="w-full mt-4">
              <h1>Referencia Laboral 1</h1>
              <div className="w-full">
                <div className="grid grid-cols-2 w-full gap-4">
                  <div className="w-full">
                    <label className="font-bold text-sm" htmlFor="">
                      Nombre de la empresa
                    </label>
                    <input
                      value={candidateCreate?.reference1Company}
                      onChange={(e) =>
                        handleCreateChange("reference1Company", e.target.value)
                      }
                      type="text"
                      className="px-3 py-2 rounded bg-gray-200 focus:outline-none text-sm w-full"
                    />
                  </div>
                  <div className="w-full">
                    <label className="font-bold text-sm" htmlFor="">
                      Cargo
                    </label>
                    <input
                      value={candidateCreate?.reference1Position}
                      onChange={(e) =>
                        handleCreateChange("reference1Position", e.target.value)
                      }
                      type="text"
                      className="px-3 py-2 rounded bg-gray-200 focus:outline-none text-sm w-full"
                    />
                  </div>
                  <div className="w-full">
                    <label className="font-bold text-sm" htmlFor="">
                      Nombre de la persona
                    </label>
                    <input
                      value={candidateCreate?.reference1Name}
                      onChange={(e) =>
                        handleCreateChange("reference1Name", e.target.value)
                      }
                      type="text"
                      className="px-3 py-2 rounded bg-gray-200 focus:outline-none text-sm w-full"
                    />
                  </div>
                  <div className="w-full">
                    <label className="font-bold text-sm" htmlFor="">
                      Tiempo laborado
                    </label>
                    <input
                      value={candidateCreate?.reference1Timeworked}
                      onChange={(e) =>
                        handleCreateChange(
                          "reference1Timeworked",
                          e.target.value
                        )
                      }
                      type="text"
                      className="px-3 py-2 rounded bg-gray-200 focus:outline-none text-sm w-full"
                    />
                  </div>
                  <div className="w-full">
                    <label className="font-bold text-sm" htmlFor="">
                      Whatsapp
                    </label>
                    <input
                      value={candidateCreate?.reference1Whatsapp}
                      onChange={(e) =>
                        handleCreateChange("reference1Whatsapp", e.target.value)
                      }
                      type="text"
                      className="px-3 py-2 rounded bg-gray-200 focus:outline-none text-sm w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full mt-4">
              <h1>Referencia Laboral 2</h1>
              <div className="w-full">
                <div className="grid grid-cols-2 w-full gap-4">
                  <div className="w-full">
                    <label className="font-bold text-sm" htmlFor="">
                      Nombre de la empresa
                    </label>
                    <input
                      value={candidateCreate?.reference2Company}
                      onChange={(e) =>
                        handleCreateChange("reference2Company", e.target.value)
                      }
                      type="text"
                      className="px-3 py-2 rounded bg-gray-200 focus:outline-none text-sm w-full"
                    />
                  </div>
                  <div className="w-full">
                    <label className="font-bold text-sm" htmlFor="">
                      Cargo
                    </label>
                    <input
                      value={candidateCreate?.reference2Position}
                      onChange={(e) =>
                        handleCreateChange("reference2Position", e.target.value)
                      }
                      type="text"
                      className="px-3 py-2 rounded bg-gray-200 focus:outline-none text-sm w-full"
                    />
                  </div>
                  <div className="w-full">
                    <label className="font-bold text-sm" htmlFor="">
                      Nombre de la persona
                    </label>
                    <input
                      value={candidateCreate?.reference2Name}
                      onChange={(e) =>
                        handleCreateChange("reference2Name", e.target.value)
                      }
                      type="text"
                      className="px-3 py-2 rounded bg-gray-200 focus:outline-none text-sm w-full"
                    />
                  </div>
                  <div className="w-full">
                    <label className="font-bold text-sm" htmlFor="">
                      Tiempo laborado
                    </label>
                    <input
                      value={candidateCreate?.reference2Timeworked}
                      onChange={(e) =>
                        handleCreateChange(
                          "reference2Timeworked",
                          e.target.value
                        )
                      }
                      type="text"
                      className="px-3 py-2 rounded bg-gray-200 focus:outline-none text-sm w-full"
                    />
                  </div>
                  <div className="w-full">
                    <label className="font-bold text-sm" htmlFor="">
                      Whatsapp
                    </label>
                    <input
                      value={candidateCreate?.reference2Whatsapp}
                      onChange={(e) =>
                        handleCreateChange("reference2Whatsapp", e.target.value)
                      }
                      type="text"
                      className="px-3 py-2 rounded bg-gray-200 focus:outline-none text-sm w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleOkCreate()}
              className="mt-4 px-3 py-2 rounded bg-dark-purple text-white"
            >
              Registrar
            </button>
          </div>
        </div>
      </Modal>

      <Table
        scroll={{
          x: 1000, // Habilita desplazamiento horizontal si el contenido supera 1000px
        }}
        dataSource={candidates}
        columns={columns}
        rowKey="id"
      />
    </div>
  );
};

export default Candidatos;
