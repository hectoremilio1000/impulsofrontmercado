import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import axios from "axios";
import { useAuth } from "../../../components/AuthContext";
import { Link } from "react-router-dom";
import { BiCalendarAlt } from "react-icons/bi";

const EventsTypeList = () => {
  const { auth } = useAuth();
  const [listEventTypes, setListEventTypes] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL;

  const [isAuthenticatedWithCalendly, setIsAuthenticatedWithCalendly] =
    useState(false);

  useEffect(() => {
    const checkCalendlyAuth = async () => {
      try {
        const response = await axios.get(`${apiUrl}/calendly/status`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (response.data.isAuthenticated) {
          setIsAuthenticatedWithCalendly(true);
        } else {
          setIsAuthenticatedWithCalendly(false);
        }
      } catch (error) {
        console.error(
          "Error verificando la autenticación con Calendly:",
          error
        );
        setIsAuthenticatedWithCalendly(false);
      }
    };

    checkCalendlyAuth();
  }, [auth.token]);
  useEffect(() => {
    if (isAuthenticatedWithCalendly) {
      const getEventTypes = async () => {
        try {
          const response = await axios.get(`${apiUrl}/calendly/event_types`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          });
          console.log(response);
          const newData =
            response.data.data.length > 0 ? response.data.data : [];
          setListEventTypes(newData);
        } catch (error) {
          console.error("Error al traer los tipo de eventos:", error);
        }
      };

      getEventTypes();
    }
  }, [isAuthenticatedWithCalendly]);

  const columns = [
    {
      title: "Event Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span className="text-dark-purple font-bold">{text}</span>
      ),
    },
    {
      title: "Duration (mins)",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Description",
      dataIndex: "description_plain",
      key: "description",
      ellipsis: true,
      render: (text) => <span className="text-sm text-gray-700">{text}</span>,
    },
    {
      title: "Location",
      dataIndex: "locations",
      key: "locations",
      render: (locations) =>
        locations.map((loc, index) => (
          <div key={index} className="text-sm text-gray-600">
            {loc.location}
          </div>
        )),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex items-center overflow-auto gap-3">
          <a
            href={record.scheduling_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white  px-3 py-2 flex items-center gap-3 rounded bg-dark-purple text-white"
          >
            <BiCalendarAlt /> Cronograma
          </a>
          <Link
            className="hover:text-gray-900  inline-block text-nowrap bg-white rounded px-3 py-2 shadow-md"
            to={`event_types/${record.uri.split("/")[4]}`}
          >
            Ver eventos
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Reservaciones</h1>
      {/* <div className="bg-white p-4 shadow rounded">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
        />
      </div> */}
      {isAuthenticatedWithCalendly ? (
        <div>
          <h1>Eventos de Calendly</h1>
          {/* Aquí puedes mostrar los eventos */}
          <div className="overflow-auto p-4 bg-white rounded-lg shadow-md">
            <Table
              columns={columns}
              dataSource={listEventTypes}
              rowKey={(record) => record.uri}
              pagination={{ pageSize: 5 }}
              bordered
              className="ant-table-thead-bg-gray-50"
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => (window.location.href = `${apiUrl}/oauth/calendly`)}
          // onClick={() => getAuthentication()}
        >
          Conectar con Calendly
        </button>
      )}
    </div>
  );
};

export default EventsTypeList;
