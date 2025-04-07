import React, { useState } from "react";
import { Table, Input } from "antd";

/**
 * Ejemplo de datos para manuales de servicio.
 * Puedes editar o expandir este arreglo según los puestos de tu restaurante.
 */
const manualesData = [
  {
    key: "1",
    puesto: "Cocinero",
    manual: `
      - Preparar los alimentos siguiendo las recetas y estándares de calidad.
      - Mantener la limpieza y organización de la cocina.
      - Coordinar con el jefe de cocina los insumos necesarios.
    `,
  },
  {
    key: "2",
    puesto: "Mesero",
    manual: `
      - Atender y recibir a los clientes cordialmente.
      - Anotar y confirmar pedidos de manera clara.
      - Mantener el área de servicio limpia y ordenada.
    `,
  },
  {
    key: "3",
    puesto: "Hostess",
    manual: `
      - Dar la bienvenida a los clientes y asignar mesas.
      - Manejar la lista de espera y reservar mesas.
      - Comunicar al cliente los tiempos de espera y menú del día.
    `,
  },
  {
    key: "4",
    puesto: "Bartender",
    manual: `
      - Preparar bebidas y cocteles según recetas.
      - Mantener limpio y abastecido el área de bar.
      - Controlar inventario de licores y bebidas.
    `,
  },
  {
    key: "5",
    puesto: "Gerente",
    manual: `
      - Supervisar todas las áreas del restaurante.
      - Manejar costos, inventarios y personal.
      - Resolver problemas y garantizar la satisfacción del cliente.
    `,
  },
  {
    key: "6",
    puesto: "Repostero",
    manual: `
      - Preparar postres, panes y repostería en general.
      - Asegurar la calidad y presentación de los productos.
      - Mantener la limpieza de su estación de trabajo.
    `,
  },
  {
    key: "7",
    puesto: "Ayudante de Cocina",
    manual: `
      - Asistir al cocinero en la preparación de alimentos.
      - Picar y preparar ingredientes básicos.
      - Mantener orden y limpieza en la cocina.
    `,
  },
  {
    key: "8",
    puesto: "Lavaloza",
    manual: `
      - Lavar y desinfectar platos, utensilios y ollas.
      - Mantener la cocina con los utensilios necesarios.
      - Apoyar en la limpieza general y evitar acumulaciones de vajilla.
    `,
  },
  {
    key: "9",
    puesto: "Cajero",
    manual: `
      - Cobrar y manejar el dinero de las ventas.
      - Generar facturas o tickets para los clientes.
      - Realizar cortes de caja y reportes de ventas.
    `,
  },
];

/**
 * Definimos las columnas para la tabla de Ant Design.
 * - dataIndex apunta a la propiedad de cada objeto en el arreglo.
 */
const columns = [
  {
    title: "Puesto",
    dataIndex: "puesto",
    key: "puesto",
    // Para que la columna pueda utilizarse en el filtro de búsqueda:
    filterDropdown: false,
  },
  {
    title: "Manual de Servicio",
    dataIndex: "manual",
    key: "manual",
  },
];

function ManualesRRHHAdmin() {
  // Estado para almacenar el texto de búsqueda
  const [searchText, setSearchText] = useState("");

  // Filtrar la data dependiendo del texto introducido
  const filteredData = manualesData.filter((item) => {
    return (
      item.puesto.toLowerCase().includes(searchText.toLowerCase()) ||
      item.manual.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manuales de Servicio</h1>

      {/* Input de búsqueda con Ant Design y clases de Tailwind */}
      <Input
        placeholder="Buscar por puesto o contenido..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="mb-4 w-full md:w-1/2"
      />

      {/* Tabla con Ant Design */}
      <Table
        dataSource={filteredData}
        columns={columns}
        pagination={{ pageSize: 5 }}
        bordered
      />
    </div>
  );
}

export default ManualesRRHHAdmin;
