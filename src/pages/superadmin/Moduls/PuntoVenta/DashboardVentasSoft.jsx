/*  src/pages/superadmin/Moduls/PuntoVenta/DashboardVentasSoft.jsx  */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Button,
  DatePicker,
  message,
  Select,
  Spin,
  Table,
  Radio,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import axios from "axios";
import { useAuth } from "../../../../components/AuthContext";

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Group: RadioGroup, Button: RadioBtn } = Radio;

/* ─────────────────── Constantes ─────────────────── */
const TOKEN_KEY = "token";
const QUICK_RANGES = [
  {
    label: "Hoy",
    get: () => ({
      from: dayjs().format("YYYY-MM-DD"),
      to: dayjs().format("YYYY-MM-DD"),
    }),
  },
  {
    label: "Ayer",
    get: () => ({
      from: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
      to: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    }),
  },
  {
    label: "Últimos 7",
    get: () => ({
      from: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
      to: dayjs().format("YYYY-MM-DD"),
    }),
  },
  {
    label: "Últimos 30",
    get: () => ({
      from: dayjs().subtract(29, "day").format("YYYY-MM-DD"),
      to: dayjs().format("YYYY-MM-DD"),
    }),
  },
  {
    label: "Mes actual",
    get: () => ({
      from: dayjs().startOf("month").format("YYYY-MM-DD"),
      to: dayjs().format("YYYY-MM-DD"),
    }),
  },
  {
    label: "Mes anterior",
    get: () => ({
      from: dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
      to: dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
    }),
  },
];

