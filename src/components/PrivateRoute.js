import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PrivateRoute({ roles = [] }) {
  const { auth, loading } = useAuth();

  // Mientras estamos verificando el token/usuario, podrías mostrar un spinner:
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si no hay usuario (o no hay token), redirige a login
  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  // Si tiene un rol que no coincide con la lista permitida, redirige a “forbidden”
  if (roles.length > 0 && !roles.includes(auth.user.rol?.name)) {
    return <Navigate to="/forbidden" replace />;
  }

  // Todo OK => renderiza las rutas anidadas
  return <Outlet />;
}
