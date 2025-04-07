import React, { useEffect, useState } from "react";
import {
  Checkbox,
  Dropdown,
  Modal,
  Select,
  Space,
  DatePicker,
  message,
} from "antd";
import LogoUpload from "../../components/LogoUpload";
import { TbAdjustments, TbCaretDownFilled } from "react-icons/tb";
import { FaEdit, FaEllipsisV, FaEye, FaTrash } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import { BsViewList } from "react-icons/bs";
import { Link, NavLink } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import dayjs from "dayjs";
import { useAuth } from "../../components/AuthContext";
import axios from "axios";
import { MdAdd } from "react-icons/md";
const { Option } = Select;
const { RangePicker } = DatePicker;

const Prospects = () => {
  const { auth } = useAuth();
  const items = [
    {
      key: "1",
      label: (
        <p
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.antgroup.com"
        >
          Editar
        </p>
      ),
    },
  ];
  // steps formulario
  const [nowStep, setNowStep] = useState(1);
  const handleNextSteps = () => {
    setNowStep(nowStep + 1);
  };
  const handlePrevSteps = () => {
    setNowStep(nowStep - 1);
  };
  const [prospects, setProspects] = useState([]);
  const [filterProspects, setFilterProspects] = useState([]);
  const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [selectProspects, setSelectProspects] = useState(null);
  const [prospectCreate, setProspectCreate] = useState({
    first_name: "",
    last_name: "",
    email: "",
    whatsapp: "",
    status: "creado",
  });
  const apiUrl = process.env.REACT_APP_API_URL;

  const abrirModalCreate = (e) => {
    e.stopPropagation();
    setIsModalOpenCreate(true);
  };
  const buscar_prospects = async () => {
    try {
      const response = await axios.get(`${apiUrl}/prospects`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });
      console.log(response);
      const data = response.data;
      console.log(data);
      if (data.status === "success") {
        setProspects(data.data);
        setFilterProspects(data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error al obtener los modulos:", error);
    }
  };
  useEffect(() => {
    buscar_prospects();
  }, [auth, apiUrl]);

  // ESTADOS PARA LA TABLA DINAMICA
  const [itemsPerPage, setItemsPerPage] = useState(10); //items por pagina
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleProspects, setVisibleProspects] = useState([]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [filters, setFilters] = useState({
    first_name: "",
    last_name: "",
    email: "",
    whatsapp: "",
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
    const bol = regex.test(searchTerm) ? true : false;

    console.log(bol);
    if (bol && filterProspects.length > 0) {
      console.log(filterProspects);
      const filteredBusiness = filterProspects.filter((prospect) => {
        const searchRegex = new RegExp(searchTerm, "i");

        const matchSearch = Object.values(prospect).some((value) =>
          searchRegex.test(value.toString())
        );

        const matchFilters =
          (!filters.firstName || prospect.firstName === filters.firstName) &&
          // (!filters.lastName || prospect.lastName === filters.lastName) &&
          (!filters.email || prospect.lastName === filters.email) &&
          (!filters.whatsapp || prospect.lastName === filters.whatsapp) &&
          (!filters.created_at[0] ||
            ((dayjs(prospect.created_at).isAfter(
              filters.created_at[0],
              "day"
            ) ||
              dayjs(prospect.created_at).isSame(
                filters.created_at[0],
                "day"
              )) &&
              (dayjs(prospect.created_at).isBefore(
                filters.created_at[1],
                "day"
              ) ||
                dayjs(prospect.created_at).isSame(
                  filters.created_at[1],
                  "day"
                ))));

        return matchSearch && matchFilters;
      });
      console.log(filteredBusiness);
      detectarTotalPages(filteredBusiness);
      const objetosOrdenados = filteredBusiness.sort((a, b) =>
        dayjs(b.fecha_created).isAfter(dayjs(a.fecha_created)) ? 1 : -1
      );
      const startIndex = (currentPage - 1) * itemsPerPage;
      // setCurrentPage(1);
      const paginated = objetosOrdenados.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      setVisibleProspects(paginated);
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
    detectarTotalPages(filterProspects);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filterProspects.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    setVisibleProspects(paginated);
  };
  // useEffect para manejar el filtrado y paginación
  useEffect(() => {
    applyFilters(); // Aplicar filtro inicialmente
  }, [filterProspects, currentPage, itemsPerPage, searchTerm]);
  const verifyStatus = (status) => {
    switch (status) {
      case "creado":
        return (
          <div className="max-w-max px-3 py-2 text-sm font-bold rounded-full bg-green-600 text-white inline-bloc text-nowrap">
            Creado
          </div>
        );
        break;
      case "register_chat":
        return (
          <div className="max-w-max px-3 py-2 text-sm font-bold rounded-full bg-green-600 text-white inline-bloc text-nowrap">
            RegistradoChat
          </div>
        );
        break;
    }
  };

  const handleCreateChange = (key, value) => {
    setProspectCreate((prev) => {
      const newProspect = { ...prev, [key]: value };

      return newProspect;
    });
  };

  const createProspect = async (newUser) => {
    const token = auth.token;

    try {
      const response = await axios.post(`${apiUrl}/prospects`, newUser, {
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

    const newProspect = { ...prospectCreate };
    try {
      const userData = await createProspect(newProspect);
      console.log(userData);

      if (userData.status === "success") {
        message.success("Se creo correctamente al prospecto");
        await buscar_prospects();
        handleCancelCreate();
      } else {
        message.error("Ocurrio un error al crear al prospecto");
        setLoadingCreate(false);
      }
    } catch (error) {
      message.error("Ocurrió un error durante la creación del prospecto");
    } finally {
      setLoadingCreate(false);
    }
  };
  const handleCancelCreate = () => {
    setProspectCreate({
      first_name: "",
      last_name: "",
      email: "",
      whatsapp: "",
    });
    setIsModalOpenCreate(false);
  };
  const handleEliminarProspects = async (id) => {
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
        // onOk={handleOkCreate}
        onCancel={() => setIsModalOpenCreate(false)} // Cierra el modal al hacer clic en la "X"
      >
        <div className="relative w-full">
          {loadingCreate ? (
            <div className="bg-dark-purple z-50 text-white absolute top-0 left-0 right-0 bottom-0 w-full flex items-center justify-center">
              Loading
            </div>
          ) : null}
          <div className="w-full">
            <div className="grid grid-cols-1 gap-4">
              <div className="">
                <label htmlFor="" className="w-full">
                  Nombres
                </label>
                <input
                  className="w-full px-3 py-2 rounded bg-gray-100 text-sm"
                  type="text"
                  onChange={(e) =>
                    handleCreateChange("first_name", e.target.value)
                  }
                />
              </div>
              <div className="">
                <label htmlFor="" className="w-full">
                  Apellidos
                </label>
                <input
                  className="w-full px-3 py-2 rounded bg-gray-100 text-sm"
                  type="text"
                  onChange={(e) =>
                    handleCreateChange("last_name", e.target.value)
                  }
                />
              </div>
              <div className="">
                <label htmlFor="" className="w-full">
                  Email
                </label>
                <input
                  className="w-full px-3 py-2 rounded bg-gray-100 text-sm"
                  type="text"
                  onChange={(e) => handleCreateChange("email", e.target.value)}
                />
              </div>
              <div className="">
                <label htmlFor="" className="w-full">
                  Whatsapp
                </label>
                <input
                  className="w-full px-3 py-2 rounded bg-gray-100 text-sm"
                  type="text"
                  onChange={(e) =>
                    handleCreateChange("whatsapp", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="footerForm mt-4">
              <button
                className="px-3 py-2 bg-dark-purple text-white rounded"
                onClick={() => handleOkCreate()}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <div className="horizontal-options flex items-center mb-[24px]">
        <div className="search-hook flex-grow">
          <div className="inmocms-input bg-white border rounded border-gray-300 flex text-sm h-[46px] overflow-hidden font-normal">
            <input
              className="h-full px-[12px] w-full border-0 border-none focus:outline-none"
              placeholder="Buscar prospectos"
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
            <span className="mobile-hide">Nuevo Prospecto</span>
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
              <td>Nombres </td>
              <td>email </td>
              <td>Whatsapp </td>
              <td>Fecha creación</td>
              <td>Estado</td>
              <td className="ajustes-tabla-celda">Acciones</td>
            </tr>
          </thead>
          <tbody>
            {visibleProspects.length > 0 &&
              visibleProspects.map((item, index) => {
                return (
                  <tr className="" key={index}>
                    <td>
                      <b>{item.firstName + " " + item.lastName || "N/A"}</b>
                    </td>
                    <td>{item.email}</td>
                    <td>{item.whatsapp}</td>
                    <td>
                      {dayjs(item.createdAt)
                        .locale("es")
                        .format("DD MMMM YYYY HH:mm:ss")}
                    </td>
                    <td>{verifyStatus(item.status)}</td>
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
                                    to={`/prospects/edit/${item.id}`}
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
                                          "¿Está seguro de eliminar al prospecto?",
                                        content:
                                          "Al eliminar el prospecto, se eliminarán los datos relacionados como: respuestas de prefuntas",
                                        onOk: () =>
                                          handleEliminarProspects(item.id),
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

export default Prospects;
