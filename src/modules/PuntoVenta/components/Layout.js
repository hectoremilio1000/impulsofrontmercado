import React, { useState } from "react";
import SidebarPuntoVenta from "./SidebarPuntoVenta";

const LayoutPuntoVenta = ({ children, open, setOpen }) => {
  return (
    <div className="flex overflow-hidden flex-grow-1">
      <SidebarPuntoVenta open={open} setOpen={setOpen} />
      <div className="w-full p-6 app-container">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default LayoutPuntoVenta;
