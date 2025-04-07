import { Routes, Route } from "react-router-dom";
import Main from ".";
import Productos from "./pages/Productos";
import Ventas from "./pages/Ventas";
import LayoutPuntoVenta from "./components/Layout";

function PuntoVentaRoutes({ open, setOpen }) {
  return (
    <Routes>
      <Route
        index
        element={
          <LayoutPuntoVenta open={open} setOpen={setOpen}>
            <Main />
          </LayoutPuntoVenta>
        }
      />
      <Route
        path="productos"
        element={
          <LayoutPuntoVenta open={open} setOpen={setOpen}>
            <Productos />
          </LayoutPuntoVenta>
        }
      />
      <Route
        path="ventas"
        element={
          <LayoutPuntoVenta open={open} setOpen={setOpen}>
            <Ventas />
          </LayoutPuntoVenta>
        }
      />
    </Routes>
  );
}

export default PuntoVentaRoutes;
