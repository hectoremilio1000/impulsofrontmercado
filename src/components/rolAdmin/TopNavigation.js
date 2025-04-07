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

const TopNavigation = ({ open, setOpen, idSede, companyId, companies }) => {
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
  const [plan, setPlan] = useState(null);
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
        setPlan(data.data.plan);
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
              <h1 className="text-2xl">Growthsuite</h1>
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
        </div>
      </div>
    </>
  );
};

export default TopNavigation;
