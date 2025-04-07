import React, { useEffect, useState } from "react";

import TopNavigation from "./TopNavigation";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axios from "axios";

const LayoutAdmin = ({ children }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { auth } = useAuth();
  const [open, setOpen] = useState(false);
  const { idSede, companyId } = useParams();
  const [companies, setCompanies] = useState([]);
  const buscar_empresas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/companies`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const data = response.data;

      if (data.status === "success") {
        setCompanies(data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error al obtener los modulos:", error);
    }
  };
  useEffect(() => {
    if (auth) {
      buscar_empresas();
    }
  }, [auth, apiUrl]);

  return (
    <div className="root-aplication">
      <div className="app-main">
        <TopNavigation
          companies={companies}
          companyId={companyId}
          idSede={idSede}
          open={open}
          setOpen={setOpen}
        />
        {React.cloneElement(children, { open, setOpen })}
      </div>
    </div>
  );
};

export default LayoutAdmin;
