// src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../components/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Login = () => {
  const [viewPassword, setViewPassword] = useState(false);
  const { login, auth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Si hay un auth.user, decide redirigir según rol
  useEffect(() => {
    if (auth.user) {
      const role = auth.user.rol?.name;
      console.log("[Login.jsx] useEffect => Ya existe auth.user:", auth.user);
      console.log("[Login.jsx] useEffect => role =>", role);

      if (role === "superadmin") {
        navigate("/usuarios");
      } else if (role === "administrador") {
        navigate(`/manage/${auth.user.id}`);
      } else if (role === "employee") {
        navigate("/employee");
      } else {
        navigate("/contact-admin");
      }
    } else {
      console.log("[Login.jsx] useEffect => No hay auth.user todavía.");
    }
  }, [auth.user, navigate]);

  const handleViewPassword = () => {
    setViewPassword(!viewPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    console.log(
      "[Login.jsx] handleLogin => Intentando login con:",
      email,
      password
    );

    try {
      // Llama a login del AuthContext
      const result = await login(email, password);
      console.log("[Login.jsx] handleLogin => resultado login:", result);

      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      console.error(
        "[Login.jsx] handleLogin => Error inesperado al iniciar sesión:",
        err
      );
      setError("Ocurrió un error inesperado. Intente nuevamente.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Bloque de la imagen */}
      <div className="relative w-full h-1/2 md:w-2/3 md:h-full">
        <img
          className="object-cover w-full h-full"
          src="https://www.prosegur.com.pe/dam/jcr:b09e0c73-9185-469d-8e79-c315f0d344e6/admon%20restaurantes.jpg"
          alt="imagen fondo"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(18,19,21,0.9)] via-[rgba(184,161,72,0.9)] to-black opacity-90" />
        <img
          className="absolute top-5 right-5 z-20 w-20 h-20 md:w-32 md:h-32"
          src="https://imagenesrutalab.s3.us-east-1.amazonaws.com/growthsuite/growthsuitelogoblanco.png"
          alt="Growth Suite Logo"
        />
      </div>

      {/* Bloque del formulario */}
      <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col justify-center items-center px-6 bg-white">
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded w-full max-w-sm"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">GROWTHSUITE</h2>

          {error && (
            <h1 className="border p-2 border-red-500 text-red-500 rounded-full">
              {error}
            </h1>
          )}

          {/* Campo Email */}
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <div className="flex items-start">
              <div className="bg-gray-100 h-auto p-2">
                <FaUserCircle className="text-lg text-gray-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-2 border mb-4 bg-gray-200 text-gray-900 text-sm rounded"
                required
              />
            </div>
          </div>

          {/* Campo Password */}
          <label className="text-sm text-gray-500">Contraseña</label>
          <div className="flex items-start relative mb-4">
            <div className="bg-gray-100 h-auto p-2">
              <RiLockPasswordLine className="text-lg text-gray-500" />
            </div>
            <input
              type={viewPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full p-2 border bg-gray-200 text-gray-900 text-sm rounded"
              required
            />
            <div
              onClick={handleViewPassword}
              className="absolute right-0 top-0 cursor-pointer p-2"
            >
              {viewPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-dark-purple text-white p-2 rounded"
          >
            Iniciar sesión
          </button>

          <Link
            to="/login/identy"
            className="text-center flex justify-center text-gray-500 text-sm w-full my-4"
          >
            Olvidé la Contraseña
          </Link>
          <p className="text-sm text-gray-500 mt-2">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-black font-bold">
              Crea tu cuenta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