/* ─────────────────── Componente ─────────────────── */
function DashboardVentasSoft() {
  const { auth } = useAuth();
  const API_ROOT = process.env.REACT_APP_API_URL;

  /* ---------- state ---------- */
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState(null);

  // modo Periodo
  const [range, setRange] = useState(QUICK_RANGES[0].get());

  // modo Turno
  const [mode, setMode] = useState("turno"); // "turno" | "periodo"
  const [shiftDate, setShiftDate] = useState(dayjs()); // día del turno
  const [shiftHours, setShiftHours] = useState([
    dayjs("06:00", "HH:mm"),
    dayjs("05:59", "HH:mm"),
  ]);

  const [overview, setOverview] = useState([]);
  const [products, setProducts] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [mix, setMix] = useState({ total: 0, mix: {} });
  const [loading, setLoading] = useState(false);

  /* ---------- helpers ---------- */
  const axiosAuth = useMemo(
    () =>
      axios.create({
        baseURL: API_ROOT,
        headers: {
          Authorization: `Bearer ${
            auth.token ?? localStorage.getItem(TOKEN_KEY)
          }`,
        },
      }),
    [API_ROOT, auth.token]
  );

  /* ---------- data fetchers ---------- */
  const fetchCompanies = useCallback(async () => {
    try {
      const { data } = await axiosAuth.get("/companies");
      if (data.status === "success") {
        setCompanies(data.data);
        if (data.data.length) setCompanyId(data.data[0].id);
      } else {
        message.error("Error al obtener las empresas");
      }
    } catch (err) {
      console.error(err);
      message.error("Error al obtener las empresas");
    }
  }, [axiosAuth]);

  const fetchKpis = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    try {
      let params = { company_id: companyId };

      if (mode === "turno") {
        const ISO = "YYYY-MM-DD[T]HH:mm:ss";
        const [startHour, endHour] = shiftHours;

        const from = shiftDate
          .hour(startHour.hour())
          .minute(startHour.minute())
          .second(0)
          .format(ISO);

        const to = shiftDate
          .add(startHour.isBefore(endHour) ? 0 : 1, "day") // cruza medianoche
          .hour(endHour.hour())
          .minute(endHour.minute())
          .second(59)
          .format(ISO);

        params = { ...params, from, to };
      } else {
        params = { ...params, ...range };
      }

      /* 🐞  LOG params que viajarán al backend */
      console.log("🐞 [Dashboard] params →", params);

      const [{ data: ov }, { data: prod }, { data: w }, { data: pm }] =
        await Promise.all([
          axiosAuth.get("/ventas-softs/overview", { params }),
          axiosAuth.get("/ventas-softs/products", { params }),
          axiosAuth.get("/ventas-softs/waiters", { params }),
          axiosAuth.get("/ventas-softs/payment-mix", { params }),
        ]);

      /* 🐞  LOG respuestas crudas */
      console.log("🐞 [Dashboard] overview  →", ov);
      console.log("🐞 [Dashboard] products  →", prod);
      console.log("🐞 [Dashboard] waiters   →", w);
      console.log("🐞 [Dashboard] paymentMx →", pm);

      setOverview(ov.data || []);
      setProducts(prod.data || []);
      setWaiters(w.data || []);
      setMix(pm.data || { total: 0, mix: {} });
    } catch (err) {
      console.error(err);
      message.error("Error al obtener KPIs");
    } finally {
      setLoading(false);
    }
  }, [axiosAuth, companyId, range, mode, shiftDate, shiftHours]);

  /* ---------- effects ---------- */
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  /* ---------- datos de gráfica ---------- */
  const pieData = useMemo(
    () =>
      Object.entries(mix.mix).map(([k, v]) => ({
        name: k,
        value: +(v * 100).toFixed(2),
      })),
    [mix]
  );

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

  /* ---------- render ---------- */
  return (
    <div className="p-6 space-y-6">
      {/* filtros */}
      <div className="flex flex-wrap items-end gap-4">
        {/* empresa */}
        <Select
          style={{ minWidth: 200 }}
          value={companyId}
          onChange={(id) => {
            console.log("🐞 companyId changed →", id); // 🐞
            setCompanyId(id);
          }}
          placeholder="Selecciona empresa"
        >
          {companies.map((c) => (
            <Option key={c.id} value={c.id}>
              {c.name}
            </Option>
          ))}
        </Select>

        {/* modo Turno / Periodo */}
        <RadioGroup
          value={mode}
          onChange={(e) => {
            console.log("🐞 mode →", e.target.value); // 🐞
            setMode(e.target.value);
          }}
        >
          <RadioBtn value="turno">Turno</RadioBtn>
          <RadioBtn value="periodo">Periodo</RadioBtn>
        </RadioGroup>

        {mode === "turno" ? (
          <>
            {/* fecha del turno */}
            <DatePicker
              value={shiftDate}
              onChange={(d) => {
                console.log("🐞 shiftDate →", d?.format()); // 🐞
                setShiftDate(d);
              }}
              format="YYYY-MM-DD"
            />

            {/* horario */}
            <TimePicker.RangePicker
              value={shiftHours}
              format="HH:mm"
              onChange={(vals) => {
                console.log(
                  "🐞 shiftHours →",
                  vals?.map((v) => v?.format("HH:mm"))
                ); // 🐞
                setShiftHours(vals);
              }}
            />
          </>
        ) : (
          <>
            {/* rangos rápidos */}
            {QUICK_RANGES.map((q) => (
              <Button
                key={q.label}
                type={
                  q.get().from === range.from && q.get().to === range.to
                    ? "primary"
                    : "default"
                }
                onClick={() => {
                  console.log("🐞 quick range →", q.label); // 🐞
                  setRange(q.get());
                }}
              >
                {q.label}
              </Button>
            ))}

            {/* rango manual */}
            <RangePicker
              value={[dayjs(range.from), dayjs(range.to)]}
              onChange={(dates) => {
                const newRange = {
                  from: dates?.[0]?.format("YYYY-MM-DD"),
                  to: dates?.[1]?.format("YYYY-MM-DD"),
                };
                console.log("🐞 manual range →", newRange); // 🐞
                setRange(newRange);
              }}
            />
          </>
        )}
      </div>

      {/* contenido */}
      {loading ? (
        <div className="text-center py-10">
          <Spin />
        </div>
      ) : (
        companyId && (
          <>
            {/* totales por turno */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {overview.map((t) => (
                <div
                  key={t.apertura}
                  className="p-4 rounded-xl shadow bg-white"
                >
                  <h3 className="font-semibold text-blue-600 mb-2">
                    Turno {dayjs(t.apertura).format("DD MMM")} –{" "}
                    {dayjs(t.cierre).format("HH:mm")}
                  </h3>
                  <p>
                    Total venta:{" "}
                    <strong>${Number(t.total_venta).toLocaleString()}</strong>
                  </p>
                  <p>
                    Descuentos: ${Number(t.total_descuento).toLocaleString()}
                  </p>
                  <p>Items: {t.total_items}</p>
                </div>
              ))}
            </div>

            {/* productos y meseros */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Table
                rowKey="name_producto"
                columns={[
                  { title: "Producto", dataIndex: "name_producto" },
                  { title: "Cantidad", dataIndex: "qty" },
                  {
                    title: "Importe",
                    dataIndex: "importe",
                    render: (v) => `$${Number(v).toLocaleString()}`,
                  },
                ]}
                dataSource={products}
                pagination={false}
                size="small"
              />

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={waiters.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name_mesero" hide />
                  <YAxis />
                  <Tooltip
                    formatter={(v) => `$${Number(v).toLocaleString()}`}
                  />
                  <Bar dataKey="importe" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* mix de métodos de pago */}
            <div className="p-4 rounded-xl shadow bg-white">
              <h3 className="font-semibold mb-3">
                Mix métodos de pago (total ${mix.total.toLocaleString()})
              </h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie dataKey="value" data={pieData} label>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}

export default DashboardVentasSoft;
