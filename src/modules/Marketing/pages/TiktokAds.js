import React, { useEffect, useRef, useState } from "react";
import { Table, Card, Statistic, DatePicker } from "antd";
import dayjs from "dayjs";

import Chart from "chart.js/auto";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import { useAuth } from "../../../components/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";

const TiktokAds = () => {
  const { auth } = useAuth();
  const [data, setData] = useState([]);
  const { companyId } = useParams();
  const [filterData, setFilterData] = useState([]);
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    if (chartInstance) {
      chartInstance.destroy(); // Destruye el gráfico anterior antes de crear uno nuevo
    }

    // const ctx = chartRef.current.getContext("2d");
    // const newChart = new Chart(ctx, {
    //   type: "bar",
    //   data: {
    //     labels: data.map((item) => item.Campaña),
    //     datasets: [
    //       {
    //         label: "Clics",
    //         data: data.map((item) => item.Clics),
    //         backgroundColor: "rgba(75, 192, 192, 0.6)",
    //         borderColor: "rgba(75, 192, 192, 1)",
    //         borderWidth: 1,
    //       },
    //       {
    //         label: "Conversiones",
    //         data: data.map((item) => item.Conversiones),
    //         backgroundColor: "rgba(153, 102, 255, 0.6)",
    //         borderColor: "rgba(153, 102, 255, 1)",
    //         borderWidth: 1,
    //       },
    //     ],
    //   },
    //   options: {
    //     responsive: true,
    //     plugins: {
    //       legend: {
    //         position: "top",
    //       },
    //       title: {
    //         display: true,
    //         text: "Clics y Conversiones por Campaña",
    //       },
    //     },
    //   },
    // });

    // setChartInstance(newChart);
  }, [data]);
  // Estado para el rango de fechas
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);

  const apiUrl = process.env.REACT_APP_API_URL;
  // EVENTOS DE BUSQUEDA DE DATOS
  const searchDataAds = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/getTempTiktokAds/${companyId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      if (response.data.status === "success") {
        setData(response.data.data);
        setFilterData(response.data.data);
      } else {
        setData([]);
        setFilterData([]);
      }
    } catch (error) {
      console.error("Error al obtener los modulos:", error);
    }
  };
  useEffect(() => {
    // eslint-disable-next-line
    searchDataAds();
  }, [companyId]);

  // Tabla de columnas
  const columns = [
    { title: "Campaña", dataIndex: "nameCampaign", key: "nameCampaign" },
    {
      title: "Fecha de inicio",
      dataIndex: "startDate",
      key: "startDate",
      render: (value) => `${dayjs(value).format("DD/MM/YYYY HH:mm")}`,
    },
    {
      title: "Fecha de fin",
      dataIndex: "endDate",
      key: "Fecha de fin",
      render: (value) => `${dayjs(value).format("DD/MM/YYYY HH:mm")}`,
    },
    { title: "Activo", dataIndex: "statusActive", key: "Activo" },
    { title: "Finalizado", dataIndex: "statusRun", key: "Finalizado" },
    { title: "Conversiones", dataIndex: "conversions", key: "Conversiones" },
    {
      title: "Impresiones",
      dataIndex: "impressions",
      key: "Impresiones",
      render: (value) => `${Number(value).toLocaleString("en-US")}`,
    },
    { title: "Clicks", dataIndex: "clicks", key: "Clicks" },
    { title: "Resultados", dataIndex: "results", key: "Resultados" },
    { title: "Costo", dataIndex: "costo", key: "Costo" },
  ];
  // Resumen general
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
  const totalConversions = data.reduce(
    (sum, item) => sum + item.conversions,
    0
  );
  const totalImpressions = data.reduce(
    (sum, item) => sum + item.impressions,
    0
  );
  const avgCostPerConv =
    data.reduce((sum, item) => sum + item.costo, 0) / data.length;

  // Preparar datos para los gráficos
  const campaigns = data.map((item) => item.name_campaign);
  const clicks = data.map((item) => item.clicks);
  const conversions = data.map((item) => item.conversions);

  const clickChartData = {
    labels: campaigns,
    datasets: [
      {
        label: "Clics",
        data: clicks,
        backgroundColor: "#1677ff",
      },
    ],
  };

  const conversionChartData = {
    labels: campaigns,
    datasets: [
      {
        label: "Conversiones",
        data: conversions,
        backgroundColor: "#52c41a",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Campañas",
      },
    },
  };

  const [showFilterDate, setShowFilterDate] = useState(false);

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="font-bold">Tiktok Adersiting</h1>
        {/* Selector de rango de fechas */}
        <div className="mb-4 relative">
          <div>
            <h3
              onClick={() => setShowFilterDate(!showFilterDate)}
              className="mb-4 bg-white flex gap-3 items-center rounded shadow text-gray-900 hover:shadow-lg transition-all duration-300 cursor-pointer px-3 py-2 text-sm"
            >
              Selecciona un rango de fechas{" "}
              {showFilterDate ? (
                <AiFillCaretUp className="text-gray-900" />
              ) : (
                <AiFillCaretDown className="text-gray-900" />
              )}
            </h3>
            <div
              className={`${
                showFilterDate ? "flex" : "hidden"
              } absolute top-[105%] right-0 w-max`}
            >
              <DatePicker.RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
                allowClear={false}
                format="YYYY-MM-DD"
                defaultValue={[dayjs().subtract(30, "day"), dayjs()]}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="container mx-auto p-6 relative">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#69C9D0] text-white rounded-md p-6 shadow-sm">
              <span className="title ">Total de clicks</span>
              <p className="text-3xl">
                {Number(totalClicks).toLocaleString("en-US")}
              </p>
            </div>
            <div className="bg-[#EE1D52] text-white rounded-md p-6 shadow-sm">
              <span className="title ">Total de Impresioness</span>
              <p className="text-3xl">
                {Number(totalImpressions).toLocaleString("en-US")}
              </p>
            </div>
            <div className="bg-black text-white rounded-md p-6 shadow-sm">
              <span className="title ">Total de Conversiones</span>
              <p className="text-3xl">
                {Number(totalConversions).toLocaleString("en-US")}
              </p>
            </div>
            <div className="bg-white text-black rounded-md p-6 shadow-sm">
              <span className="title ">Costo Promedio/Conv.</span>
              <p className="text-3xl">
                ${Number(avgCostPerConv).toLocaleString("en-US")}
              </p>
            </div>
          </div>
          {/* Gráficos */}
          {/* Aquí se renderiza el gráfico */}
          {/* <canvas ref={chartRef} height="100"></canvas> */}

          {/* Tabla */}
          <Table
            dataSource={data}
            columns={columns}
            bordered
            title={() => "Resumen de Campañas"}
            pagination={{ pageSize: 5 }}
          />
        </div>
      </div>
    </div>
  );
};

export default TiktokAds;
