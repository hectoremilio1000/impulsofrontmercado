import React, { useState } from "react";
import SidebarMarketing from "./Sidebar";
import SidebarRecursosH from "./Sidebar";

const LayoutRecursos = ({ children, open, setOpen }) => {
  return (
    <div className="flex overflow-hidden flex-grow-1">
      <SidebarRecursosH open={open} setOpen={setOpen} />
      <div className="w-full app-container">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default LayoutRecursos;
