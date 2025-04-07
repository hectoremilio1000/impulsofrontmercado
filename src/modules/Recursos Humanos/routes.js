import { Routes, Route } from "react-router-dom";
import Main from ".";
import LayoutRecursosH from "./components/Layout";
import NotFoundPage from "../../pages/NotFoundPage";
import Contratados from "./pages/Contratados";
import Candidatos from "./pages/PorContratar";
import CandidateExam from "./pages/CandidatosExam";
import CandidateResults from "./pages/CandidatosResults";

function RecursosHRoutes({ open, setOpen }) {
  return (
    <Routes>
      <Route
        index
        element={
          <LayoutRecursosH open={open} setOpen={setOpen}>
            <Main />
          </LayoutRecursosH>
        }
      />
      <Route
        path="/contratados"
        element={
          <LayoutRecursosH open={open} setOpen={setOpen}>
            <Contratados />
          </LayoutRecursosH>
        }
      />
      <Route
        path="/candidatos"
        element={
          <LayoutRecursosH open={open} setOpen={setOpen}>
            <Candidatos />
          </LayoutRecursosH>
        }
      />
      <Route
        path="/candidatos/:id/examen"
        element={
          <LayoutRecursosH open={open} setOpen={setOpen}>
            <CandidateExam />
          </LayoutRecursosH>
        }
      />
      <Route
        path="/candidatos/:id/resultados"
        element={
          <LayoutRecursosH open={open} setOpen={setOpen}>
            <CandidateResults />
          </LayoutRecursosH>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default RecursosHRoutes;
