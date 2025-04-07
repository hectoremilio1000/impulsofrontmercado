import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Campaigns = () => {
  const { accountId } = useParams();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    axios
      .get(`${apiUrl}/getCampaigns/${accountId}`, {
        withCredentials: true,
      })
      .then((response) => {
        setCampaigns(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [accountId]);

  if (loading) {
    return <div>Cargando campañas...</div>;
  }

  return (
    <div className="p-6">
      <h1>Campañas de la Cuenta {accountId}</h1>

      <table className="bg-white shadow">
        <thead>
          <tr>
            <th className="p-2">Nombre de la Campaña</th>
            <th className="p-2">ID de la Campaña</th>
            <th className="p-2">Fecha de Inicio</th>
            <th className="p-2">Fecha de Fin</th>
            <th className="p-2">Impresiones Activas</th>
            <th className="p-2">Conversiones Totales</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.campaign.id}>
              <td className="p-2">{campaign.campaign.name}</td>
              <td className="p-2">{campaign.campaign.id}</td>
              <td className="p-2">{campaign.campaign.start_date}</td>
              <td className="p-2">{campaign.campaign.end_date}</td>
              <td className="p-2">
                {campaign.metrics.active_view_impressions}
              </td>
              <td className="p-2">{campaign.metrics.all_conversions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Campaigns;
