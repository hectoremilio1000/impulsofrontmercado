import React, { useEffect, useRef, useState } from "react";
import { BsJustifyLeft, BsJustifyRight } from "react-icons/bs";

import { useAuth } from "../AuthContext";
import { Dropdown, Select, Tooltip } from "antd";
import { FaHouse, FaUser } from "react-icons/fa6";
import { FiGrid } from "react-icons/fi";
import { FaCalendarAlt, FaCog, FaLongArrowAltUp } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
const { Option } = Select;

const TopNavigationModules = ({
  open,
  setOpen,
  idSede,
  companyId,
  companies,
}) => {
  const { idModulo } = useParams();
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;
  const [module, setModule] = useState(null);

  const { auth, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Estado para el modal
  const modalRef = useRef(null); // Referencia para el modal

  // Change de rutas company y sede
  const [selectedCompany, setSelectedCompany] = useState();
  const [selectedSede, setSelectedSede] = useState();
  const [sedesList, setSedesList] = useState([]);

  // Lista de aplicaciones (nombre + imagen)
  const [apps, setApps] = useState([]);

  const searchPlan = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/subscriptionbyuser/${auth.user.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      const data = response.data;

      if (data.status === "success") {
        setApps(data.data.plan.modules);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error al obtener los modulos:", error);
    }
  };
  useEffect(() => {
    if (auth.user) {
      searchPlan();
    }
  }, [apiUrl, auth]);

  // buscar modulo activo
  const searchModule = async () => {
    try {
      const response = await axios.get(`${apiUrl}/modules/${idModulo}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const data = response.data;

      if (data.status === "success") {
        setModule(data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (auth.token) {
      searchModule();
    }
  }, [auth, idModulo]);

  // Función para abrir/cerrar el modal
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  // Cierra el modal si se hace click fuera de él
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      setSelectedCompany(Number(companyId));
      const companyData = companies.find((c) => c.id === Number(companyId));

      if (companyData) {
        setSedesList(companyData.sedes);
        setSelectedSede(companyData.sedes[0].id); // Reinicia la sede seleccionada
      }
    }
  }, [companyId, companies]);

  // Manejar cambio de empresa
  const handleCompanyChange = (newCompanyId) => {
    const companyData = companies.find((c) => c.id === newCompanyId);
    if (companyData) {
      const firstSedeId = companyData.sedes[0]?.id || null;
      setSelectedCompany(newCompanyId);
      setSedesList(companyData.sedes);
      setSelectedSede(firstSedeId);

      // Obtener la ruta actual
      const pathname = window.location.pathname;

      // Dividir la ruta en segmentos
      const segments = pathname.split("/");

      // Buscar el índice después de "sede/{idSede}"
      const sedeIndex = segments.indexOf("sede");
      if (sedeIndex !== -1 && sedeIndex + 1 < segments.length) {
        // Obtener todo lo que sigue después de "sede/{idSede}"
        const restOfPath = segments.slice(sedeIndex + 2).join("/");

        // Construir la nueva URL
        const newPath = `/manage/${newCompanyId}/sede/${firstSedeId}/${restOfPath}`;
        navigate(newPath);
      } else {
        // Si no hay "sede/{idSede}", redirigir a la ruta base
        const newPath = `/manage/${newCompanyId}/sede/${firstSedeId}/`;
        navigate(newPath);
      }
      window.location.reload(); // Refresca la página
    }
  };

  // Manejar cambio de sede
  const handleSedeChange = (newSedeId) => {
    setSelectedSede(newSedeId);

    // Obtener la ruta actual
    const pathname = window.location.pathname;

    // Dividir la ruta en segmentos
    const segments = pathname.split("/");

    // Buscar el índice después de "sede/{idSede}"
    const sedeIndex = segments.indexOf("sede");
    if (sedeIndex !== -1 && sedeIndex + 1 < segments.length) {
      // Obtener todo lo que sigue después de "sede/{idSede}"
      const restOfPath = segments.slice(sedeIndex + 2).join("/");

      // Construir la nueva URL
      const newPath = `/manage/${companyId}/sede/${newSedeId}/${restOfPath}`;
      navigate(newPath);
    } else {
      // Si no hay "sede/{idSede}", redirigir a la ruta base
      const newPath = `/manage/${companyId}/sede/${newSedeId}/`;
      navigate(newPath);
    }
    window.location.reload(); // Refresca la página
  };

  const onMenuClick = ({ key }) => {
    switch (key) {
      case "2":
        // handleCONFIG();

        navigate(`/manage/${companyId}/sede/${idSede}`, { replace: true });
        // window.location.reload(); // Refresca la página
        break;
      case "3":
        // handleProfile();
        break;
      case "4":
        navigate(`/plan`);
        // handlePlans();
        break;
      case "5":
        // handleSettings();
        break;
      case "6":
        logout();
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className=" bg-white block px-6 py-3 border-solid border-b-2 border-gray-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-4 items-center w-54">
              <img
                className="w-12 bg-dark-purple"
                src="https://imagenesrutalab.s3.us-east-1.amazonaws.com/growthsuite/growthsuitelogoblanco.png"
                alt=""
              />
              {/* <h1 className="text-2xl">ErpRestaurant</h1> */}
              <div className="w-[2px] bg-dark-purple h-6 rounded"></div>
              {idModulo ? (
                <>
                  <img
                    className="w-10 object-cover "
                    src={`/modules/${module?.name}.png`}
                    alt=""
                  />
                  <p className="text-2xl font-bold text-nowrap text-ellipsis overflow-hidden">
                    {module?.name}
                  </p>
                </>
              ) : null}
            </div>
            {/* Select de Companies */}
            <div className="hidden md:block overflow-auto">
              <Select
                placeholder="Seleccione una empresa"
                value={selectedCompany}
                className="w-full"
                onChange={handleCompanyChange}
              >
                {companies.map((company) => (
                  <Option key={company.id} value={company.id}>
                    {company.name}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Select de Sedes */}
            <div className="hidden md:block overflow-auto">
              <Select
                placeholder="Seleccione una sede"
                value={selectedSede}
                className="w-full"
                onChange={handleSedeChange}
                // disabled={!sedesList.length} // Deshabilita si no hay sedes disponibles
              >
                {sedesList.map((sede) => (
                  <Option key={sede.id} value={sede.id}>
                    {sede.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-6 self-start">
            {/* <div className="self-center">
              <div className="cursor-pointer counter-icon relative">
                <div className="rounded-full bg-dark-purple text-white text-sm flex items-center justify-center w-5 h-5 text-center absolute -top-2 -right-2">
                  <span className="text-white text-xs">1</span>
                </div>
                <BsBellFill className="text-xl ml-2 active-bell text-gray-400" />
              </div>
            </div> */}

            <div className="inline-block">
              <Tooltip
                title="Growth Apps"
                placement="bottom"
                getTooltipContainer={(node) => node.parentElement}
              >
                <button
                  onClick={toggleModal}
                  className="flex items-center justify-center p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition duration-200 shadow-md"
                >
                  <FiGrid className="text-xl text-gray-700" />
                </button>
              </Tooltip>

              {/* Modal debajo del botón */}
              {isOpen && (
                <div
                  ref={modalRef}
                  className="z-50 absolute right-0 mt-8 transform -translate-x-[100px] bg-white border border-gray-200 rounded-lg shadow-lg w-64"
                >
                  <div className="p-4 grid grid-cols-3 gap-4">
                    {apps.length > 0 &&
                      apps.map((app) => (
                        <Link
                          onClick={() => setIsOpen(false)}
                          to={`/manage/${companyId}/sede/${idSede}/modules/${app.id}`}
                          key={app.id}
                          className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition"
                        >
                          <img
                            src={`/modules/${app?.name}.png`}
                            alt={app.name}
                            className="w-12 h-12 object-contain"
                          />
                          <span className="text-xs text-gray-700 mt-2">
                            {app.name}
                          </span>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <Tooltip
              title={
                <div className="text-left">
                  <p className="font-semibold text-sm">Cuenta de GrogthSuite</p>
                  <p className="text-sm">{auth?.user?.name}</p>
                  <p className="text-sm text-gray-500">{auth?.user?.email}</p>
                </div>
              }
              placement="topLeft"
            >
              <Dropdown
                overlayClassName="w-[150px]"
                trigger={"click"}
                menu={{
                  items: [
                    {
                      key: "1",
                      label: auth?.user?.name,
                      disabled: true,
                    },
                    {
                      type: "divider",
                    },
                    {
                      key: "2",
                      label: "Home",
                      icon: <FaHouse />,
                      extra: "⌘P",
                    },
                    {
                      key: "3",
                      label: "Perfil",
                      icon: <FaUser />,
                      extra: "⌘P",
                    },
                    {
                      key: "4",
                      label: "Plan",
                      icon: <FaCalendarAlt />,
                    },
                    {
                      key: "5",
                      label: "Configuracion",
                      icon: <FaCog />,
                    },
                    {
                      key: "6",
                      label: "Cerrar Session",
                      icon: <FaLongArrowAltUp />,
                    },
                  ],
                  onClick: onMenuClick,
                }}
              >
                <img
                  src={
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsjD3SNA6uAstGRgfQJBTibVg2BAg6bunm0sAn0qrqNQWfif9LXvt6gN7DlSZJdXmb3FQ&usqp=CAU"
                  }
                  alt="User Profile"
                  className="bg-gray-100 w-10 h-10 rounded-full cursor-pointer hover:opacity-80"
                />
              </Dropdown>
            </Tooltip>
          </div>
        </div>
        <div className="flex ">
          <span className="title text-18 lg:text-26"></span>
        </div>
      </div>
      <div className="block md:hidden p-6 bg-white">
        <div className="flex gap-4">
          {open ? (
            <>
              <BsJustifyRight
                onClick={() => setOpen(false)}
                className="bg-white text-dark-purple rounded-full text-3xl cursor-pointer"
              />
            </>
          ) : (
            <>
              <BsJustifyLeft
                onClick={() => setOpen(true)}
                className="bg-white text-dark-purple text-3xl cursor-pointer"
              />
              {/* Select de Companies */}
            </>
          )}
          {/* Select de Companies */}
          <div className="overflow-auto">
            <Select
              placeholder="Seleccione una empresa"
              value={selectedCompany}
              className="w-full"
              onChange={handleCompanyChange}
            >
              {companies.map((company) => (
                <Option key={company.id} value={company.id}>
                  {company.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Select de Sedes */}
          <div className="overflow-auto">
            <Select
              placeholder="Seleccione una sede"
              value={selectedSede}
              className="w-full"
              onChange={handleSedeChange}
              // disabled={!sedesList.length} // Deshabilita si no hay sedes disponibles
            >
              {sedesList.map((sede) => (
                <Option key={sede.id} value={sede.id}>
                  {sede.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopNavigationModules;
