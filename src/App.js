// src/App.js
import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login/Login";
// import Modules from "./pages/superadmin/Moduls/Index";
import Plans from "./pages/superadmin/Plans";

import Dashboard from "./pages/superadmin/Dashboard";
import ForbiddenPage from "./pages/ForbiddenPage";

// import Prospects from "./pages/superadmin/Prospects";
// import LayoutAdmin from "./components/rolAdmin/Layout";
import NotFoundPage from "./pages/NotFoundPage";
import Identy from "./pages/Login/Identy";
// import Campaigns from "./pages/superadmin/Campaigns";
import ContactAdminPage from "./pages/ContactAdminPage";

// import LlenarEncuestaProspect from "./pages/superadmin/LlenarEncuestaProspect";
// import Recomendaciones from "./pages/superadmin/Recomendaciones";
// import Exam from "./pages/Exam";
import RegisterProspect from "./pages/Login/Register";
import ResetPassword from "./pages/Login/ResetPassword";
import LayoutAdminAntd from "./components/rolAdmin/LayoutAdminAntd";
import LayoutSuperAdminAntd from "./components/rolSuperAdmin/LayoutSuperAdminAntd";

//SUPERADMIN

//USUARIOS
import Usuarios from "./pages/superadmin/Usuarios/Usuarios";
import UsuariosDetail from "./pages/superadmin/Usuarios/UsuariosDetail";

//CLIENTES
import Clientes from "./pages/superadmin/Clientes/Clientes";
import ClientesDetail from "./pages/superadmin/Clientes/ClientesDetail";

//MODULES
import Modules from "./pages/superadmin/Moduls/Modules";

//COMPAÑIAS
import Companies from "./pages/superadmin/Companies/Companies";

//COMPAÑIAS
import Posiciones from "./pages/superadmin/Posiciones/Posiciones";

//MODULO AYUDA IA SUPERADMIN
import AyudaIA from "./pages/superadmin/Moduls/AyudaIA/AyudaIA";
import RecomendacionAI from "./pages/superadmin/Moduls/AyudaIA/Recomendacion";
import AyudaIAForm from "./pages/superadmin/Moduls/AyudaIA/AyudaIAForm";
import PanelIA from "./pages/superadmin/Moduls/AyudaIA/PanelIA";

//MÓDULO SISTEMA WEB SUPERADMIN
import SistemaWeb from "./pages/superadmin/Moduls/SistemaWeb/TicketsWeb";
import PanelSistemaWeb from "./pages/superadmin/Moduls/SistemaWeb/PanelSistemaWeb";

//MÓDULO MONITOREO SUPERADMIN
import SolicitudMonitoreo from "./pages/superadmin/Moduls/Monitoreo/SolicitudMonitoreo";
import PanelMonitoreo from "./pages/superadmin/Moduls/Monitoreo/PanelMonitoreo";

//Módulo RRHH SUPERADMIN
import PanelRRHH from "./pages/superadmin/Moduls/RRHH/Empleados/PanelRRHH";
import ContratacionesRRHH from "./pages/superadmin/Moduls/RRHH/Contrataciones/ContratacionesRRHH";
import ExamenesRRHH from "./pages/superadmin/Moduls/RRHH/Empleados/ExamenesRRHH";
import ResultadosRRHH from "./pages/superadmin/Moduls/RRHH/ResultadosExamenes/ResultadosRRHH";
import ManualesRRHH from "./pages/superadmin/Moduls/RRHH/Manuales/PanelManualesRRHH";
import PanelCheckListSuperAdmin from "./pages/superadmin/Moduls/RRHH/CheckList/PanelChecklistsRRHH";

import TrainingIndexRRHH from "./pages/superadmin/Moduls/RRHH/TrainingIndexRRHH";
import TrainingPathsListRRHH from "./pages/superadmin/Moduls/RRHH/TrainingPathsListRRHH";
import EmployeeTrainingDetailRRHH from "./pages/superadmin/Moduls/RRHH/EmployeeTrainingDetailRRHH";
import AssignPathFormRRHH from "./pages/superadmin/Moduls/RRHH/AssignPathFormRRHH";

