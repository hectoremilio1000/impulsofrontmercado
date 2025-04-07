import React from "react";
import {
  NavLink,
  useMatch,
  useParams,
  useResolvedPath,
} from "react-router-dom";
import { BsArrowLeftShort, BsArrowRightShort } from "react-icons/bs";
import { FaFacebook, FaGoogle, FaTiktok } from "react-icons/fa";
import { FaCalendarWeek } from "react-icons/fa6";

const SidebarMarketing = ({ open, setOpen }) => {
  const { companyId, idSede, idModulo } = useParams();
  const handlerSidebar = () => {
    setOpen(!open);
  };

  const menuSuperAdmin = [
    {
      is_title_head: false,
      items: [
        {
          title: "GoogleAds",
          url: `/manage/${companyId}/sede/${idSede}/modules/${idModulo}/googleads`,
          icon: <FaGoogle />,
        },
      ],
    },
    {
      is_title_head: false,
      items: [
        {
          title: "TiktokAds",
          url: `/manage/${companyId}/sede/${idSede}/modules/${idModulo}/tiktokads`,
          icon: <FaTiktok />,
        },
      ],
    },

    {
      is_title_head: false,
      items: [
        {
          title: "FacebookAds",
          url: `/manage/${companyId}/sede/${idSede}/modules/${idModulo}/facebookads`,
          icon: <FaFacebook />,
        },
      ],
    },
    {
      is_title_head: false,
      items: [
        {
          title: "Reservaciones",
          url: `/manage/${companyId}/sede/${idSede}/modules/${idModulo}/reservations`,
          icon: <FaCalendarWeek />,
        },
      ],
    },
    // {
    //   is_title_head: true,
    //   title_head: "Opciones",
    //   items: [
    //     {
    //       title: "Portada",
    //       url: `/manage/${companyId}/sede/${idSede}/modules/${idModulo}/portada`,
    //       icon: <HiOutlineClipboardList />,
    //     },
    //     {
    //       title: "Menu",
    //       url: `/manage/${companyId}/sede/${idSede}/modules/${idModulo}/menu`,
    //       icon: <MdApps />,
    //     },
    //   ],
    // },
  ];

  const CustomNavLink = ({ to, children }) => {
    // Utiliza useResolvedPath y useMatch para obtener la ruta exacta
    let resolved = useResolvedPath(to);

    let match = useMatch({ path: resolved.pathname, end: true });

    return (
      <NavLink
        to={to}
        onClick={() => setOpen(false)}
        className={
          match
            ? "bg-light-purple text-dark-purple text-sm p-2 flex gap-3 items-center rounded duration-300 transition-all"
            : "p-2 text-sm hover:bg-light-purple hover:text-dark-purple transition-all rounded duration-300 flex gap-3 items-center"
        }
      >
        {children}
      </NavLink>
    );
  };

  return (
    <div>
      <div
        className={`z-20 h-screen bg-white shadow-lg text-light-font p-5 pt-8 ${
          open
            ? "translate-x-0 md:translate-x-0 w-60 md:w-60"
            : "-translate-x-20 w-20 md:translate-x-0 md:block md:w-20"
        } duration-300 fixed md:relative block`}
      >
        {open ? (
          <BsArrowLeftShort
            onClick={handlerSidebar}
            className="hidden md:block bg-white text-dark-purple rounded-full absolute -right-3 top-9 text-3xl border border-dark-purple cursor-pointer"
          />
        ) : (
          <BsArrowRightShort
            onClick={handlerSidebar}
            className="hidden md:block bg-white text-dark-purple rounded-full absolute -right-3 top-9 text-3xl border border-dark-purple cursor-pointer"
          />
        )}

        <nav className="flex flex-col gap-2">
          {menuSuperAdmin.map((item, index) => (
            <div key={index}>
              {item.is_title_head ? (
                <span className="font-bold text-sm">{item.title_head}</span>
              ) : null}
              {item.items.map((i, idx) => (
                <CustomNavLink to={i.url} key={idx}>
                  <span className="block float-left text-xl">{i.icon}</span>
                  <span
                    className={`text-sm font-medium flex-1 ${
                      !open && "hidden"
                    }`}
                  >
                    {i.title}
                  </span>
                </CustomNavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div
        onClick={() => setOpen(false)}
        className={`${
          open ? "" : "hidden"
        } block md:hidden w-full bg-gray-900 opacity-50 absolute top-0 h-full bottom-0 left-0 right-0 z-10`}
      ></div>
    </div>
  );
};

export default SidebarMarketing;
