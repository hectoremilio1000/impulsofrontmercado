import { Button, Dropdown, message, Modal, Select, Space } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FaEdit, FaEllipsisV, FaTrash } from "react-icons/fa";
import { MdAdd, MdApps } from "react-icons/md";
import { useAuth } from "../../../components/AuthContext";
import { TbAdjustments, TbCaretDownFilled } from "react-icons/tb";
import { AiOutlineSearch } from "react-icons/ai";

const Modules = () => {
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
  const { auth } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  // creacion de modulos estados
  const [modulos, setModulos] = useState([]);
  const [moduloCreate, setModuloCreate] = useState();
  const [filterModulos, setFilterModulos] = useState([]);
  const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
  const [loadingCreateModulo, setLoadingCreateModulo] = useState(false);

  // edicion de modulos estados
  const [moduloEdit, setModuloEdit] = useState(null);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [loadingEditModulo, setLoadingEditModulo] = useState(false);

  // ESTADOS TABLA DINAMICA
  const [selectsProperties, setSelectsProperties] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10); // items por pagina
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ESTADOS DE FILTRO PARA TABLA DINAMICA
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleModulos, setVisibleModulos] = useState([]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    description: "",
  });

  // EVENTOS DE SELECCION DE REGISTROS
  const handleSelect = (e, id) => {
    e.stopPropagation();
    setSelectsProperties((prevSelects) => {
      if (prevSelects.includes(id)) {
        return prevSelects.filter((p) => p !== id);
      } else {
        return [...prevSelects, id];
      }
    });
  };

  const handleCheckSelect = (e, id) => {
    e.stopPropagation();
    let active = e.target.checked;
    if (active) {
      setSelectsProperties((prevSelects) => [...prevSelects, id]);
    } else {
      setSelectsProperties((prevSelects) =>
        prevSelects.filter((p) => p !== id)
      );
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const visiblePropertyIds = visibleModulos.map((propiedad) => propiedad.id);

    if (isChecked) {
      setSelectsProperties((prevSelects) => [
        ...new Set([...prevSelects, ...visiblePropertyIds]),
      ]);
    } else {
      setSelectsProperties((prevSelects) =>
        prevSelects.filter((id) => !visiblePropertyIds.includes(id))
      );
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Función para aplicar el filtro
  const detectarTotalPages = (data) => {
    if (data.length === 0) {
      setTotalPages(1);
    } else {
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    }
  };

  // EVENTOS DE FILTROS DE REGISTROS
  const handleFiltersChange = (changedFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...changedFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      tipo: "",
      precioRange: [0, Infinity],
      pais: "",
      region: "",
      provincia: "",
      distrito: "",
      fechaCreatedRange: [null, null],
      fechaEntregaRange: [null, null],
    });

    setSearchTerm("");
    setCurrentPage(1);
    detectarTotalPages(filterModulos);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsuarios = filterModulos.slice(
      startIndex,
      startIndex + itemsPerPage
    );
    setVisibleModulos(paginatedUsuarios);
  };

  const applyFilters = () => {
    const regex = /^[a-zA-Z0-9\s]*$/; // Permite solo letras, números y espacios
    const bol = regex.test(searchTerm) ? true : false;

    if (bol && filterModulos.length > 0) {
      const filteredUsuarios = filterModulos.filter((modulo) => {
        const searchRegex = new RegExp(searchTerm, "i");
        const matchSearch = Object.values(modulo).some((value) =>
          searchRegex.test(value)
        );
        return matchSearch;
      });

      // Aquí ordenamos por ID ascendente en lugar de la fecha:
      const objetosOrdenados = filteredUsuarios.sort((a, b) => a.id - b.id);

      detectarTotalPages(objetosOrdenados);

      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedUsuarios = objetosOrdenados.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      setVisibleModulos(paginatedUsuarios);
    } else {
      setSearchTerm("");
    }
  };

  useEffect(() => {
    applyFilters(); // Aplicar filtro inicialmente
  }, [filterModulos, currentPage, itemsPerPage, searchTerm]);

  // EVENTOS DE BUSQUEDA DE DATOS
  const buscarModulos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/modules`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });
      console.log(response);
      if (response.data.status === "success") {
        setModulos(response.data.data);
        setFilterModulos(response.data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error al obtener los modulos:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    buscarModulos();
  }, [0]);

  // EVENTOS DE CREACION DE MODULOS
  const createModulo = async (newModulo) => {
    const token = auth.token;
    try {
      const response = await axios.post(`${apiUrl}/modules`, newModulo, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleOkCreate = async () => {
    if (moduloCreate.name !== "" && moduloCreate.description !== "") {
      setLoadingCreateModulo(true);
      const newModulo = { ...moduloCreate };
      try {
        const userData = await createModulo(newModulo);
        console.log(userData);
        if (userData.status === "success") {
          setModuloCreate({
            name: "",
            description: "",
          });
          setIsModalOpenCreate(false);
          await buscarModulos();
          setLoadingCreateModulo(false);
        } else {
          message.error(
            "Ocurrio un error al crear el modelo, intentelo mas tarde"
          );
          setLoadingCreateModulo(false);
        }
      } catch (error) {
        message.error("Ocurrió un error durante la creación del módulo");
      } finally {
        setLoadingCreateModulo(false);
      }
    } else {
      message.warning("Debe llenar todos los campos");
      setLoadingCreateModulo(false);
    }
  };

  const handleCancelCreate = () => {
    setModuloCreate({
      name: "",
      description: "",
    });
    setIsModalOpenCreate(false);
  };

  const abrirModalCreate = (e) => {
    e.stopPropagation();
    setIsModalOpenCreate(true);
  };

  const handleUsuarioChangeCreate = (key, value) => {
    setModuloCreate((prev) => {
      const newModelo = { ...prev, [key]: value };
      return newModelo;
    });
  };

  // EVENTOS DE ELIMINACION DE MODULOS
  const deleteModule = (id) => {
    return new Promise(async (resolve, reject) => {
      const response = await axios.delete(`${apiUrl}/modules/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      console.log(response);
      resolve(response.data);
    });
  };

  const handleDeleteModule = async (id) => {
    try {
      const response = await deleteModule(id);
      await buscarModulos();
      message.success("Se elimino correctamente la propiedad");
    } catch (error) {
      message.error("No se elimino la propiedad, hubo un error");
    }
  };

  // EVENTOS DE EDICION DE MODULOS
  const updateModulo = async (newModulo) => {
    const token = auth.token;
    try {
      const response = await axios.put(
        `${apiUrl}/modules/${newModulo.id}`,
        newModulo,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const abrirModalEdit = (e, id) => {
    e.stopPropagation();
    const moduloSearch = modulos.find((m) => m.id === id);
    setModuloEdit(moduloSearch);
    setIsModalOpenEdit(true);
  };

  const handleOkEdit = async () => {
    if (moduloEdit.name !== "" && moduloEdit.description !== "") {
      setLoadingEditModulo(true);
      const newModulo = { ...moduloEdit };
      try {
        const userData = await updateModulo(newModulo);
        console.log(userData);
        if (userData.status === "success") {
          setModuloEdit(null);
          setIsModalOpenEdit(false);
          await buscarModulos();
          setLoadingEditModulo(false);
        } else {
          message.error(
            "Ocurrio un error al crear el modelo, intentelo mas tarde"
          );
          setLoadingEditModulo(false);
        }
      } catch (error) {
        message.error("Ocurrió un error durante la creación del módulo");
      } finally {
        setLoadingEditModulo(false);
      }
    } else {
      message.warning("Debe llenar todos los campos");
      setLoadingEditModulo(false);
    }
  };

  const handleCancelEdit = () => {
    setModuloEdit(null);
    setIsModalOpenEdit(false);
  };

  const handleUsuarioChangeEdit = (key, value) => {
    setModuloEdit((prev) => {
      const newModulo = { ...prev, [key]: value };
      return newModulo;
    });
  };

  return (
    <div className="w-full p-6 app-container-sections">
      <div
        className="mb-[32px] flex items-center justify-between py-4 pr-4"
        style={{ background: "linear-gradient(90deg,#fff0,#fff)" }}
      >
        <div className="data">
          <div className="title font-bold text-xl text-bold-font">Modulos</div>
          <div className="subtitle max-w-[30vw] text-xs font-normal text-light-font">
            Lista de modulos
          </div>
        </div>
        <div className="options bg-gray-50 p-4">
          <div className="page-top-card flex items-center gap-3">
            <div className="icon bg-light-purple p-4 rounded text-dark-purple">
              <MdApps />
            </div>
            <div>
              <div className="value font-bold text-bold-font text-xl">
                {modulos.length}
              </div>
              <div className="text-sm font-normal text-light-font">
                Total modulos
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="horizontal-options flex items-center mb-[24px]">
        <div className="search-hook flex-grow">
          <div className="inmocms-input bg-white border rounded border-gray-300 flex text-sm h-[46px] overflow-hidden font-normal">
            <input
              className="h-full px-[12px] w-full border-0 border-none focus:outline-none"
              placeholder="Buscar modeulos por nombre o descripcion"
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
            <span className="mobile-hide">Nuevo Modulo</span>
          </button>
        </div>
      </div>

      {/* modal create */}
      <Modal
        footer={null}
        title="Crear Modulo"
        open={isModalOpenCreate}
        onOk={handleOkCreate}
        onCancel={handleCancelCreate}
      >
        <div className="relative w-full">
          {loadingCreateModulo ? (
            <div className="bg-dark-purple z-50 text-white absolute top-0 left-0 right-0 bottom-0 w-full flex items-center justify-center">
              Loading
            </div>
          ) : null}

          <div className="model grid grid-cols-1 gap-3 mt-4 relative">
            <div>
              <label className="text-sm w-full block font-medium mb-4 ">
                Name
              </label>
              <input
                placeholder="Ingresa el nombre del modulo"
                className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                type="text"
                value={moduloCreate?.name}
                onChange={(e) =>
                  handleUsuarioChangeCreate("name", e.target.value)
                }
              />
            </div>
            <div>
              <label className="text-sm w-full block font-medium mb-4 ">
                Description
              </label>
              <input
                placeholder="descripcion de ejemplo..."
                className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                type="text"
                value={moduloCreate?.description}
                onChange={(e) =>
                  handleUsuarioChangeCreate("description", e.target.value)
                }
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => handleOkCreate()}
              className="bg-dark-purple text-white p-3 rounded"
            >
              Crear Module
            </button>
          </div>
        </div>
      </Modal>

      {/* modal edit */}
      <Modal
        footer={null}
        title="Update Modulo"
        open={isModalOpenEdit}
        onOk={handleOkEdit}
        onCancel={handleCancelEdit}
      >
        <div className="relative w-full">
          {loadingEditModulo ? (
            <div className="bg-dark-purple z-50 text-white absolute top-0 left-0 right-0 bottom-0 w-full flex items-center justify-center">
              Loading
            </div>
          ) : null}

          <div className="model grid grid-cols-1 gap-3 mt-4 relative">
            <div>
              <label className="text-sm w-full block font-medium mb-4 ">
                Name
              </label>
              <input
                placeholder="Ingresa el nombre del modulo"
                className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                type="text"
                value={moduloEdit?.name}
                onChange={(e) =>
                  handleUsuarioChangeEdit("name", e.target.value)
                }
              />
            </div>
            <div>
              <label className="text-sm w-full block font-medium mb-4 ">
                Description
              </label>
              <input
                placeholder="descripcion de ejemplo..."
                className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                type="text"
                value={moduloEdit?.description}
                onChange={(e) =>
                  handleUsuarioChangeEdit("description", e.target.value)
                }
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => handleOkEdit()}
              className="bg-dark-purple text-white p-3 rounded"
            >
              Update Module
            </button>
          </div>
        </div>
      </Modal>

      <div
        className={`${
          activeFilter ? "" : "hidden"
        } filters grid grid-cols-1 md:grid-cols-6 gap-4 bg-white py-4 px-3 mb-4`}
      >
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
              {/* <td className="check-field">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={visibleModulos.every((propiedad) =>
                    selectsProperties.includes(propiedad.id)
                  )}
                />
              </td> */}
              {/* Aquí cambiamos "Fecha Creacion" por "ID" */}
              <td>ID</td>
              <td>Nombres</td>
              <td>Description</td>
              <td className="ajustes-tabla-celda"></td>
            </tr>
          </thead>
          <tbody>
            {visibleModulos.length > 0 &&
              visibleModulos.map((modulo, index) => {
                return (
                  <tr
                    className=""
                    key={index}
                    onClick={(e) => handleSelect(e, modulo.id)}
                  >
                    {/* <td className="check-field">
                      <input
                        type="checkbox"
                        value={modulo.id || ""}
                        onClick={(e) => handleCheckSelect(e, modulo.id)}
                        checked={selectsProperties.includes(modulo.id)}
                      />
                    </td> */}
                    {/* En vez de la fecha, mostramos directamente el ID */}
                    <td>
                      <div className="flex flex-col align-center font-bold text-bold-font">
                        {modulo.id}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col align-center">
                        {modulo.name}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col align-center">
                        {modulo.description}
                      </div>
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
                                  <div
                                    onClick={(e) =>
                                      abrirModalEdit(e, modulo.id)
                                    }
                                    className="pr-6 rounded flex items-center gap-2 text-sm text-gray-500"
                                  >
                                    <FaEdit /> Editar info
                                  </div>
                                ),
                                key: 1,
                              },
                              {
                                label: (
                                  <button
                                    onClick={() => {
                                      Modal.confirm({
                                        title:
                                          "¿Está seguro de eliminar este modulo?",
                                        content:
                                          "Al eliminar el modulo, se eliminarán los datos relacionados con el módulo como planes y suscripciones de usuarios.",
                                        onOk: () =>
                                          handleDeleteModule(modulo.id),
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
          <div className="disabled" style={{ marginBottom: "12px" }}>
            <Dropdown
              menu={{ items }}
              placement="bottomLeft"
              trigger={["click"]}
              disabled={selectsProperties.length > 0 ? false : true}
            >
              <Button>
                Editar selección <TbCaretDownFilled />
              </Button>
            </Dropdown>
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

export default Modules;
