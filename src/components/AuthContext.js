// src/components/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(true);

  // Objeto "auth" para token y user
  const [auth, setAuth] = useState({
    token: sessionStorage.getItem("token") || null,
    user: null,
  });

  /**
   * login(email, password):
   * - POST /login
   * - si responde { token }, guardar en sessionStorage
   * - fetchMe(token) para obtener user
   */
  const login = async (email, password) => {
    console.log(
      "[AuthContext] login() => email:",
      email,
      " password:",
      password
    );
    try {
      const res = await axios.post(`${apiUrl}/login`, { email, password });
      const data = res.data;
      // res.data => { status: 'success', token: '...', expires_at: '...' }
      console.log("[AuthContext] login() => Respuesta del servidor:", data);

      // Guardar token en sessionStorage
      sessionStorage.setItem("token", data.token);

      // Llamar fetchMe para poblar auth.user
      await fetchMe(data.token);

      console.log("[AuthContext] login() => Login finalizado OK.");
      return { success: true };
    } catch (error) {
      console.error("[AuthContext] login() => Error en login:", error);

      if (error.code === "ERR_NETWORK") {
        return {
          success: false,
          message: "No se pudo conectar al servidor. Revisa tu conexión.",
        };
      } else if (error.response) {
        return {
          success: false,
          message: error.response.data.message || "Error en las credenciales.",
        };
      } else {
        return {
          success: false,
          message: "Error desconocido al iniciar sesión.",
        };
      }
    }
  };

  /**
   * fetchMe(token):
   * - GET /me con Authorization: Bearer <token>
   */
  const fetchMe = async (token) => {
    console.log("[AuthContext] fetchMe() => usando token:", token);
    try {
      const res = await axios.get(`${apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("[AuthContext] fetchMe() => Respuesta /me:", res.data);

      setAuth((prev) => ({
        ...prev,
        user: res.data.user, // { ...usuario }
        token,
      }));
    } catch (error) {
      console.error("[AuthContext] fetchMe() => Error:", error);
      // Si token inválido, forzamos logout
      logout();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Al montar, si sessionStorage tiene un token, fetchMe(token),
   * de lo contrario => setLoading(false)
   */
  useEffect(() => {
    console.log("[AuthContext] useEffect => Montando AuthProvider...");
    if (auth.token) {
      console.log(
        "[AuthContext] useEffect => Hay token en sessionStorage:",
        auth.token
      );
      fetchMe(auth.token);
    } else {
      console.log("[AuthContext] useEffect => No hay token, loading=false");
      setLoading(false);
    }
  }, [auth.token]);

  /**
   * logout:
   * - remueve token y user del state
   * - sessionStorage.removeItem
   */
  const logout = () => {
    console.warn("[AuthContext] logout() => Saliendo de la cuenta...");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para consumir el contexto
export const useAuth = () => useContext(AuthContext);
