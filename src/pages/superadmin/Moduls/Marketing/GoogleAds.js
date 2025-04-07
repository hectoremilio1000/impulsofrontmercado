import axios from "axios";
import React, { useEffect, useState } from "react";

const GoogleAds = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    axios
      .get(`${apiUrl}/getAccounts`, { withCredentials: true })
      .then((response) => {
        setAccounts(response.data ? response.data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleConnect = () => {
    window.location.href = `${apiUrl}/googleautorize`;
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (accounts.length === 0) {
    return (
      <div className="p-6">
        <h1>Google Ads</h1>
        <button
          className="px-3 py-2 rounded text-white bg-dark-purple text-sm font-bold"
          onClick={handleConnect}
        >
          Conecta tu cuenta de Google Ads
        </button>
      </div>
    );
  }
  return (
    <div className="p-6">
      <h1>Google Ads - Cuentas</h1>
      <ul className="flex flex-col gap-4 my-4">
        {accounts.map((account, index) => (
          <li
            key={index}
            className="shadow rounded p-2 text'sm font-bold bg-white"
          >
            <a
              href={`/adsgoogle/account/${account.customer_client.id}/campaigns`}
            >
              {account.customer_client.descriptive_name}{" "}
              {account.customer_client.id}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoogleAds;
