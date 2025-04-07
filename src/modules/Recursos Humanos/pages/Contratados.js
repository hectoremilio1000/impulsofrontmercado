import React from "react";
import { Table } from "antd";

const data = [
  {
    key: "1",
    puesto: "GERENTE",
    nombre: "DULCE",
    salarioMensual: 15000,
    salarioQuincenal: 7500,
    salarioDiario: 500,
    cucharas: 10,
    porPagar: 5500,
    observacion: "RESTAN 1",
  },
  {
    key: "2",
    puesto: "SUBGERENTE",
    nombre: "ROBERTO",
    salarioMensual: 15000,
    salarioQuincenal: 7500,
    salarioDiario: 500,
    cucharas: 10,
    porPagar: 9500,
    observacion: "MENOS 1",
  },
  {
    key: "3",
    puesto: "JEFE DE COCINA",
    nombre: "FERNANDO",
    salarioMensual: 19000,
    salarioQuincenal: 9500,
    salarioDiario: 633,
    porPagar: 4221,
  },
  {
    key: "4",
    puesto: "COCINERO B",
    nombre: "KI YOUGH",
    salarioMensual: 8500,
    salarioQuincenal: 4250,
    salarioDiario: 283,
    porPagar: 4750,
  },
  {
    key: "5",
    puesto: "BARMAN",
    nombre: "MIGUE",
    salarioMensual: 8000,
    salarioQuincenal: 4000,
    salarioDiario: 267,
    cucharas: 5,
    porPagar: 4266,
    observacion: "PAGO 8 H",
  },
  // Agrega más registros basados en tu Excel
];

// Define las columnas
const columns = [
  {
    title: "Puesto",
    dataIndex: "puesto",
    key: "puesto",
  },
  {
    title: "Nombre",
    dataIndex: "nombre",
    key: "nombre",
  },
  {
    title: "Salario Mensual",
    dataIndex: "salarioMensual",
    key: "salarioMensual",
  },
  {
    title: "Salario Quincenal",
    dataIndex: "salarioQuincenal",
    key: "salarioQuincenal",
  },
  {
    title: "Salario Diario",
    dataIndex: "salarioDiario",
    key: "salarioDiario",
  },
  {
    title: "Cucharas",
    dataIndex: "cucharas",
    key: "cucharas",
  },
  {
    title: "Por Pagar",
    dataIndex: "porPagar",
    key: "porPagar",
  },
  {
    title: "Observación",
    dataIndex: "observacion",
    key: "observacion",
  },
];

const Contratados = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">
        Empleados Contratados
      </h1>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        className="shadow-lg rounded-lg"
      />
    </div>
  );
};

export default Contratados;