//marketing módulos SUPERADMIN
import TicketsMarketing from "./pages/superadmin/Moduls/Marketing/TicketsMarketing";
import PanelMarketing from "./pages/superadmin/Moduls/Marketing/PanelMarketing";

//módulo Punto de venta SUPERADMIN
import PanelPuntoVenta from "./pages/superadmin/Moduls/PuntoVenta/PanelPuntoVenta";
import TicketsPuntoVenta from "./pages/superadmin/Moduls/PuntoVenta/TicketsPuntoVenta";

//módulo Lealtad SUPERADMIN
import PanelLealtad from "./pages/superadmin/Moduls/Lealtad/PanelLealtad";
import TiposLealtad from "./pages/superadmin/Moduls/Lealtad/TiposLealtad";
import SolicitarPrograma from "./pages/superadmin/Moduls/Lealtad/SolicitarPrograma";
import EditLealtadRequest from "./pages/superadmin/Moduls/Lealtad/EditLealtadRequest";
import EditLealtadProgram from "./pages/superadmin/Moduls/Lealtad/EditLealtadProgram";

//módulo Asesoria SUPERADMIN
import PanelAsesoriaLegal from "./pages/superadmin/Moduls/AsesoriaLegal/PanelAsesoriaLegal";
import SolicitudesAsesoriaLegal from "./pages/superadmin/Moduls/AsesoriaLegal/SolicitudesAsesoriaLegal";
import PermisosLegales from "./pages/superadmin/Moduls/AsesoriaLegal/PermisosLegales";

//módulo Financiamiento SUPERADMIN
import PanelFinanciamiento from "./pages/superadmin/Moduls/Financiamiento/PanelFinanciamiento";
import SolicitudFinanciamiento from "./pages/superadmin/Moduls/Financiamiento/SolicitudFinanciamiento";

//módulo Encuestas SUPERADMIN
import PanelEncuestas from "./pages/superadmin/Moduls/Encuestas/PanelEncuestas";
import SolicitarEncuesta from "./pages/superadmin/Moduls/Encuestas/SolicitarEncuesta";
import EditEncuesta from "./pages/superadmin/Moduls/Encuestas/EditEncuesta";
import TablaRespuestas from "./pages/superadmin/Moduls/Encuestas/TablaRespuestas";
import TestUpload from "./pages/TestUpload";

//módulo Inventarios SUPERADMIN
import PanelInventarios from "./pages/superadmin/Moduls/Inventarios/PanelInventarios";
import TicketInventarios from "./pages/superadmin/Moduls/Inventarios/TicketInventarios";
import FuncionanInventarios from "./pages/superadmin/Moduls/Inventarios/FuncionanInventarios";
import Pagos from "./pages/Pagos";

//ADMIN
import EmpleadosAdmin from "./pages/administrador/EmpleadosAdmin";
import UserDetailAdmin from "./pages/administrador/UsuarioAdmin/UserDetailAdmin";

import ModuleRoute from "./components/rolAdmin/ModuleRoute";

//Módulos Asesoria Admin
import PanelAsesoriaAdmin from "./pages/administrador/ModulsAdmin/AsesoriaLegal/PanelAsesoriaAdmin";
import PermisosAdmin from "./pages/administrador/ModulsAdmin/AsesoriaLegal/PermisosAdmin";
import SolicitudLegalAdmin from "./pages/administrador/ModulsAdmin/AsesoriaLegal/SolicitudLegalAdmin";

//Módulos PanelIA Admin
import AyudaIAFormAdmin from "./pages/administrador/ModulsAdmin/AyudaIA/AyudaIAFormAdmin";
import RecomendacionAIAdmin from "./pages/administrador/ModulsAdmin/AyudaIA/RecomendacionAIAdmin";
import AyudaIAAdmin from "./pages/superadmin/Moduls/AyudaIA/AyudaIA";

//Modulos Encuestas Admin
import PanelEncuestasAdmin from "./pages/administrador/ModulsAdmin/Encuestas/PanelEncuestasAdmin";
import SolicitarEncuestasAdmin from "./pages/administrador/ModulsAdmin/Encuestas/SolicitarEncuestasAdmin";
import RespuestasEncuestasAdmin from "./pages/administrador/ModulsAdmin/Encuestas/RespuestasEncuestasAdmin";

