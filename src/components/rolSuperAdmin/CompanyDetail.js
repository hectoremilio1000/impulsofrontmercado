// Ejemplo: src/pages/admin/CompanyDetail.jsx (o donde sea)
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Tabs, message, Spin } from "antd";

import SedesPanel from "../../components/SedesPanel";
import EmployeesPanel from "../../components/EmployeesPanel";

function CompanyDetail() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${apiUrl}/companies/${companyId}`);
      setCompany(resp.data.data);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar la compañía");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin />;
  if (!company) return <p>Compañía no encontrada</p>;

  return (
    <div>
      <h2>Detalle de la Compañía: {company.name}</h2>
      {/* etc. mostrar info de la company... */}
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Datos" key="1">
          {/* Aquí muestras info general de la company */}
          {/* Por ejemplo, phone_contact, email, website, etc. */}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Sedes" key="2">
          <SedesPanel companyId={company.id} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Empleados" key="3">
          <EmployeesPanel companyId={company.id} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default CompanyDetail;
