import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useAuth } from "../../components/AuthContext";
import { FcBusiness } from "react-icons/fc";
import { Link } from "react-router-dom";
import "./animationjzcode.css";

const Manage = () => {
  const { auth } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;
  const [companies, setCompanies] = useState([]);
  const [filterCompanies, setFilterCompanies] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [selectCompany, setSelectCompany] = useState(null);
  const handleSelectCompany = async (id) => {
    const company = filterCompanies.find((f) => f.id === id);
    setSedes([]);
    setTimeout(() => {
      setSedes(company.sedes);
    }, 500);

    console.log(company.sedes);
    setSelectCompany(id);
  };
  const searchCompanies = async () => {
    try {
      const response = await axios.get(`${apiUrl}/companies`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });
      console.log(response);
      if (response.data.status === "success") {
        setCompanies([]);
        setFilterCompanies([]);
        setTimeout(() => {
          setCompanies(response.data.data);
          setFilterCompanies(response.data.data);
        }, 500);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error al obtener los modulos:", error);
    }
  };
  useEffect(() => {
    searchCompanies();
  }, [apiUrl, auth]);
  useEffect(() => {
    if (searchTerm === "") {
      setFilterCompanies(companies);
    } else {
      const companiesData = companies.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilterCompanies(companiesData);
    }
  }, [searchTerm]);

  return (
    <div className="w-full bg-white h-screen flex items-center relative">
      <div className="absolute top-0 left-0 w-full h-full bottom-0 right-0 opacity-[3%] z-40">
        <img
          className="object-cover w-full h-full"
          src="https://www.prosegur.com.pe/dam/jcr:b09e0c73-9185-469d-8e79-c315f0d344e6/admon%20restaurantes.jpg"
          alt=""
        />
      </div>
      <div className="w-full py-8 flex flex-col justify-center relative z-50">
        <div className="w-full max-w-[800px] mx-auto min-h-[350px]">
          <h1 className="font-bold text-gray-600 mb-6 text-3xl">
            Seleccione tu empresa
          </h1>
          <div className="search-hook flex-grow my-6">
            <div className="inmocms-input bg-white border rounded-full border-gray-300 flex text-sm h-[46px] overflow-hidden font-normal">
              <input
                className="h-full text-sm text-gray-900 px-[16px] w-full border-0 border-none focus:outline-none"
                placeholder="Busca tus empresas"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="on"
              />
              <AiOutlineSearch className="h-full w-[24px] min-w-[24px] opacity-5 mx-[12px]" />
            </div>
          </div>
          <div className="grid gap-4 grid-cols-2">
            <div className="w-full">
              <h1 className="mb-4 text-gray-700 text-lg font-bold">Empresas</h1>
              <div className="mt-6 grid grid-cols-1 gap-4">
                {filterCompanies.length > 0 &&
                  filterCompanies.map((c, index) => {
                    return (
                      <div
                        onClick={() => handleSelectCompany(c.id)}
                        key={index}
                        className={`${
                          selectCompany === c.id
                            ? "border-dark-purple"
                            : "border-transparent"
                        } hover:border-dark-purple  border-[2px] cursor-pointer w-full bg-gray-100 shadow rounded px-3 py-2 duration-300 transition-all hover:-translate-y-2 jzcode-up ${
                          index % 2 !== 0 ? "delay-700" : ""
                        }`}
                      >
                        <div className="flex w-full gap-3 items-center">
                          {c?.logo ? (
                            <img
                              className="object-cover w-10 h-10"
                              src={c.logo}
                              alt=""
                            />
                          ) : (
                            <FcBusiness className="text-2xl" />
                          )}

                          <div className="w-full">
                            <h1 className="font-bold text-gray-600 text-lg">
                              {c.name}
                            </h1>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="w-full">
              <h1 className="mb-4 text-gray-700 text-lg font-bold">Sedes</h1>
              {selectCompany !== null ? (
                <>
                  {sedes.length > 0 &&
                    sedes.map((s, index) => {
                      return (
                        <Link
                          key={index}
                          to={`/manage/${s.companyId}/sede/${s.id}`}
                          className="jzcode-up duration-300 transition-all hover:-translate-y-2 cursor-pointer w-full bg-gray-100 shadow rounded px-3 py-2 flex"
                        >
                          {s.name}
                        </Link>
                      );
                    })}
                </>
              ) : (
                <p>Debes seleccionar una empresa</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manage;