//Modulos Financiamiento Admin
import PanelFinanciamientoAdmin from "./pages/administrador/ModulsAdmin/Financiamiento/PanelFinanciamientoAdmin";
import SolicitudFinanciamientoAdmin from "./pages/administrador/ModulsAdmin/Financiamiento/SolicitudFinanciamientoAdmin";

//Modulos Inventarios Admin
import PanelInventariosAdmin from "./pages/administrador/ModulsAdmin/Inventarios/PanelInventariosAdmin";
import SolicitudInventariosAdmin from "./pages/administrador/ModulsAdmin/Inventarios/SolicitudInventariosAdmin";

//Modulos Lealtad Admin
import PanelLealtadAdmin from "./pages/administrador/ModulsAdmin/Lealtad/PanelLealtadAdmin";
import SolicitarLealtadAdmin from "./pages/administrador/ModulsAdmin/Lealtad/SolicitarLealtadAdmin";
import TiposLealtadAdmin from "./pages/administrador/ModulsAdmin/Lealtad/TiposLealtadAdmin";

//Modulos Marketing Admin
import PanelMarketingAdmin from "./pages/administrador/ModulsAdmin/Marketing/PanelMarketingAdmin";
import SolicitudMarketingAdmin from "./pages/administrador/ModulsAdmin/Marketing/SolicitudMarketingAdmin";

//Modulos Monitoreo Admin
import PanelMonitoreoAdmin from "./pages/administrador/ModulsAdmin/Monitoreo/PanelMonitoreoAdmin";
import SolicitudMonitoreoAdmin from "./pages/administrador/ModulsAdmin/Monitoreo/SolicitudMonitoreoAdmin";

//Modulos PuntoVentas Admin
import PanelPuntoAdmin from "./pages/administrador/ModulsAdmin/PuntoVentas/PanelPuntoAdmin";
import SolicitudPuntoAdmin from "./pages/administrador/ModulsAdmin/PuntoVentas/SolicitudPuntoAdmin";

//Modulos RRHH Admin
import PanelRRHHAdmin from "./pages/administrador/ModulsAdmin/RRHH/PanelRRHHAdmin";
import ManualesRRHHAdmin from "./pages/administrador/ModulsAdmin/RRHH/ManualesRRHHAdmin";
import ResultadosRRHHAdmin from "./pages/administrador/ModulsAdmin/RRHH/ResultadosRRHHAdmin";
import ExamenesRRHHAdmin from "./pages/administrador/ModulsAdmin/RRHH/ExamenesRRHHAdmin";
import ContratacionesRRHHAdmin from "./pages/administrador/ModulsAdmin/RRHH/ContratacionesRRHHAdmin";

//Modulos PanelSistemaWeb admin
import PanelSistemaAdmin from "./pages/administrador/ModulsAdmin/SistemaWeb/PanelSistemaAdmin";
import SolicitudWebAdmin from "./pages/administrador/ModulsAdmin/SistemaWeb/SolicitudWebAdmin";

//Employee
import HomeEmployee from "./pages/employee/HomeEmployee";
import LayoutEmployeAntd from "./components/rolEmployee/LayoutEmployeeAntd";
import PanelManualEmployee from "./pages/employee/ModulsEmployee/ModuloRRHHEmployee/ManualsEmployee/PanelManualEmployee";
import Checklist from "./pages/employee/ModulsEmployee/Tareas/Checklist";
import DashboardVentasSoft from "./pages/superadmin/Moduls/PuntoVenta/DashboardVentasSoft";
import PanelBlog from "./pages/superadmin/Blog/PanelBlog";
import CrearBlog from "./pages/superadmin/Blog/CrearBlog";

