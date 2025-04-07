import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DatabaseOutlined,
  PoweroffOutlined,
  IdcardOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { useNavigate, Link, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

const { Header, Sider, Content, Footer } = Layout;

const LayoutAntd = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  // Para alternar el colapso de la barra lateral
  const toggle = () => {
    setCollapsed(!collapsed);
  };

  const role = auth.user.rol?.name;
  console.log("[LayoutAdminAntd] El rol del usuario es =>", role);
  console.log("[LayoutEmployeAntd] Render");

  // Ejemplo de items del Menú (similar a tu menuSuperAdmin)
  const items = [
    // {
    //   key: "/dashboard",
    //   icon: <FundProjectionScreenOutlined />,
    //   label: <Link to="/dashboard">Dashboard</Link>,
    // },
    {
      key: "/usuarios",
      icon: <UserOutlined />,
      label: <Link to="/employee">Usuario</Link>,
    },
    // {
    //   key: "/companies",
    //   icon: <UserOutlined />,
    //   label: <Link to="/companies">Compañías</Link>,
    // },
    // {
    //   key: "/casosestudio",
    //   icon: <IdcardOutlined />,
    //   label: <Link to="/casosestudio">Casos de Estudio</Link>,
    // },
    {
      key: "sub1",
      icon: <DatabaseOutlined />,
      label: "Tareas",
      children: [
        {
          key: "/checklist",
          label: <Link to="/checklist">Check List </Link>,
        },
        // {
        //   key: "/tareas",
        //   label: <Link to="/tareas">Tareas Semanales </Link>,
        // },
      ],
    },
    {
      key: "sub2",
      icon: <DatabaseOutlined />,
      label: "RRHH",
      children: [
        // {
        //   key: "/pages/superadmin/moduls/index.js",
        //   label: <Link to="/modules">Lista de Módulos</Link>,
        // },
        {
          key: "/manuales",
          label: <Link to="/manuales">Manuales</Link>,
        },

        // Por si quieres mantener Google Ads como sub-item
        // {
        //   key: "/adsgoogle",
        //   icon: <GoogleOutlined />,
        //   label: <Link to="/adsgoogle">Google Ads</Link>,
        // },
      ],
    },
    // {
    //   key: "/plans",
    //   icon: <DatabaseOutlined />,
    //   label: <Link to="/plans">Planes</Link>,
    // },
    {
      // Botón de logout (solo para ejemplo)
      key: "logout",
      icon: <PoweroffOutlined />,
      label: "Cerrar Sesión",

      onClick: () => {
        logout();
        navigate("/login");
      },
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sider: barra lateral */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        {/* Cuando collapsed es true, mostramos el logo “mobile”; cuando es false, el “desktop”. */}
        <div className="flex items-center justify-center my-4">
          {collapsed ? (
            /* Logo Móvil */
            <img
              src="https://imagenesrutalab.s3.us-east-1.amazonaws.com/growthsuite/growthsuitelogo.png"
              alt="Logo Mobile"
              style={{ maxHeight: 50, maxWidth: "100%" }}
            />
          ) : (
            /* Logo Desktop */
            <img
              src="https://imagenesrutalab.s3.us-east-1.amazonaws.com/growthsuite/logoletrasunladofinal.png"
              alt="Logo Desktop"
              style={{ maxHeight: 50, maxWidth: "100%" }}
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

      {/* Parte derecha: Header + Content + Footer */}
      <Layout className="site-layout">
        <Header
          style={{
            padding: "0 16px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Botón para colapsar sider */}
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: "trigger",
              onClick: toggle,
              style: { fontSize: 20, cursor: "pointer" },
            }
          )}

          <div>
            {/* Info del usuario */}
            <span style={{ marginLeft: 16, fontWeight: "bold" }}>
              ¡Hola, {auth.user?.name}!
            </span>
            <span style={{ marginLeft: 10, color: "#999" }}>
              {auth.user?.email} ({auth.user?.rol?.name})
            </span>
          </div>
        </Header>
        <Content className="m-4">
          <Outlet />
        </Content>
        {/* <Content style={{ margin: "16px" }}> */}
        {/* Aquí va tu contenido (children) */}
        {/* {children} */}
        {/* </Content> */}
        <Footer style={{ textAlign: "center" }}>
          GrowthSuite ©{new Date().getFullYear()} - Todos los derechos
          reservados.
        </Footer>
      </Layout>
    </Layout>
  );
};

export default LayoutAntd;
