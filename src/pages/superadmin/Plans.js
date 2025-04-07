import React, { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { MdAdd, MdApps } from "react-icons/md";
import { TbAdjustments, TbCaretDownFilled } from "react-icons/tb";
import { useAuth } from "../../components/AuthContext";
import axios from "axios";
import {
  Button,
  Checkbox,
  Dropdown,
  message,
  Modal,
  Select,
  Space,
} from "antd";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { FaEdit, FaEllipsisV, FaTrash } from "react-icons/fa";

const Plans = () => {
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
  const apiUrl = process.env.REACT_APP_API_URL;

  // seleccion de modulos estados
  const [modulos, setModulos] = useState([]);
  const [selectModules, setSelectModules] = useState([]);
  // Maneja la selección de módulos
  const handleSelectModules = (id, e) => {
    e.stopPropagation();
    console.log(id);
    setSelectModules((prevSelected) => {
      if (prevSelected.includes(id)) {
        // Si ya está seleccionado, lo eliminamos
        return prevSelected.filter((moduloId) => moduloId !== id);
      } else {
        // Si no está seleccionado, lo agregamos
        return [...prevSelected, id];
      }
    });
  };
  const [modulesInitEdit, setModulesInitEdit] = useState([]); // Módulos iniciales cargados
  const [addModules, setAddModules] = useState([]); // Módulos a agregar
  const [removeModules, setRemoveModules] = useState([]); // Módulos a eliminar

  const handleSelectModulesEdit = (moduleId, e) => {
    e.stopPropagation(); // Evitar conflictos de eventos

    setPlanEdit((prevPlanEdit) => {
      const isSelected = prevPlanEdit.modules.some(
        (module) => module.id === moduleId
      );
      const module = modulos.find((module) => module.id === moduleId); // Buscar el módulo

      if (isSelected) {
        // Si está seleccionado y lo deseleccionamos
        // Verificar si estaba inicialmente cargado
        if (modulesInitEdit.some((mod) => mod.id === moduleId)) {
          // Si estaba en `modulesInitEdit`, agregarlo a `removeModules`
          setRemoveModules((prevRemove) =>
            prevRemove.some((mod) => mod.id === moduleId)
              ? prevRemove
              : [...prevRemove, module]
          );
        } else {
          // Si no estaba inicialmente, eliminarlo de `addModules`
          setAddModules((prevAdd) =>
            prevAdd.filter((mod) => mod.id !== moduleId)
          );
        }
      } else {
        // Si no está seleccionado y lo seleccionamos
        // Verificar si estaba inicialmente cargado
        if (modulesInitEdit.some((mod) => mod.id === moduleId)) {
          // Si estaba en `modulesInitEdit`, eliminarlo de `removeModules`
          setRemoveModules((prevRemove) =>
            prevRemove.filter((mod) => mod.id !== moduleId)
          );
        } else {
          // Si no estaba inicialmente, agregarlo a `addModules`
          setAddModules((prevAdd) =>
            prevAdd.some((mod) => mod.id === moduleId)
              ? prevAdd
              : [...prevAdd, module]
          );
        }
      }

      // Actualizar los módulos seleccionados en `planEdit.modules`
      const updatedModules = isSelected
        ? prevPlanEdit.modules.filter((module) => module.id !== moduleId) // Remover módulo
        : [...prevPlanEdit.modules, module]; // Agregar módulo

      return {
        ...prevPlanEdit,
        modules: updatedModules,
      };
    });
  };

  // creacion de planes estados
  const [plans, setPlans] = useState([]);
  const [planCreate, setPlanCreate] = useState(null);
  const [filterPlans, setFilterPlans] = useState([]);
  const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
  const [loadingCreatePlan, setLoadingCreatePlan] = useState(false);
  // update de planes estados
  const [planEdit, setPlanEdit] = useState(null);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [loadingEditPlan, setLoadingEditPlan] = useState(false);

  // ESTADOS TABLA DINAMICA
  const [selectPlans, setSelectPlans] = useState([]);
  const [selectsProperties, setSelectsProperties] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10); //items por pagina
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ESTADOS DE FILTRO PARA TABLA DINAMICA
  const [searchTerm, setSearchTerm] = useState("");
  const [visiblePlans, setVisiblePlans] = useState([]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    description: "",
    precioRange: [0, Infinity],
  });

  // EVENTOS DE SELECCION DE REGISTROS
  const handleSelect = (e, id) => {
    e.stopPropagation();
    setSelectPlans((prevSelects) => {
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
    const visiblePropertyIds = visiblePlans.map((propiedad) => propiedad.id);

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
      name: "",
      description: "",
      precioRange: [0, Infinity],
    });

    setSearchTerm("");
    setCurrentPage(1);
    detectarTotalPages(filterPlans);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPlans = filterPlans.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    visiblePlans(paginatedPlans);
  };
  const applyFilters = () => {
    const regex = /^[a-zA-Z0-9\s]*$/; // Permite solo letras, números y espacios
    const bol = regex.test(searchTerm) ? true : false;

    if (bol && filterPlans.length > 0) {
      const filteredUsuarios = filterPlans.filter((modulo) => {
        const searchRegex = new RegExp(searchTerm, "i");

        const matchSearch = Object.values(modulo).some((value) =>
          searchRegex.test(value.toString())
        );

        // const matchFilters =
        //   !filters.fechaCreatedRange[0] ||
        //   ((dayjs(plan.fecha_created).isAfter(
        //     filters.fechaCreatedRange[0],
        //     "day"
        //   ) ||
        //     dayjs(plan.fecha_created).isSame(
        //       filters.fechaCreatedRange[0],
        //       "day"
        //     )) &&
        //     (dayjs(plan.fecha_created).isBefore(
        //       filters.fechaCreatedRange[1],
        //       "day"
        //     ) ||
        //       dayjs(plan.fecha_created).isSame(
        //         filters.fechaCreatedRange[1],
        //         "day"
        //       )));

        // return matchSearch && matchFilters;
        return matchSearch;
      });
      detectarTotalPages(filteredUsuarios);
      const objetosOrdenados = filteredUsuarios.sort((a, b) =>
        dayjs(b.fecha_created).isAfter(dayjs(a.fecha_created)) ? 1 : -1
      );
      const startIndex = (currentPage - 1) * itemsPerPage;
      // setCurrentPage(1);
      const paginatedUsuarios = objetosOrdenados.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      setVisiblePlans(paginatedUsuarios);
    } else {
      setSearchTerm("");
    }
  };
  useEffect(() => {
    applyFilters(); // Aplicar filtro inicialmente
  }, [filterPlans, currentPage, itemsPerPage, searchTerm]);

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
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error al obtener los modulos:", error);
    }
  };
  useEffect(() => {
    buscarModulos();
  }, [0]);
  const buscarPlans = async () => {
    try {
      const response = await axios.get(`${apiUrl}/plans`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });
      console.log(response);
      if (response.data.status === "success") {
        setPlans(response.data.data);
        setFilterPlans(response.data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error al obtener los planes:", error);
    }
  };
  useEffect(() => {
    // eslint-disable-next-line
    buscarPlans();
  }, [0]);

  // EVENTOS DE CREACION DE PLANES
  const createPlan = async (newPlan) => {
    const token = auth.token;

    try {
      const response = await axios.post(`${apiUrl}/plans`, newPlan, {
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
    if (planCreate.name !== "" && planCreate.description !== "") {
      setLoadingCreatePlan(true);
      const newPlan = { ...planCreate, modules: selectModules };
      console.log(newPlan);

      try {
        const userData = await createPlan(newPlan);
        console.log(userData);
        if (userData.status === "success") {
          setPlanCreate({
            name: "",
            description: "",
            price: "",
          });
          setSelectModules([]);
          setIsModalOpenCreate(false);
          await buscarPlans();
          setLoadingCreatePlan(false);
        } else {
          message.error(
            "Ocurrio un error al crear el modelo, intentelo mas tarde"
          );
          setLoadingCreatePlan(false);
        }
      } catch (error) {
        message.error("Ocurrió un error durante la creación del plan");
      } finally {
        setLoadingCreatePlan(false);
      }
    } else {
      message.warning("Debe llenar todos los campos");
      setLoadingCreatePlan(false);
    }
  };
  const handleCancelCreate = () => {
    setPlanCreate({
      name: "",
      description: "",
      price: "",
    });
    setSelectModules([]);
    setIsModalOpenCreate(false);
  };
  const eliminar_property = (modulo_id) => {
    return new Promise(async (resolve, reject) => {
      const response = await axios.delete(`${apiUrl}/module/${modulo_id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      console.log(response);
      resolve(response.data);
    });
  };
  const handleEliminarProperty = async (id) => {
    console.log(id);
    let propiedad_id = id;
    try {
      const response = await eliminar_property(propiedad_id);
      buscarModulos();
      message.success("Se elimino correctamente la propiedad");
    } catch (error) {
      message.error("No se elimino la propiedad, hubo un error");
    }
  };
  const abrirModalCreate = (e) => {
    e.stopPropagation();

    setIsModalOpenCreate(true);
  };
  const handleChangePlanCreate = (key, value) => {
    setPlanCreate((prev) => {
      const newModelo = { ...prev, [key]: value };

      return newModelo;
    });
  };
  // EVENTOS DE EDIT DE PLANES
  const editPlan = async (newPlan) => {
    const token = auth.token;

    try {
      const response = await axios.put(
        `${apiUrl}/plans/${newPlan.id}`,
        newPlan,
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
  const handleOkEdit = async () => {
    if (planEdit.name !== "" && planEdit.description !== "") {
      setLoadingEditPlan(true);
      const newPlan = {
        ...planEdit,
        addModules: addModules,
        removeModules: removeModules,
      };
      console.log(newPlan);

      try {
        const userData = await editPlan(newPlan);
        console.log(userData);
        if (userData.status === "success") {
          setPlanEdit(null);
          setModulesInitEdit([]);
          setAddModules([]);
          setRemoveModules([]);
          setIsModalOpenEdit(false);
          await buscarPlans();
          setLoadingEditPlan(false);
        } else {
          message.error(
            "Ocurrio un error al crear el modelo, intentelo mas tarde"
          );
          setLoadingCreatePlan(false);
        }
      } catch (error) {
        message.error("Ocurrió un error durante la creación del plan");
      } finally {
        setLoadingCreatePlan(false);
      }
    } else {
      message.warning("Debe llenar todos los campos");
      setLoadingCreatePlan(false);
    }
  };
  const handleCancelEdit = () => {
    setPlanEdit(null);
    setModulesInitEdit([]);
    setAddModules([]);
    setRemoveModules([]);
    setIsModalOpenEdit(false);
  };
  const abrirModalEdit = (e, id) => {
    e.stopPropagation();
    const planSearch = plans.find((p) => p.id === id);
    setPlanEdit(planSearch);
    setModulesInitEdit(planSearch.modules);
    setIsModalOpenEdit(true);
  };
  const handleChangePlanEdit = (key, value) => {
    setPlanEdit((prev) => {
      const newModelo = { ...prev, [key]: value };

      return newModelo;
    });
  };
  console.log(addModules);
  console.log(removeModules);

  return (
    <div className="w-full p-6 app-container-sections">
      <div
        className="mb-[32px] flex items-center justify-between py-4 pr-4"
        style={{ background: "linear-gradient(90deg,#fff0,#fff)" }}
      >
        <div className="data">
          <div className="title font-bold text-xl text-bold-font">Planes</div>
          <div className="subtitle max-w-[30vw] text-xs font-normal text-light-font">
            Lista de planes
          </div>
        </div>
        <div className="options bg-gray-50 p-4">
          <div className="page-top-card flex items-center gap-3">
            <div className="icon bg-light-purple p-4 rounded text-dark-purple">
              <MdApps />
            </div>
            <div>
              <div className="value font-bold text-bold-font text-xl">
                {plans.length}
              </div>
              <div className="text-sm font-normal text-light-font">
                Total plans
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
              // value={searchTerm}
              // onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="on"
            />
            <AiOutlineSearch className="h-full w-[24px] min-w-[24px] opacity-5 mx-[12px]" />
          </div>
        </div>
        <div className="horizontal-options-items ml-[28px] flex items-center">
          <button
            // onClick={() => setActiveFilter(!activeFilter)}
            className="inmocms-button bg-dark-blue text-white rounded p-4"
          >
            <TbAdjustments />
          </button>
          <button
            onClick={(e) => abrirModalCreate(e)}
            className="btn-new ml-[12px] h-[46px] flex gap-2 items-center"
          >
            <MdAdd className="text-white" />
            <span className="mobile-hide">Nuevo Plan</span>
          </button>
        </div>
      </div>
      <Modal
        footer={null}
        title="Register"
        open={isModalOpenCreate}
        onOk={handleOkCreate}
        onCancel={handleCancelCreate}
      >
        <div className="relative w-full">
          {loadingCreatePlan ? (
            <div className="bg-dark-purple z-50 text-white absolute top-0 left-0 right-0 bottom-0 w-full flex items-center justify-center">
              Loading
            </div>
          ) : null}
          <h1 className="font-bold text-lg mb-2">Detalle del Plan</h1>
          <div className="bg-gray-400 h-[2px] w-full mb-4"></div>
          <div className="model grid grid-cols-1 gap-3 mt-4 relative">
            <div>
              <label className="text-sm w-full block font-medium mb-4 ">
                Name
              </label>
              <input
                placeholder="Ingresa el nombre del modulo"
                className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                type="text"
                value={planCreate?.name}
                onChange={(e) => handleChangePlanCreate("name", e.target.value)}
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
                value={planCreate?.description}
                onChange={(e) =>
                  handleChangePlanCreate("description", e.target.value)
                }
              />
            </div>
            <div>
              <label className="text-sm w-full block font-medium mb-4 ">
                Precio
              </label>
              <input
                placeholder="descripcion de ejemplo..."
                className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                type="number"
                step={0.01}
                min={0}
                value={planCreate?.price !== null ? planCreate?.price : ""}
                onChange={(e) =>
                  handleChangePlanCreate("price", e.target.value)
                }
              />
            </div>
          </div>
          <h1 className="font-bold text-lg mb-2">Modulos</h1>
          <div className="bg-gray-400 h-[2px] w-full mb-4"></div>
          <div className="w-full">
            <div className="grid grid-cols-3 gap-4">
              {modulos.map((m, index) => {
                return (
                  <div
                    onClick={(e) => handleSelectModules(m.id, e)}
                    key={index}
                    className={`w-full flex items-center  transition-all duration-300 p-4 rounded cursor-pointer ${
                      selectModules.includes(m.id)
                        ? "bg-dark-purple text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-[#7f6bef]"
                    } shadow-sm 0 relative`}
                  >
                    <Checkbox
                      checked={selectModules.includes(m.id)}
                      onClick={(e) => handleSelectModules(m.id, e)}
                      style={{ marginRight: "10px" }}
                    />
                    <h1 className="select-none">{m.name}</h1>
                  </div>
                );
              })}
            </div>
            <span>{selectModules.length} modulos seleccionados</span>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => handleOkCreate()}
              className="bg-dark-purple text-white p-3 rounded"
            >
              Crear Plan
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        footer={null}
        title="Update"
        open={isModalOpenEdit}
        onOk={handleOkEdit}
        onCancel={handleCancelEdit}
      >
        <div className="relative w-full">
          {loadingEditPlan ? (
            <div className="bg-dark-purple z-50 text-white absolute top-0 left-0 right-0 bottom-0 w-full flex items-center justify-center">
              Loading
            </div>
          ) : null}
          <h1 className="font-bold text-lg mb-2">Detalle del Plan</h1>
          <div className="bg-gray-400 h-[2px] w-full mb-4"></div>
          <div className="model grid grid-cols-1 gap-3 mt-4 relative">
            <div>
              <label className="text-sm w-full block font-medium mb-4 ">
                Name
              </label>
              <input
                placeholder="Ingresa el nombre del modulo"
                className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                type="text"
                value={planEdit?.name}
                onChange={(e) => handleChangePlanEdit("name", e.target.value)}
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
                value={planEdit?.description}
                onChange={(e) =>
                  handleChangePlanEdit("description", e.target.value)
                }
              />
            </div>
            <div>
              <label className="text-sm w-full block font-medium mb-4 ">
                Precio
              </label>
              <input
                placeholder="descripcion de ejemplo..."
                className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                type="number"
                step={0.01}
                min={0}
                value={planEdit?.price !== null ? planEdit?.price : ""}
                onChange={(e) => handleChangePlanEdit("price", e.target.value)}
              />
            </div>
          </div>
          <h1 className="font-bold text-lg mb-2">Modulos</h1>
          <div className="bg-gray-400 h-[2px] w-full mb-4"></div>
          <div className="w-full">
            <div className="grid grid-cols-3 gap-4">
              {modulos.map((m, index) => {
                return (
                  <div
                    onClick={(e) => handleSelectModulesEdit(m.id, e)}
                    key={index}
                    className={`w-full flex items-center  transition-all duration-300 p-4 rounded cursor-pointer ${
                      planEdit?.modules?.some((objeto) => objeto.id === m.id)
                        ? "bg-dark-purple text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-[#7f6bef]"
                    } shadow-sm 0 relative`}
                  >
                    <Checkbox
                      checked={planEdit?.modules?.some(
                        (objeto) => objeto.id === m.id
                      )}
                      onClick={(e) => handleSelectModulesEdit(m.id, e)}
                      style={{ marginRight: "10px" }}
                    />
                    <h1 className="select-none">{m.name}</h1>
                  </div>
                );
              })}
            </div>
            <span>{planEdit?.modules?.length} modulos seleccionados</span>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => handleOkEdit()}
              className="bg-dark-purple text-white p-3 rounded"
            >
              Update Plan
            </button>
          </div>
        </div>
      </Modal>
      <div
        className={`${
          activeFilter ? "" : "hidden"
        } filters grid grid-cols-1 md:grid-cols-6 gap-4 bg-white py-4 px-3 mb-4`}
      >
        <div className="translate w-full flex flex-col md:flex-row">
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
              <td className="check-field">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={visiblePlans.every((propiedad) =>
                    selectsProperties.includes(propiedad.id)
                  )}
                />
              </td>
              <td>Fecha Creacion </td>
              <td>Nombres </td>
              <td>Description </td>
              <td>Precio </td>
              <td>Modulos </td>
              <td className="ajustes-tabla-celda"></td>
            </tr>
          </thead>
          <tbody>
            {visiblePlans.length > 0 &&
              visiblePlans.map((plan, index) => {
                return (
                  <tr
                    className=""
                    key={index}
                    onClick={(e) => handleSelect(e, plan.id)}
                  >
                    <td className="check-field">
                      <input
                        type="checkbox"
                        value={plan.id || ""}
                        onClick={(e) => handleCheckSelect(e, plan.id)}
                        checked={selectPlans.find((s) => {
                          if (s === plan.id) {
                            return true;
                          } else {
                            return false;
                          }
                        })}
                      />
                    </td>
                    <td>
                      <div className="flex flex-col align-center font-bold text-bold-font">
                        {dayjs(plan.create_at)
                          .locale("de")
                          .format("DD [de] MMMM [del] YYYY")}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col align-center">
                        {plan.name}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col align-center">
                        {plan.description}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col align-center">
                        {plan.price}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col align-center">
                        Ver modulos
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
                                    onClick={(e) => abrirModalEdit(e, plan.id)}
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
                                          "¿Está seguro de eliminar el plan?",
                                        content:
                                          "Al eliminar el plan, se eliminarán los datos relacionados con la suscripcion",
                                        onOk: () =>
                                          handleEliminarProperty(plan.id),
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

export default Plans;
