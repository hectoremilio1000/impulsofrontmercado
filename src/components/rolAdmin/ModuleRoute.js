// src/components/rolAdmin/ModuleRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

function ModuleRoute({ moduleId }) {
  const { auth } = useAuth();

  // Obtenemos los módulos que el usuario tiene en su suscripción
  const modules = auth?.user?.subscription?.modules || [];
  console.log("[ModuleRoute] Revisando moduleId=", moduleId);
  console.log("[ModuleRoute] modules del user =>", modules);

  // Verificamos si el array de módulos incluye alguno con el ID que necesitamos
  const hasModule = modules.some((m) => m.id === moduleId);
  console.log("[ModuleRoute] ¿tiene el módulo?", hasModule);

  if (!hasModule) {
    console.warn("[ModuleRoute] ¡No tiene acceso! Redirigiendo a /forbidden");
    return <Navigate to="/forbidden" />;
  }

  // Si sí tiene el módulo, renderizamos la ruta hija
  console.log("[ModuleRoute] ¡Sí tiene el módulo! Renderizando <Outlet />");
  return <Outlet />;
}

export default ModuleRoute;
