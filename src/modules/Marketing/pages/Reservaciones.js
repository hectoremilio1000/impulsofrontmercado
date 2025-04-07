import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";
import { useAuth } from "../../../components/AuthContext";
import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";

const Reservaciones = () => {
  const { auth } = useAuth();
  const { companyId } = useParams();
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [popupOpen, setPopupOpen] = useState(false);
  const [eventUri, setEventUri] = useState(null);
  const [reasonInput, setReasonInput] = useState("");
  const [selectedOption, setSelectedOption] = useState("all-events");
  const [nextPageToken, setNextPageToken] = useState(null);
  const [prevPageToken, setPrevPageToken] = useState(null);
  const [paginationCount, setPaginationCount] = useState(0);
  const [user, setUser] = useState();

  const currentDateMillisec = Date.now();

  const options = [
    { value: "all-events", label: "All Events" },
    { value: "asc-events", label: "All Events ASC" },
    { value: "desc-events", label: "All Events DESC" },
    { value: "active-events", label: "Active Events" },
    { value: "canceled-events", label: "Canceled Events" },
  ];

  const apiUrl = process.env.REACT_APP_API_URL;

  const [isAuthenticatedWithCalendly, setIsAuthenticatedWithCalendly] =
    useState(false);

  useEffect(() => {
    const checkCalendlyAuth = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/calendly/status?companyId=${companyId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

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
  const getDataScheduleEvents = async () => {
    try {
      let nextPageQueryParams = "?";

      if (nextPageToken === pagination.next_page_token)
        nextPageQueryParams += `&page_token=${nextPageToken}`;

      if (prevPageToken === pagination.previous_page_token) {
        nextPageQueryParams = "?";
        nextPageQueryParams += `&page_token=${prevPageToken}`;
      }

      if (selectedOption === "active-events") {
        nextPageQueryParams += "&status=active";

        const response = await axios.get(
          `${apiUrl}/calendly/scheduled_events${nextPageQueryParams}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        setEvents([...response.data.data.collection]);
        setPagination(response.data.data.pagination);
        return;
      }

      if (selectedOption === "asc-events") {
        nextPageQueryParams += "&sort=start_time:asc";

        const response = await axios.get(
          `${apiUrl}/calendly/scheduled_events${nextPageQueryParams}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        setEvents([...response.data.data.collection]);
        setPagination(response.data.data.pagination);
        return;
      }

      if (selectedOption === "desc-events") {
        nextPageQueryParams += "&sort=start_time:desc";

        const response = await axios.get(
          `${apiUrl}/calendly/scheduled_events${nextPageQueryParams}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        setEvents([...response.data.data.collection]);
        setPagination(response.data.data.pagination);
        return;
      }

      if (selectedOption === "canceled-events") {
        nextPageQueryParams += "&status=canceled";
        const response = await axios.get(
          `${apiUrl}/calendly/scheduled_events${nextPageQueryParams}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        setEvents([...response.data.data.collection]);
        setPagination(response.data.data.pagination);
        return;
      } else {
        const response = await axios.get(
          `${apiUrl}/calendly/scheduled_events${nextPageQueryParams}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        setEvents([...response.data.data.collection]);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error al traer los tipo de eventos:", error);
    }
  };

  const handleCancellation = async (event) => {
    event.preventDefault();

    const uuid = event.target.value.split("/")[4];

    const body = await JSON.stringify({ reason: reasonInput });

    await fetch(`/api/cancel_event/${uuid}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: body,
    }).then((res) => res.json());

    const deletedEvent = events.filter((event) => event.uri.includes(uuid));

    window.alert(
      `You have successfully canceled the following event: "${deletedEvent[0].name}" on ${deletedEvent[0].date} at ${deletedEvent[0].start_time_formatted}!`
    );
    window.location.reload();
  };

  const togglePopup = (event) => {
    setPopupOpen(!popupOpen);
    setEventUri(event.target.value);
    setReasonInput("");
  };

  const handleSelectedOptionChange = (value) => {
    setPaginationCount(0);
    setNextPageToken(false);
    setPrevPageToken(false);
    setSelectedOption(value);
  };
  useEffect(() => {
    if (isAuthenticatedWithCalendly) {
      getDataScheduleEvents();
    }
  }, [isAuthenticatedWithCalendly]);

  useEffect(() => {
    getDataScheduleEvents();
  }, [selectedOption, nextPageToken, prevPageToken]);

  const handleRedirect = () => {
    const currentUrl = window.location.href;
    const redirectUrl = encodeURIComponent(currentUrl);

    window.location.href = `${apiUrl}/oauth/calendly?userId=${auth.user.id}&companyId=${companyId}&redirect=${redirectUrl}`;
  };
  const handleChangeStatus = (status) => {
    const statusChange =
      status === "active"
        ? "activo"
        : status === "canceled"
        ? "cancelado"
        : "desactivado";
    return statusChange.toUpperCase();
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold">Reservaciones</h1>
      {/* <div className="bg-white p-4 shadow rounded">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
        />
      </div> */}
      {isAuthenticatedWithCalendly ? (
        <div>
          <h1 className="text-sm mb-4">Eventos de Calendly</h1>
          {/* Aquí puedes mostrar los eventos */}
          <div className="overflow-auto p-4 bg-white rounded-lg shadow-md">
            {events.length ? (
              <>
                <div className="mb-6">
                  <Select
                    defaultValue={selectedOption}
                    options={options}
                    placeholder="Choose Filter"
                    onChange={(event) => handleSelectedOptionChange(event)}
                  />
                </div>
                <div className="row">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="p-3 text-start">Nombre</th>
                        <th className="p-3 text-start">Fecha Reservada</th>
                        <th className="p-3 text-start">Inicio de reunión</th>
                        <th className="p-3 text-start">Fin de reunión</th>
                        <th className="p-3 text-start">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {events.map((event) => (
                        <tr key={event.uri}>
                          <td className="p-3">
                            <Link to={`/events/${event.uri.split("/")[4]}`}>
                              {event.name}
                            </Link>
                          </td>
                          <td className="p-3">
                            {dayjs(event.start_time).format("DD/MM/YYYY")}
                          </td>
                          <td className="p-3">
                            {dayjs(event.start_time).format("HH:mm:ss")}
                          </td>
                          <td className="p-3">
                            {dayjs(event.end_time).format("HH:mm:ss")}
                          </td>
                          <td className="p-3">
                            {" "}
                            {event.status === "active" ? (
                              <span className="px-3 py-1 text-xs rounded-full border-[1px] border-green-500 text-green-500 bg-white">
                                {handleChangeStatus(event.status)}
                              </span>
                            ) : (
                              <span className="px-3 py-1 text-xs rounded-full border-[1px] border-red-500 text-red-500 bg-white">
                                {handleChangeStatus(event.status)}
                              </span>
                            )}
                          </td>
                          {currentDateMillisec < Date.parse(event.start_time) &&
                            event.status === "active" && (
                              <td className="p-3">
                                <button
                                  className="toggle-btn"
                                  value={event.uri}
                                  onClick={togglePopup}
                                >
                                  Cancel Event
                                </button>
                              </td>
                            )}

                          {/* {popupOpen && event.uri === eventUri && (
                            <Popup
                              content={
                                <form>
                                  <label>
                                    <h5>Cancel Event</h5>
                                    <h6>"{event.name}"</h6>
                                    <h6>{event.date}</h6>
                                    <h6>
                                      {event.start_time_formatted}-
                                      {event.end_time_formatted}
                                    </h6>
                                    Reason:
                                    <textarea
                                      type="text"
                                      value={reasonInput}
                                      onChange={(event) =>
                                        setReasonInput(event.target.value)
                                      }
                                    />
                                  </label>
                                  <button
                                    value={event.uri}
                                    onClick={handleCancellation}
                                  >
                                    Yes, cancel
                                  </button>
                                </form>
                              }
                              handleClose={togglePopup}
                            />
                          )} */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pagination?.next_page_token && (
                  <div className="next-back-btns">
                    <button
                      className="px-3 py-2 rounded bg-dark-purple text-white text-sm"
                      onClick={() => {
                        setPaginationCount(paginationCount + 1);
                        setNextPageToken(pagination.next_page_token);
                        setPrevPageToken(false);
                      }}
                    >
                      Show Next
                    </button>
                  </div>
                )}
                {paginationCount > 0 && !popupOpen && (
                  <div className="next-back-btns">
                    <button
                      className="px-3 py-2 rounded bg-light-purple text-gray-900 text-sm"
                      onClick={() => {
                        setPaginationCount(paginationCount - 1);
                        setPrevPageToken(pagination.previous_page_token);
                      }}
                    >
                      Back
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{ textAlign: "center", paddingTop: "50" }}
              >{`has no scheduled events`}</div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => handleRedirect()}
          // onClick={() => getAuthentication()}
        >
          Conectar con Calendly
        </button>
      )}
    </div>
  );
};

export default Reservaciones;
