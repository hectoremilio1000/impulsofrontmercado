import React, { useState } from "react";
import SidebarSitioWeb from "./SidebarSitioWeb";

const LayoutSitioWeb = ({ children, open, setOpen }) => {
  return (
    <div className="flex overflow-hidden flex-grow-1">
      <SidebarSitioWeb open={open} setOpen={setOpen} />
      <div className="w-full app-container">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default LayoutSitioWeb;
