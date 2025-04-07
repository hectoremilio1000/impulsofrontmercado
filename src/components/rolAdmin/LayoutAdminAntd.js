// src/components/rolAdmin/LayoutAdminAntd.jsx
import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PoweroffOutlined,
  UserOutlined,
  ProfileOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const { Header, Sider, Content, Footer } = Layout;

const LayoutAdminAntd = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  // Para colapsar la barra lateral
  const toggle = () => setCollapsed(!collapsed);

  const role = auth.user?.rol?.name;
  console.log("[LayoutAdminAntd] El rol del usuario es =>", role);

  // 1) Tomar los módulos que el administrador tiene en su suscripción
  const adminModules = auth.user?.subscription?.modules || [];
  const adminModuleIds = adminModules.map((m) => m.id);

  // 2) Definir array de items con "moduleId" donde corresponda
  const items = [
    // Secciones sin moduleId (siempre visibles)
    {
      key: "/manage",
      icon: <UserOutlined />,
      label: "Información",
      onClick: () => {
        const currentUserId = auth.user.id;
        console.log(
          `[LayoutAdminAntd] Clic en Manage => /manage/${currentUserId}`
        );
        navigate(`/manage/${currentUserId}`);
      },
    },
    {
      key: "/empleadosadmin",
      icon: <ProfileOutlined />,
      label: "Empleados",
      onClick: () => {
        navigate("/empleadosadmin");
      },
    },

    // ----------------------------------------
    // Módulo ASESORÍA LEGAL (ID=6)
    {
      key: "sub-asesoria",
      icon: <DatabaseOutlined />,
      label: "Módulo Asesoría Legal",
      moduleId: 6,
      children: [
        {
          key: "/panelasesoriaadmin",
          label: "Panel Asesoría Admin",
          onClick: () => {
            console.log("[LayoutAdminAntd] Clic en /panelasesoriaadmin");
            navigate("/panelasesoriaadmin");
          },
        },
        {
          key: "/solicitudasesoriaadmin",
          label: "Solicitud Legal",
          onClick: () => {
            navigate("/solicitudasesoriaadmin");
          },
        },
        {
          key: "/permisosasesoriaadmin",
          label: "Permisos Información",
          onClick: () => {
            navigate("/permisosasesoriaadmin");
          },
        },
      ],
    },
    // Módulo AYUDA IA (ID=11)
    {
      key: "sub-ayudaia",
      icon: <DatabaseOutlined />,
      label: "Módulo Ayuda IA",
      moduleId: 11,
      children: [
        {
          key: "/admin/panelia",
          label: "Panel IA",
          onClick: () => {
            navigate("/admin/panelia");
          },
        },
        {
          key: "/ayudaiaadmin",
          label: "Ayuda IA Admin",
          onClick: () => {
            navigate("/admin/ayudaia");
          },
        },
      ],
    },
    // Módulo ENCUESTAS (ID=8)
    {
      key: "sub-encuestas",
      icon: <DatabaseOutlined />,
      label: "Módulo Encuestas",
      moduleId: 8,
      children: [
        {
          key: "/panelencuestasadmin",
          label: "Panel Encuestas Admin",
          onClick: () => {
            navigate("/panelencuestasadmin");
          },
        },
        {
          key: "/solicitar-encuesta-admin",
          label: "Solicitar Encuestas",
          onClick: () => {
            navigate("/solicitar-encuesta-admin");
          },
        },
        {
          key: "/respuestas-encuestas-admin",
          label: "Respuestas Encuestas",
          onClick: () => {
            navigate("/respuestas-encuestas-admin");
          },
        },
      ],
    },
    // Módulo FINANCIAMIENTO (ID=7)
    {
      key: "sub-financiamiento",
      icon: <DatabaseOutlined />,
      label: "Módulo Financiamiento",
      moduleId: 7,
      children: [
        {
          key: "/panelfinanciamientoadmin",
          label: "Panel Financiamiento Admin",
          onClick: () => {
            navigate("/panelfinanciamientoadmin");
          },
        },
        {
          key: "/solicitudfinanciamientoadmin",
          label: "Ticket Financiamiento",
          onClick: () => {
            navigate("/solicitudfinanciamientoadmin");
          },
        },
      ],
    },
    // Módulo INVENTARIOS (ID=9)
    {
      key: "sub-inventarios",
      icon: <DatabaseOutlined />,
      label: "Módulo Inventarios",
      moduleId: 9,
      children: [
        {
          key: "/panelinventariosadmin",
          label: "Panel Inventarios Admin",
          onClick: () => {
            navigate("/panelinventariosadmin");
          },
        },
        {
          key: "/solicitudinventariosadmin",
          label: "Ticket Inventarios Admin",
          onClick: () => {
            navigate("/solicitudinventariosadmin");
          },
        },
        {
          key: "/como-funcionan-inventarios-admin",
          label: "¿Cómo funciona?",
          onClick: () => {
            navigate("/como-funcionan-inventarios-admin");
          },
        },
      ],
    },
    // Módulo LEALTAD (ID=5)
    {
      key: "sub-lealtad",
      icon: <DatabaseOutlined />,
      label: "Módulo Lealtad",
      moduleId: 5,
      children: [
        {
          key: "/panellealtadadmin",
          label: "Panel Lealtad Admin",
          onClick: () => {
            navigate("/panellealtadadmin");
          },
        },
        {
          key: "/solicitarlealtadadmin",
          label: "Solicitar Programa Lealtad",
          onClick: () => {
            navigate("/solicitarlealtadadmin");
          },
        },
        {
          key: "/tiposlealtadadmin",
          label: "Tipos Programa Lealtad",
          onClick: () => navigate("/tiposlealtadadmin"),
        },
      ],
    },
    // Módulo MARKETING (ID=1)
    {
      key: "sub-marketing",
      icon: <DatabaseOutlined />,
      label: "Módulo Marketing",
      moduleId: 1,
      children: [
        {
          key: "/panelmarketingadmin",
          label: "Panel Marketing Admin",
          onClick: () => {
            navigate("/panelmarketingadmin");
          },
        },
        {
          key: "/solicitudmarketingadmin",
          label: "Ticket Marketing",
          onClick: () => {
            navigate("/solicitudmarketingadmin");
          },
        },
      ],
    },
    // Módulo MONITOREO (ID=10)
    {
      key: "sub-monitoreo",
      icon: <DatabaseOutlined />,
      label: "Módulo Monitoreo",
      moduleId: 10,
      children: [
        {
          key: "/panelmonitoreoadmin",
          label: "Panel Monitoreo Admin",
          onClick: () => {
            navigate("/panelmonitoreoadmin");
          },
        },
        {
          key: "/solicitudmonitoreoadmin",
          label: "Ticket Monitoreo",
          onClick: () => {
            navigate("/solicitudmonitoreoadmin");
          },
        },
      ],
    },
    // Módulo PUNTO DE VENTAS (ID=3)
    {
      key: "sub-puntoventa",
      icon: <DatabaseOutlined />,
      label: "Módulo Punto de Venta",
      moduleId: 3,
      children: [
        {
          key: "/panelpuntoventasadmin",
          label: "Panel Punto de Ventas Admin",
          onClick: () => {
            navigate("/panelpuntoventasadmin");
          },
        },
        {
          key: "/solicitudpuntoadmin",
          label: "Ticket Punto Venta",
          onClick: () => {
            navigate("/solicitudpuntoadmin");
          },
        },
      ],
    },
    // Módulo RRHH (ID=4)
    {
      key: "sub-rrhh",
      icon: <DatabaseOutlined />,
      label: "Módulo RRHH",
      moduleId: 4,
      children: [
        {
          key: "/admin/panelrrhh",
          label: "Panel RRHH Admin",
          onClick: () => {
            navigate("/admin/panelrrhh");
          },
        },
        {
          key: "/admin/contratacionesrrhh",
          label: "Contrataciones",
          onClick: () => {
            navigate("/admin/contratacionesrrhh");
          },
        },
        {
          key: "/admin/examenesresultadosrrhh",
          label: "Resultados",
          onClick: () => {
            navigate("/admin/examenesresultadosrrhh");
          },
        },
        {
          key: "/admin/manualesrrhh",
          label: "Manuales",
          onClick: () => {
            navigate("/admin/manualesrrhh");
          },
        },
      ],
    },
    // Módulo SISTEMA WEB (ID=2)
    {
      key: "sub-sistemaweb",
      icon: <DatabaseOutlined />,
      label: "Módulo Sistema Web",
      moduleId: 2,
      children: [
        {
          key: "/panelsistemawebadmin",
          label: "Panel Sistema Web Admin",
          onClick: () => {
            navigate("/panelsistemawebadmin");
          },
        },
        {
          key: "/solicitudwebadmin",
          label: "Ticket Sistema WEB",
          onClick: () => {
            navigate("/solicitudwebadmin");
          },
        },
      ],
    },
    // Botón LOGOUT (siempre visible)
    {
      key: "logout",
      icon: <PoweroffOutlined />,
      label: "Cerrar Sesión",
      onClick: () => {
        console.warn(
          "[LayoutAdminAntd] Clic en LOGOUT => Se cerrará la sesión"
        );
        logout();
        navigate("/login");
      },
    },
  ];

  // 3) Filtrar los menús basados en la suscripción:
  //    - si "moduleId" no está, siempre se muestra
  //    - si sí está, se muestra sólo si se incluye en adminModuleIds
  const filteredItems = items
    .filter((menuItem) => {
      // Si el ítem no tiene moduleId => lo mostramos
      if (!menuItem.moduleId) return true;
      // Si sí tiene moduleId => mostrar sólo si está en la suscripción
      return adminModuleIds.includes(menuItem.moduleId);
    })
    .map((menuItem) => {
      // Si hay children, los dejamos tal cual
      // (En tu caso cada submenú es uno solo, sin necesidad de filtrar)
      return menuItem;
    });

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="flex justify-center items-center my-2">
          {collapsed ? (
            <img
              className="max-h-12"
              src="https://imagenesrutalab.s3.us-east-1.amazonaws.com/growthsuite/growthsuitelogo.png"
              alt="Logo Mobile"
            />
          ) : (
            <img
              className="max-h-12"
              src="https://imagenesrutalab.s3.us-east-1.amazonaws.com/growthsuite/logoletrasunladofinal.png"
              alt="Logo Desktop"
            />
          )}
        </div>

        <Menu
          theme="dark"
          defaultSelectedKeys={["/manage"]}
          mode="inline"
          items={filteredItems}
        />
      </Sider>

      <Layout className="site-layout">
        <Header className="flex items-center justify-between bg-white px-4">
          {React.createElement(
            collapsed ? MenuFoldOutlined : MenuUnfoldOutlined,
            {
              className: "cursor-pointer text-xl",
              onClick: toggle,
            }
          )}
          <div>
            <span className="ml-4 font-bold">¡Hola, {auth.user?.name}!</span>
            <span className="ml-2 text-gray-500">
              {auth.user?.email} ({auth.user?.rol?.name})
            </span>
          </div>
        </Header>

        <Content className="m-4">
          <Outlet />
        </Content>

        <Footer style={{ textAlign: "center" }}>
          GrowthSuite ©{new Date().getFullYear()} - Todos los derechos
          reservados.
        </Footer>
      </Layout>
    </Layout>
  );
};

export default LayoutAdminAntd;
