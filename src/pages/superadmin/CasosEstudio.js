import React, { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthContext";
import { MdAdd } from "react-icons/md";
import {
  Button,
  Checkbox,
  DatePicker,
  Dropdown,
  Input,
  message,
  Modal,
  Select,
  Space,
} from "antd";
import LogoUpload from "../../components/LogoUpload";
import { TbAdjustments, TbCaretDownFilled } from "react-icons/tb";
import { FaEdit, FaEllipsisV, FaEye, FaTrash } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import { BsViewList } from "react-icons/bs";
import { Link, NavLink } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import axios from "axios";
import dayjs from "dayjs";
const { Option } = Select;
const { RangePicker } = DatePicker;
const CasosEstudio = () => {
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [casosEstudio, setCasosEstudio] = useState([]);
  const [filterCasosEstudio, setFilterCasosEstudio] = useState([]);
  const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [casosCreate, setCasosCreate] = useState({
    title: "",
    description: "",
    company_id: "",
    resultados: "",
    phone_contact: "",
    user_id: null,
  });

  const buscar_casos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/successcases`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });
      console.log(response);
      const data = response.data;
      console.log(data);
      if (data.status === "success") {
        setCasosEstudio(data.data);
        setFilterCasosEstudio(data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error al obtener los modulos:", error);
    }
  };
  useEffect(() => {
    buscar_casos();
  }, [auth, apiUrl]);

  const abrirModalCreate = (e) => {
    e.stopPropagation();
    setIsModalOpenCreate(true);
  };

  // ESTADOS PARA LA TABLA DINAMICA
  const [itemsPerPage, setItemsPerPage] = useState(10); //items por pagina
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCasosEstudio, setVisibleCasosEstudio] = useState([]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone_contact: "",
    website: "",
    plans: [{ tipo: "Plan basico" }],
    created_at: [null, null],
  });

  // Función para aplicar el filtro
  const detectarTotalPages = (data) => {
    if (data.length === 0) {
      setTotalPages(1);
    } else {
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    }
  };
  const applyFilters = () => {
    const regex = /^[a-zA-Z0-9\s]*$/; // Permite solo letras, números y espacios
    const bol = regex.test(searchTerm) ? searchTerm : "";
    console.log(bol);

    if (bol === "") {
      const filteredCasosEstudio = filterCasosEstudio.filter((company) => {
        const searchRegex = new RegExp(searchTerm, "i");

        const matchSearch = Object.values(company).some((value) =>
          searchRegex.test(value.toString())
        );

        return matchSearch;
      });
      const objetosOrdenados = filteredCasosEstudio.sort((a, b) =>
        dayjs(b.fecha_created).isAfter(dayjs(a.fecha_created)) ? 1 : -1
      );
      const startIndex = (currentPage - 1) * itemsPerPage;
      // setCurrentPage(1);
      const paginated = objetosOrdenados.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      setVisibleCasosEstudio(paginated);
    } else {
      setSearchTerm(bol);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFiltersChange = (changedFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...changedFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      name: "",
      email: "",
      phone_contact: "",
      website: "",
      created_at: [null, null],
    });

    setSearchTerm("");
    setCurrentPage(1);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filterCasosEstudio.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    setVisibleCasosEstudio(paginated);
  };
  // useEffect para manejar el filtrado y paginación
  useEffect(() => {
    applyFilters(); // Aplicar filtro inicialmente
  }, [filterCasosEstudio, currentPage, itemsPerPage, searchTerm]);

  const handleCreateChange = (key, value) => {
    setCasosCreate((prev) => {
      const newCase = { ...prev, [key]: value };

      return newCase;
    });
  };

  const createCasos = async (newUser) => {
    const token = auth.token;

    try {
      const response = await axios.post(`${apiUrl}/successcase`, newUser, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      return response.data; // Simplemente devuelve los datos
    } catch (error) {
      console.error("Upload error:", error);
      throw error; // Lanza el error para que pueda ser capturado en el llamado
    }
  };

  const handleOkCreate = async () => {
    setLoadingCreate(true);

    const newData = { ...casosCreate };
    try {
      const userData = await createCasos(newData);
      console.log(userData);

      message.success("Se ha creado al admin correctamente");
      if (userData.status === "success") {
        message.success("Se creo el caso con exito");
      } else {
        message.error("Ocurrio un error al crear el usuario");
        setLoadingCreate(false);
      }
    } catch (error) {
      message.error("Ocurrió un error durante la creación del cliente");
    } finally {
      setLoadingCreate(false);
    }
  };
  const handleCancelCreate = () => {
    setCasosCreate({
      name: "",
      email: "",
      logo: "",
      website: "",
      phone_contact: "",
      user_id: null,
    });
    // setLogoFileEmpresa("");
    setIsModalOpenCreate(false);
  };
  const handleEliminarBusiness = async (id) => {
    console.log(id);
    // let propiedad_id = id;
    // try {
    //   const response = await eliminar_property(propiedad_id);
    //   buscarPropiedades();
    //   message.success("Se elimino correctamente la propiedad");
    // } catch (error) {
    //   message.error("No se elimino la propiedad, hubo un error");
    // }
  };

  return (
    <div className="w-full p-6 app-container-sections">
      {/* modal create */}
      <Modal
        footer={null}
        title="Register"
        open={isModalOpenCreate}
        onOk={handleOkCreate}
        onCancel={handleCancelCreate}
      >
        <div className="relative w-full">
          {loadingCreate ? (
            <div className="bg-dark-purple z-50 text-white absolute top-0 left-0 right-0 bottom-0 w-full flex items-center justify-center">
              Loading
            </div>
          ) : null}
          <div className="w-full mb-4">
            <div className="w-full">
              <div className="w-full flex gap-4">
                <h1 className="w-full">Datos del caso de estudio</h1>
              </div>
            </div>
          </div>
          <>
            {/* <div>
              <LogoUpload
                setLogoFile={setLogoFileEmpresa}
                logo={casosCreate.logo}
                setLogo={(logo) =>
                  setCasosCreate({ ...casosCreate, logo: logo })
                }
              />
            </div> */}
            <div className="model grid grid-cols-1 gap-3 mt-4 relative my-4">
              <div>
                <label className="text-sm w-full block font-medium mb-4 ">
                  Title
                </label>
                <input
                  placeholder="Ingresa el nombre del modulo"
                  className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                  type="text"
                  value={casosCreate?.name}
                  onChange={(e) => handleCreateChange("name", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm w-full block font-medium mb-4 ">
                  Description
                </label>
                <textarea
                  placeholder="Ingresa el nombre del modulo"
                  className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                  type="text"
                  value={casosCreate?.email}
                  onChange={(e) => handleCreateChange("email", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm w-full block font-medium mb-4 ">
                  Empresa
                </label>
                <select
                  placeholder="Ingresa el nombre del modulo"
                  className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                  type="text"
                  value={casosCreate?.email}
                  onChange={(e) => handleCreateChange("email", e.target.value)}
                >
                  <option value="1">1</option>
                </select>
              </div>
              <div>
                <label className="text-sm w-full block font-medium mb-4 ">
                  Celular
                </label>
                <input
                  placeholder="Ingresa el nombre del modulo"
                  className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                  type="text"
                  value={casosCreate?.phone_contact}
                  onChange={(e) =>
                    handleCreateChange("phone_contact", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm w-full block font-medium mb-4 ">
                  Sitio Web
                </label>
                <input
                  placeholder="Ingresa el nombre del modulo"
                  className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                  type="text"
                  value={casosCreate?.website}
                  onChange={(e) =>
                    handleCreateChange("website", e.target.value)
                  }
                />
              </div>
            </div>
          </>
        </div>
      </Modal>
      <div className="horizontal-options flex items-center mb-[24px]">
        <div className="search-hook flex-grow">
          <div className="inmocms-input bg-white border rounded border-gray-300 flex text-sm h-[46px] overflow-hidden font-normal">
            <input
              className="h-full px-[12px] w-full border-0 border-none focus:outline-none"
              placeholder="Buscar casos de estudio"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="on"
            />
            <AiOutlineSearch className="h-full w-[24px] min-w-[24px] opacity-5 mx-[12px]" />
          </div>
        </div>
        <div className="horizontal-options-items ml-[28px] flex items-center">
          <button
            onClick={() => setActiveFilter(!activeFilter)}
            className="inmocms-button bg-dark-blue text-white rounded p-4"
          >
            <TbAdjustments />
          </button>
          <button
            onClick={(e) => abrirModalCreate(e)}
            className="btn-new ml-[12px] h-[46px] flex gap-2 items-center"
          >
            <MdAdd className="text-white" />
            <span className="mobile-hide">Nuevo Caso</span>
          </button>
        </div>
      </div>
      <div
        className={`${
          activeFilter ? "" : "hidden"
        } filters grid grid-cols-1 md:grid-cols-6 gap-4 bg-white py-4 px-3 mb-4`}
      >
        <Select
          className="w-full text-sm"
          value={filters.plans}
          onChange={(value) => handleFiltersChange({ plan: value })}
          placeholder="Plan"
        >
          <Option value="">Todos</Option>
          {/* Agrega opciones según tus tipos */}
          <Option value="Casa">Casa</Option>
          <Option value="Departamento">Departamento</Option>
          <Option value="Oficina">Oficina</Option>
          <Option value="Lote">Lote</Option>
        </Select>
        <div className="col-span-2">
          <RangePicker
            className="w-full text-sm"
            value={filters.created_at}
            onChange={(dates) => handleFiltersChange({ created_at: dates })}
            placeholder={["Fecha Creación Desde", "Fecha Creación Hasta"]}
          />
        </div>
        <div className="w-full flex flex-col md:flex-row">
          <button
            className="p-3 rounded bg-white text-light-font text-xs"
            onClick={() => handleClearFilters()}
          >
            Limpiar
          </button>
          <button
            className="p-3 rounded bg-dark-purple text-white text-xs"
            onClick={() => applyFilters()}
          >
            Buscar
          </button>
        </div>
      </div>
      <div className="box-table">
        <table
          className="inmocms-table"
          cellPadding="0"
          cellSpacing="0"
          border="0"
        >
          <thead>
            <tr>
              <td align="center">Logo</td>
              <td>Name </td>
              <td>Admin </td>
              <td>Plan </td>
              <td>Estado </td>
              <td>Renovacion </td>
              <td className="ajustes-tabla-celda">Acciones</td>
            </tr>
          </thead>
          <tbody>
            {visibleCasosEstudio.length > 0 &&
              visibleCasosEstudio.map((item, index) => {
                return (
                  <tr className="" key={index}>
                    <td>
                      <div
                        className="w-8 h-8 object-contain"
                        style={{
                          backgroundImage: `url('${item.logo}')`,
                          backgroundPosition: "center",
                          backgroundSize: "contain",
                        }}
                      ></div>
                    </td>
                    <td>{item.name}</td>
                    <td>
                      <b>{item.admin.name}</b> <br /> {item.admin.email}
                    </td>
                    <td>
                      {item.admin.subscriptions[0].plan.name} <br />{" "}
                      {item.admin.subscriptions[0].plan.price}
                    </td>
                    <td>{item.admin.subscriptions[0].status}</td>
                    <td>
                      {dayjs(item.admin.subscriptions[0].endDate)
                        .locale("es")
                        .format("DD [de] MMMM [del] YYYY")}
                    </td>

                    <td className="ajustes-tabla-celda">
                      <div className="ajustes-tabla-celda-item px-4">
                        <Dropdown
                          className="text-sm text-gray-500"
                          placement="bottomRight"
                          menu={{
                            items: [
                              {
                                label: (
                                  <Link
                                    to={`/companies/edit/${item.id}`}
                                    className="pr-6 rounded flex items-center gap-2 text-sm text-gray-500"
                                  >
                                    <FaEdit /> Editar info
                                  </Link>
                                ),
                                key: 1,
                              },
                              {
                                label: (
                                  <button
                                    onClick={() => {
                                      Modal.confirm({
                                        title:
                                          "¿Está seguro de eliminar la propiedad?",
                                        content:
                                          "Al eliminar la propiedad, se eliminarán los datos relacionados con la propiedad como: modelos, unidades y contenido multimedia",
                                        onOk: () =>
                                          handleEliminarBusiness(item.id),
                                        okText: "Eliminar",
                                        cancelText: "Cancelar",
                                      });
                                    }}
                                    className="w-full rounded flex items-center gap-2 text-sm text-red-500"
                                  >
                                    <FaTrash /> Eliminar
                                  </button>
                                ),
                                key: 2,
                              },
                              {
                                label: (
                                  <Link
                                    to={`/property/${item.id}/models`}
                                    className="pr-6 rounded flex items-center gap-2 text-sm text-gray-500 "
                                  >
                                    <BsViewList /> Ver Modelos
                                  </Link>
                                ),
                                key: 3,
                              },
                              {
                                label: (
                                  <Link
                                    to={`/property/${item.id}/multimedia`}
                                    className="pr-6 rounded flex items-center gap-2 text-sm text-gray-500 "
                                  >
                                    <FiImage /> Multimedia
                                  </Link>
                                ),
                                key: 4,
                              },
                            ],
                          }}
                          trigger={["click"]}
                        >
                          <div
                            className="text-xs w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all duration-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Space>
                              <FaEllipsisV />
                            </Space>
                          </div>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div className="table-controls">
        <div className="page">
          <div className="txt">
            Página {currentPage} de {totalPages}
          </div>
          <div style={{ marginBottom: "12px", marginRight: "24px" }}>
            <Select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e));
                setCurrentPage(1); // Reset page to 1 on items per page change
              }}
              // style={{
              //   width: 120,
              // }}
              // dropdownMatchSelectWidth={false}
              placement={"topLeft"}
              options={[
                {
                  value: "1",
                  label: "1",
                },
                {
                  value: "10",
                  label: "10",
                },
                {
                  value: "25",
                  label: "25",
                },
                {
                  value: "50",
                  label: "50",
                },
                {
                  value: "100",
                  label: "100",
                },
                {
                  value: "500",
                  label: "500",
                },
              ]}
            />
          </div>
        </div>
        <div className="pagination-controls flex gap-2 items-center">
          <button
            className={`p-3 text-xs rounded ${
              currentPage === 1
                ? "bg-light-purple text-dark-purple"
                : "bg-dark-purple text-white"
            }  `}
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            1
          </button>
          <button
            className={`p-3 text-xs rounded ${
              currentPage === 1
                ? "bg-light-purple text-dark-purple"
                : "bg-dark-purple text-white"
            }  `}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>
          <button className="p-3 rounded bg-dark-purple text-white text-xs">
            {currentPage}
          </button>
          <button
            className={`p-3 text-xs rounded ${
              currentPage === totalPages
                ? "bg-light-purple text-dark-purple"
                : "bg-dark-purple text-white"
            }  `}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            {">"}
          </button>
          <button
            className={`p-3 text-xs rounded ${
              currentPage === totalPages
                ? "bg-light-purple text-dark-purple"
                : "bg-dark-purple text-white"
            }  `}
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            {totalPages}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CasosEstudio;