function App() {
  console.log("[App.js] Renderizando App principal...");
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* prueba  */}
          <Route path="/test" element={<TestUpload />} />
          {/* Rutas públicas o sin necesidad de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/identy" element={<Identy />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/contact-admin" element={<ContactAdminPage />} />
          <Route path="/register" element={<RegisterProspect />} />

          {/* <Route path="/encuestas/:id" element={<LlenarEncuestaProspect />} /> */}
          {/* <Route path="/recomendaciones/:id" element={<Recomendaciones />} />
          <Route path="/examen/:candidate_id" element={<Exam />} /> */}

          {/* Rutas para rol admin */}
          <Route element={<PrivateRoute roles={["administrador"]} />}>
            <Route element={<LayoutAdminAntd />}>
              <Route path="/manage/:userId" element={<UserDetailAdmin />} />
              <Route path="/empleadosadmin" element={<EmpleadosAdmin />} />

              {/* Ruta para Módulo Asesoria (ID=6) */}
              <Route element={<ModuleRoute moduleId={6} />}>
                <Route
                  path="/panelasesoriaadmin"
                  element={<PanelAsesoriaAdmin />}
                />
                <Route
                  path="/solicitudasesoriaadmin"
                  element={<SolicitudLegalAdmin />}
                />
                <Route
                  path="/permisosasesoriaadmin"
                  element={<PermisosAdmin />}
                />
              </Route>

              {/* Ruta para Módulo AyudaIA (ID=11) */}
              <Route element={<ModuleRoute moduleId={11} />}>
                <Route path="/admin/ayudaia" element={<AyudaIAAdmin />} />

                {/* Ruta para llenar encuesta */}
                <Route
                  path="/admin/ayudaia/llenar-encuesta"
                  element={<AyudaIAFormAdmin />}
                />
                <Route path="/admin/panelia" element={<PanelIA />} />
                {/* Ruta para mostrar la recomendación final */}
                <Route
                  path="/admin/ayudaia/recomendacion/:id"
                  element={<RecomendacionAIAdmin />}
                />
              </Route>

              {/* Ruta para Módulo Encuestas (ID=8) */}
              <Route element={<ModuleRoute moduleId={8} />}>
                <Route
                  path="/panelencuestasadmin"
                  element={<PanelEncuestasAdmin />}
                />
                <Route
                  path="/solicitar-encuesta-admin"
                  element={<SolicitarEncuestasAdmin />}
                />
                <Route
                  path="/respuestas-encuestas-admin"
                  element={<RespuestasEncuestasAdmin />}
                />
              </Route>

              {/* Ruta para Módulo Financiamiento (ID=7) Amdmin */}
              <Route element={<ModuleRoute moduleId={7} />}>
                <Route
                  path="/panelfinanciamientoadmin"
                  element={<PanelFinanciamientoAdmin />}
                />
                <Route
                  path="/solicitudfinanciamientoadmin"
                  element={<SolicitudFinanciamientoAdmin />}
                />
              </Route>

              {/* Ruta para Módulo Inventarios (ID=9) */}
              <Route element={<ModuleRoute moduleId={9} />}>
                <Route
                  path="/panelinventariosadmin"
                  element={<PanelInventariosAdmin />}
                />
                <Route
                  path="/solicitudinventariosadmin"
                  element={<SolicitudInventariosAdmin />}
                />
                <Route
                  path="/como-funcionan-inventarios-admin"
                  element={<FuncionanInventarios />}
                />
              </Route>

              {/* Ruta para Módulo Lealtad (ID=5) */}
              <Route element={<ModuleRoute moduleId={5} />}>
                <Route
                  path="/panellealtadadmin"
                  element={<PanelLealtadAdmin />}
                />
                <Route
                  path="/tiposlealtadadmin"
                  element={<TiposLealtadAdmin />}
                />
                <Route
                  path="/solicitarlealtadadmin"
                  element={<SolicitarLealtadAdmin />}
                />
              </Route>

              {/* Ruta para Módulo Marketing (ID=1) Admin */}
              <Route element={<ModuleRoute moduleId={1} />}>
                <Route
                  path="/panelmarketingadmin"
                  element={<PanelMarketingAdmin />}
                />
                <Route
                  path="/solicitudmarketingadmin"
                  element={<SolicitudMarketingAdmin />}
                />
              </Route>

              {/* Ruta para Módulo Monitoreo (ID=10) */}
              <Route element={<ModuleRoute moduleId={10} />}>
                <Route
                  path="/panelmonitoreoadmin"
                  element={<PanelMonitoreoAdmin />}
                />
                <Route
                  path="/solicitudmonitoreoadmin"
                  element={<SolicitudMonitoreoAdmin />}
                />
              </Route>

              {/* Ruta para Módulo Punto Ventas (ID=3) */}
              <Route element={<ModuleRoute moduleId={3} />}>
                <Route
                  path="/panelpuntoventasadmin"
                  element={<PanelPuntoAdmin />}
                />
                <Route
                  path="/solicitudpuntoadmin"
                  element={<SolicitudPuntoAdmin />}
                />
              </Route>

              {/* Ruta para Módulo RRHH (ID=4) Admin*/}
              <Route element={<ModuleRoute moduleId={4} />}>
                <Route path="/admin/panelrrhh" element={<PanelRRHHAdmin />} />

                <Route
                  path="/admin/manualesrrhh"
                  element={<ManualesRRHHAdmin />}
                />
                <Route
                  path="/admin/contratacionesrrhh"
                  element={<ContratacionesRRHHAdmin />}
                />
                <Route
                  path="/admin/examenesresultadosrrhh"
                  element={<ResultadosRRHHAdmin />}
                />
                {/* Ruta con :candidateId => contestar o ver detalle */}
                <Route
                  path="/admin/examenesrrhh/:candidateId"
                  element={<ExamenesRRHHAdmin />}
                />
              </Route>

              {/* Ruta para Módulo Sistema Web (ID=2) */}
              <Route element={<ModuleRoute moduleId={2} />}>
                <Route
                  path="/panelsistemawebadmin"
                  element={<PanelSistemaAdmin />}
                />
              </Route>
              <Route
                path="/solicitudwebadmin"
                element={<SolicitudWebAdmin />}
              />
            </Route>
          </Route>

          {/* Rutas para rol EMPLOYEE */}
          <Route element={<PrivateRoute roles={["employee"]} />}>
            <Route element={<LayoutEmployeAntd />}>
              {/* Si quieres que /employee muestre directamente HomeEmployee */}
              <Route path="/employee" element={<HomeEmployee />} />
              <Route path="/manuales" element={<PanelManualEmployee />} />
              <Route path="/checklist" element={<Checklist />} />
            </Route>
          </Route>

          {/* Rutas para rol SUPERADMIN */}
          <Route element={<PrivateRoute roles={["superadmin"]} />}>
            <Route element={<LayoutSuperAdminAntd />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* USERS RUTAS */}
              <Route path="/usuarios" element={<Usuarios />} />
              <Route
                path="/usuarios/detalle/:userId"
                element={<UsuariosDetail />}
              />

              {/* CLIENTES RUTAS */}
              <Route path="/clientes" element={<Clientes />} />
              <Route
                path="/clientes/detalle/:userId"
                element={<ClientesDetail />}
              />

              {/* COMPAÑÍAS */}
              <Route path="/companies" element={<Companies />} />

              {/* COMPAÑÍAS */}
              <Route path="/posiciones" element={<Posiciones />} />

              {/* LISTA MÓDULOS*/}
              <Route path="/modules" element={<Modules />} />

              {/* MÓDULO AYUDA IA SUPERADMIN*/}
              <Route path="/superadmin/ayudaia" element={<AyudaIA />} />
              <Route
                path="/superadmin/ayudaia/llenar-encuesta"
                element={<AyudaIAForm />}
              />
              <Route
                path="/superadmin/ayudaia/recomendacion/:id"
                element={<RecomendacionAI />}
              />
              <Route path="/superadmin/panelia" element={<PanelIA />} />

              {/* MÓDULO SISTEMA WEB */}
              <Route path="/sistemaweb" element={<SistemaWeb />} />
              <Route path="/panelweb" element={<PanelSistemaWeb />} />

              {/* MÓDULO MARKETING WEB */}
              <Route path="/panelmarketing" element={<PanelMarketing />} />
              <Route path="/ticketsmarketing" element={<TicketsMarketing />} />

              {/* MÓDULO PUNTO DE VENTA Super admin */}
              <Route path="/panelpuntoVenta" element={<PanelPuntoVenta />} />
              <Route
                path="/ticketspuntoventa"
                element={<TicketsPuntoVenta />}
              />
              <Route path="/dashboardpunto" element={<DashboardVentasSoft />} />

              {/* MÓDULO RRHH SUPERADMIN*/}
              <Route path="/panelrrhh" element={<PanelRRHH />} />
              <Route path="/manualesrrhh" element={<ManualesRRHH />} />
              <Route
                path="/contratacionesrrhh"
                element={<ContratacionesRRHH />}
              />
              <Route
                path="/examenesresultadosrrhh"
                element={<ResultadosRRHH />}
              />
              {/* Ruta con :candidateId => contestar o ver detalle */}
              <Route
                path="/examenesrrhh/:candidateId"
                element={<ExamenesRRHH />}
              />

              {/* Ruta para ver tema de training rrhh */}
              <Route
                path="/panelrrhh/training"
                element={<TrainingIndexRRHH />}
              />

              <Route
                path="/panelrrhh/training/:employeeId"
                element={<EmployeeTrainingDetailRRHH />}
              />
              <Route
                path="/panelrrhh/training/paths"
                element={<TrainingPathsListRRHH />}
              />
              <Route
                path="/panelrrhh/training/paths"
                element={<TrainingPathsListRRHH />}
              />

              <Route
                path="/panelrrhh/assignPathForm"
                element={<AssignPathFormRRHH />}
              />
              <Route path="/listadmin" element={<PanelCheckListSuperAdmin />} />

              {/* MÓDULO LEALTAD SUPERADMIN*/}
              <Route path="/panellealtad" element={<PanelLealtad />} />
              <Route path="/tiposlealtad" element={<TiposLealtad />} />
              <Route
                path="/solicitarprograma"
                element={<SolicitarPrograma />}
              />
              <Route
                path="/panellealtad/edit-request/:id"
                element={<EditLealtadRequest />}
              />
              {/* Para editar Programa */}
              <Route
                path="/panellealtad/edit-program/:id"
                element={<EditLealtadProgram />}
              />

              {/* MÓDULO ASESORÍA LEGAL */}
              <Route path="/panelpermisos" element={<PanelAsesoriaLegal />} />
              <Route
                path="/solicitudasesorialegal"
                element={<SolicitudesAsesoriaLegal />}
              />
              <Route
                path="/informacionpermisos"
                element={<PermisosLegales />}
              />

              {/* MÓDULO FINANCIAMIENTO*/}
              <Route
                path="/panelfinanciamiento"
                element={<PanelFinanciamiento />}
              />
              <Route
                path="/solicitudfinanciamiento"
                element={<SolicitudFinanciamiento />}
              />

              {/* MÓDULO ENCUESTAS*/}
              <Route path="/panelencuesta" element={<PanelEncuestas />} />
              <Route
                path="/solicitarencuesta"
                element={<SolicitarEncuesta />}
              />
              <Route
                path="/panelencuesta/edit-survey/:id"
                element={<EditEncuesta isRequest={false} />}
              />
              {/* Editar Solicitud (isRequest=true) */}
              <Route
                path="/solicitudes/edit/:id"
                element={<EditEncuesta isRequest={true} />}
              />
              <Route
                path="/respuestasencuestas"
                element={<TablaRespuestas />}
              />

              {/* INVENTARIOS */}
              <Route path="/panelinventarios" element={<PanelInventarios />} />
              <Route
                path="/ticketsinventarios"
                element={<TicketInventarios />}
              />
              <Route
                path="/como-funcionan-inventarios"
                element={<FuncionanInventarios />}
              />
              {/* MONITOREO SUPERADMIN */}
              <Route path="/panelmonitoreo" element={<PanelMonitoreo />} />
              <Route
                path="/solicitudmonitoreo"
                element={<SolicitudMonitoreo />}
              />
              {/* BLOG SUPERADMIN */}
              <Route path="/panelblog" element={<PanelBlog />} />
              <Route path="/crearblog" element={<CrearBlog />} />

              {/* PLANES*/}
              <Route path="/plans" element={<Plans />} />
              {/* PAGOS*/}
              <Route path="/pagos" element={<Pagos />} />
            </Route>
          </Route>

          {/* RUTA DE FORBIDDEN */}
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
