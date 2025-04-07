import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  RobotOutlined,
  BulbOutlined,
  GlobalOutlined,
  ShopOutlined,
  UserSwitchOutlined,
  GiftOutlined,
  SafetyCertificateOutlined,
  DollarCircleOutlined,
  FormOutlined,
  DropboxOutlined,
  FileProtectOutlined,
  ProfileOutlined,
  CreditCardOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

const { Header, Sider, Content, Footer } = Layout;

export default function LayoutSuperAdminAntd() {
  const [collapsed, setCollapsed] = useState(false);
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const toggle = () => setCollapsed(!collapsed);

  // Define tus items sin <Link>, usando label: "Texto" y onClick: ...
  const items = [
    {
      key: "/usuarios",
      icon: <UnorderedListOutlined />,
      label: "Usuarios",
      onClick: () => navigate("/usuarios"),
    },
    {
      key: "/clientes",
      icon: <TeamOutlined />,
      label: "Clientes",
      onClick: () => navigate("/clientes"),
    },
    {
      key: "/companies",
      icon: <ApartmentOutlined />,
      label: "Compañías",
      onClick: () => navigate("/companies"),
    },

    {
      key: "/modules",
      icon: <UnorderedListOutlined />,
      label: "Lista de Módulos",
      onClick: () => navigate("/modules"),
    },

    {
      key: "sub1",
      icon: <AppstoreOutlined />,
      label: "Módulo IA",
      children: [
        {
          key: "/superadmin/panelia",
          icon: <RobotOutlined />,
          label: "Panel IA",
          onClick: () => navigate("/superadmin/panelia"),
        },
        {
          key: "/superadmin/ayudaia",
          icon: <RobotOutlined />,
          label: "Ayuda con IA",
          onClick: () => navigate("/superadmin/ayudaia"),
        },
      ],
    },
    {
      key: "sub2",
      icon: <AppstoreOutlined />,
      label: "Módulo Web",
      children: [
        {
          key: "/panelweb",
          icon: <GlobalOutlined />,
          label: "Panel Web",
          onClick: () => navigate("/panelweb"),
          // Ajusta la ruta si deseas
        },
        {
          key: "/sistema-web",
          icon: <GlobalOutlined />,
          label: "Tickets Web",
          onClick: () => navigate("/sistemaweb"),
          // Ajusta la ruta si deseas
        },
      ],
    },
    {
      key: "sub3",
      icon: <AppstoreOutlined />,
      label: "Módulo Marketing",
      children: [
        {
          key: "/panelmarketing",
          icon: <BulbOutlined />,
          label: "Panel Marketing",
          onClick: () => navigate("/panelmarketing"),
        },
        {
          key: "/ticketsmarketing",
          icon: <BulbOutlined />,
          label: "Tickets Marketing",
          onClick: () => navigate("/ticketsmarketing"),
        },
      ],
    },
    {
      key: "sub4",
      icon: <AppstoreOutlined />,
      label: "Módulo Punto Venta",
      children: [
        {
          key: "/punto-venta",
          icon: <ShopOutlined />,
          label: "Panel Punto Venta",
          onClick: () => navigate("/panelpuntoventa"),
        },
        {
          key: "/tickets-venta",
          icon: <ShopOutlined />,
          label: "Tickets Punto Venta",
          onClick: () => navigate("/ticketspuntoventa"),
        },
      ],
    },
    {
      key: "sub5",
      icon: <AppstoreOutlined />,
      label: "Módulo RRHH",
      children: [
        {
          key: "/panelrrhh",
          icon: <UserSwitchOutlined />,
          label: "PanelRRHH",
          onClick: () => navigate("/panelrrhh"),
        },
        {
          key: "/contratacionesrrhh",
          icon: <UserSwitchOutlined />,
          label: "Contrataciones",
          onClick: () => navigate("/contratacionesrrhh"),
        },
        {
          key: "/examenesresultadosrrhh",
          icon: <UserSwitchOutlined />,
          label: "Resultados",
          onClick: () => navigate("/examenesresultadosrrhh"),
        },
        {
          key: "/manualesrrhh",
          icon: <UserSwitchOutlined />,
          label: "Manuales",
          onClick: () => navigate("/manualesrrhh"),
        },
        {
          key: "/listadmin",
          icon: <UserSwitchOutlined />,
          label: "CheckListSuperAdmin",
          onClick: () => navigate("/listadmin"),
        },
      ],
    },
    {
      key: "sub6",
      icon: <AppstoreOutlined />,
      label: "Módulo Lealtad",
      children: [
        {
          key: "/Panel-lealtad",
          icon: <GiftOutlined />,
          label: "Panel Lealtad",
          onClick: () => navigate("/panellealtad"),
        },
        {
          key: "/tiposlealtad",
          icon: <GiftOutlined />,
          label: "Tipos Programa",
          onClick: () => navigate("/tiposlealtad"),
        },
        {
          key: "/tickets-lealtad",
          icon: <GiftOutlined />,
          label: "Solicitar Programa",
          onClick: () => navigate("/solicitarprograma"),
        },
      ],
    },
    {
      key: "sub7",
      icon: <AppstoreOutlined />,
      label: "Permisos y asesoría",
      children: [
        {
          key: "/panelpermisos",
          icon: <SafetyCertificateOutlined />,
          label: "Panel Asesoría",
          onClick: () => navigate("/panelpermisos"),
        },
        {
          key: "/solicitudasesorialegal",
          icon: <SafetyCertificateOutlined />,
          label: "Solicitar ayuda asesoría",
          onClick: () => navigate("/solicitudasesorialegal"),
        },
        {
          key: "/ticketspermisos",
          icon: <SafetyCertificateOutlined />,
          label: "Información permisos",
          onClick: () => navigate("/informacionpermisos"),
        },
      ],
    },
    {
      key: "sub8",
      icon: <AppstoreOutlined />,
      label: "Módulo Financiamiento",
      children: [
        {
          key: "/panelfinanciamiento",
          icon: <DollarCircleOutlined />,
          label: "Panel Financiamiento",
          onClick: () => navigate("/panelfinanciamiento"),
        },
        {
          key: "/solicitudfinanciamiento",
          icon: <DollarCircleOutlined />,
          label: "Solicitud Financiamiento",
          onClick: () => navigate("/solicitudfinanciamiento"),
        },
      ],
    },
    {
      key: "sub9",
      icon: <AppstoreOutlined />,
      label: "Encuesta Servicio",
      children: [
        {
          key: "/panelencuesta",
          icon: <FormOutlined />,
          label: "Panel Encuesta",
          onClick: () => navigate("/panelencuesta"),
        },
        {
          key: "/solicitarencuesta",
          icon: <FormOutlined />,
          label: "Solicitar Encuesta",
          onClick: () => navigate("/solicitarencuesta"),
        },
        {
          key: "/respuestasencuestas",
          icon: <FormOutlined />,
          label: "Tabla Respuestas",
          onClick: () => navigate("/respuestasencuestas"),
        },
      ],
    },
    {
      key: "sub10",
      icon: <AppstoreOutlined />,
      label: "Módulo Inventarios",
      children: [
        {
          key: "/panelinventarios",
          icon: <DropboxOutlined />,
          label: "Panel Inventarios",
          onClick: () => navigate("/panelinventarios"),
        },
        {
          key: "/ticketsinventarios",
          icon: <FileProtectOutlined />,
          label: "Solicitar Inventario",
          onClick: () => navigate("/ticketsinventarios"),
        },
        {
          key: "/como-funcionan-inventarios",
          icon: <FileProtectOutlined />,
          label: "¿Cómo funciona?",
          onClick: () => navigate("/como-funcionan-inventarios"),
        },
      ],
    },
    {
      key: "sub11",
      icon: <AppstoreOutlined />,
      label: "Módulo Monitoreo",
      children: [
        {
          key: "/panelmonitoreo",
          icon: <DropboxOutlined />,
          label: "Panel Monitoreo",
          onClick: () => navigate("/panelmonitoreo"),
        },
        {
          key: "/solicitudmonitoreo",
          icon: <FileProtectOutlined />,
          label: "Solicitar Monitoreo",
          onClick: () => navigate("/solicitudmonitoreo"),
        },
      ],
    },

    {
      key: "/plans",
      icon: <ProfileOutlined />,
      label: "Planes",
      onClick: () => navigate("/plans"),
    },
    {
      key: "/payments",
      icon: <CreditCardOutlined />,
      label: "Pagos",
      onClick: () => navigate("/pagos"), // Ajusta si la ruta de pagos es diferente
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar Sesión",
      onClick: () => {
        logout();
        navigate("/login");
      },
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="flex flex-col"
      >
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
          defaultSelectedKeys={["/dashboard"]}
          mode="inline"
          items={items}
        />
      </Sider>

      <Layout>
        <Header className="flex items-center justify-between bg-white px-4">
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
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

        <Footer className="text-center">
          GrowthSuite ©{new Date().getFullYear()} - Todos los derechos
          reservados.
        </Footer>
      </Layout>
    </Layout>
  );
}
