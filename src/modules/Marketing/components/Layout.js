import React, { useState } from "react";
import SidebarMarketing from "./SidebarMarketing";

const LayoutMarketing = ({ children, open, setOpen }) => {
  return (
    <div className="flex overflow-hidden flex-grow-1">
      <SidebarMarketing open={open} setOpen={setOpen} />
      <div className="w-full p-6 app-container">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default LayoutMarketing;
