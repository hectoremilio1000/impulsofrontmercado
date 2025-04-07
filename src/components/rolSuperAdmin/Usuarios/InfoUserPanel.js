// file: src/components/rolSuperAdmin/Usuarios/InfoUserPanel.jsx
import React from "react";
import { Descriptions } from "antd";
import dayjs from "dayjs";

/**
 * Mapea rolId a un nombre más friendly.
 * Ajusta según los IDs y nombres de roles reales en tu sistema.
 */
const roleMap = {
  1: "superadmin",
  2: "admin",
  3: "prospect",
  4: "employee",
};

function InfoUserPanel({ user }) {
  if (!user) {
    return <p>No hay datos del usuario.</p>;
  }

  // Determinar el nombre “friendly” del rol
  const rolLabel = roleMap[user.rolId] || "Desconocido";

  // Lógica para mostrar el que creó al usuario
  // Si user.creator existe, mostramos el .name, de lo contrario mostrará "ID: user.createdBy"
  const creadoPorLabel = user.creator
    ? user.creator.name
    : `ID: ${user.createdBy || "N/A"}`;

  /**
   * Lógica para mostrar las empresas dependiendo del rol:
   * - rol=2 => "admin": user.companies
   * - rol=4 => "employee": user.employees => cada uno con company + position
   */
  let empresasLabel = "N/A";
  if (user.rolId === 2) {
    // Admin => user.companies (array)
    if (user.companies && user.companies.length > 0) {
      empresasLabel = user.companies.map((c) => c.name).join(", ");
    }
  } else if (user.rolId === 4) {
    // Empleado => user.employees (array), cada employee -> company y position
    if (user.employees && user.employees.length > 0) {
      empresasLabel = user.employees
        .map((emp) => {
          const coName = emp.company ? emp.company.name : "¿?";
          const pos = emp.position || "N/A";
          return `${coName} (Puesto: ${pos})`;
        })
        .join(", ");
    }
  } else {
    // Otros roles => “N/A” o si deseas mostrar user.companies de todas formas
    if (user.companies && user.companies.length > 0) {
      empresasLabel = user.companies.map((c) => c.name).join(", ");
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <Descriptions
        bordered
        column={2}
        size="small"
        labelStyle={{ fontWeight: "bold" }}
      >
        {/* ID */}
        <Descriptions.Item label="ID">{user.id}</Descriptions.Item>

        {/* Nombre */}
        <Descriptions.Item label="Nombre">
          {user.name || "N/A"}
        </Descriptions.Item>

        {/* Email */}
        <Descriptions.Item label="Email">
          {user.email || "N/A"}
        </Descriptions.Item>

        {/* Rol */}
        <Descriptions.Item label="Rol">{rolLabel}</Descriptions.Item>

        {/* Activo */}
        <Descriptions.Item label="Activo">
          {user.isActive ? "Sí" : "No"}
        </Descriptions.Item>

        {/* WhatsApp */}
        <Descriptions.Item label="Whatsapp">
          {user.whatsapp || "N/A"}
        </Descriptions.Item>

        {/* Fecha de alta */}
        <Descriptions.Item label="Fecha de Alta">
          {user.createdAt
            ? dayjs(user.createdAt).format("DD/MM/YYYY HH:mm")
            : "N/A"}
        </Descriptions.Item>

        {/* Última actualización */}
        <Descriptions.Item label="Última Actualización">
          {user.updatedAt
            ? dayjs(user.updatedAt).format("DD/MM/YYYY HH:mm")
            : "N/A"}
        </Descriptions.Item>

        {/* Creado por => si user.creator, mostrar su nombre */}
        <Descriptions.Item label="Creado por">
          {creadoPorLabel}
        </Descriptions.Item>

        {/* Empresas => depende del rol */}
        <Descriptions.Item label="Empresas">{empresasLabel}</Descriptions.Item>

        {/* Ejemplo: Token de reseteo (opcional) */}
        {user.passwordResetToken && (
          <Descriptions.Item label="Token Reseteo">
            {user.passwordResetToken}
          </Descriptions.Item>
        )}
      </Descriptions>
    </div>
  );
}

export default InfoUserPanel;
