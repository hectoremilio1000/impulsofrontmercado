import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../../components/AuthContext";
import axios from "axios";
import { BiArrowFromLeft, BiArrowFromRight } from "react-icons/bi";

const EventType = () => {
  const { auth } = useAuth();
  const [eventType, setEventType] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [date, setDate] = useState(new Date());
  const [eventTypesSlots, seEventTypesSlots] = useState([]);
  const [eventUri, setEventUri] = useState();

  const { companyId, idSede, idModulo } = useParams();

  const { uuid } = useParams();

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
          const response = await axios.get(
            `${apiUrl}/calendly/event_types/${uuid}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            }
          );
          console.log(response);
          const newData = response.data.data?.resource;
          setEventType(newData);
          setEventUri(newData.uri);
          setLoadingData(true);
        } catch (error) {
          console.error("Error al traer los tipo de eventos:", error);
          setLoadingData(true);
        }
      };

      getEventTypes();
    }
  }, [isAuthenticatedWithCalendly]);

  return (
    <div className="event-container">
      <Link
        to={"./../../"}
        className="px-3 py-2 rounded bg-white font-bold text-sm inline-flex items-center gap-4"
      >
        <BiArrowFromRight /> Regresar
      </Link>
      {loadingData ? (
        <div className="p-6 bg-white rounded my-6">
          <p>{`Last updated ${eventType.last_updated}`}</p>
          <h5 className="text-3xl font-bold my-6">Evento:"{eventType.name}"</h5>
          <div className="flex flex-col gap-4">
            <p className="event-status">
              <strong>Status: </strong>
              {eventType.active ? "Active" : "Deactivated"}
            </p>
            {eventType.active === false && (
              <p>
                <strong>Deleted: </strong>
                {eventType.deleted_at &&
                  new Date(new Date(eventType.deleted_at).getTime())}
              </p>
            )}
            <p className="event-type-kind">
              <strong>Type: </strong>
              {eventType.kind && eventType.kind}
            </p>
            <div className="event-type-custom-questions">
              <strong>Custom Questions: </strong>
              {eventType.custom_questions &&
                eventType.custom_questions.map((question) => (
                  // It doesn't increment correctly with an ol, so I've done it this way (below) to create a numbered list.
                  <p key={question.position}>{`${question.position + 1}. ${
                    question.name
                  }`}</p>
                ))}
            </div>
            <p className="event-duration">
              <strong>Duration: </strong>
              {`${eventType.duration} minutes`}
            </p>
            <Link
              to={`/manage/${companyId}/sede/${idSede}/modules/${idModulo}/reservations/event_type_available_times?event_type=${eventUri}&`}
            >
              <p className="bg-dark-purple text-white p-3 inline-block">
                Consultar Disponibilidad
              </p>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white rounded my-6 items-center justify-center">
          Cargando ...
        </div>
      )}
    </div>
  );
};
export default EventType;
