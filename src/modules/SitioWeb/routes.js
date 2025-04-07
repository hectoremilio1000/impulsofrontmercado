import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Config from "./pages/Config";
import Main from ".";
import SidebarSitioWeb from "./components/SidebarSitioWeb";
import LayoutSitioWeb from "./components/Layout";
import Portada from "./pages/Portada";
import Menu from "./pages/Menu";

function SitioWebRoutes({ open, setOpen }) {
  return (
    <Routes>
      <Route
        index
        element={
          <LayoutSitioWeb open={open} setOpen={setOpen}>
            <Main />
          </LayoutSitioWeb>
        }
      />
      <Route
        path="/dashboard"
        element={
          <LayoutSitioWeb open={open} setOpen={setOpen}>
            <Dashboard />
          </LayoutSitioWeb>
        }
      />
      <Route
        path="/config"
        element={
          <LayoutSitioWeb open={open} setOpen={setOpen}>
            <Config />
          </LayoutSitioWeb>
        }
      />
      <Route
        path="/portada"
        element={
          <LayoutSitioWeb open={open} setOpen={setOpen}>
            <Portada />
          </LayoutSitioWeb>
        }
      />
      <Route
        path="/Menu"
        element={
          <LayoutSitioWeb open={open} setOpen={setOpen}>
            <Menu />
          </LayoutSitioWeb>
        }
      />
    </Routes>
  );
}

export default SitioWebRoutes;
