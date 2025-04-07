import React from "react";
import { Descriptions } from "antd";
import dayjs from "dayjs";

/**
 * Mapea rolId a un nombre más friendly.
 * Ajusta según tus IDs y nombres de roles reales.
 */
const roleMap = {
  1: "superadmin",
  2: "admin",
  3: "prospect",
  // etc.
};

/**
 * Muestra la información general del usuario en un Descriptions.
 */
function InfoUserPanel({ user }) {
  if (!user) {
    return <p>No hay datos del usuario.</p>;
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <Descriptions
        bordered
        column={2}
        size="small"
        labelStyle={{ fontWeight: "bold" }}
      >
        <Descriptions.Item label="ID">{user.id}</Descriptions.Item>

        <Descriptions.Item label="Nombre">
          {user.name || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Email">
          {user.email || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Rol">
          {roleMap[user.rolId] || "Desconocido"}
        </Descriptions.Item>

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

        {/* Si quieres mostrar quién lo creó */}
        <Descriptions.Item label="Creado por (UserID)">
          {user.createdBy || "N/A"}
        </Descriptions.Item>

        {/* Si quisieras mostrar el token de reseteo (solo de ejemplo) */}
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
