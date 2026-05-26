import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RotaProtegida from "./components/RotaProtegida";
import TreinoDoDia from "./pages/TreinoDoDia";
import MeusTreinos from "./pages/MeusTreinos";
import DetalhesExercicio from "./pages/DetalhesExercicio";
import AdminExercicios from "./pages/AdminExercicios";
import CriarFicha from "./pages/CriarFicha";
import EditarFicha from "./pages/EditarFicha";
import Catalogo from "./pages/Catalogo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          }
        />

        <Route
          path="/meus-treinos"
          element={
            <RotaProtegida>
              <MeusTreinos />
            </RotaProtegida>
          }
        />

        <Route
          path="/treino-do-dia"
          element={
            <RotaProtegida>
              <TreinoDoDia />
            </RotaProtegida>
          }
        />

        <Route
          path="/catalogo"
          element={
            <RotaProtegida>
              <Catalogo />
            </RotaProtegida>
          }
        />

        <Route
          path="/catalogo/:id"
          element={
            <RotaProtegida>
              <DetalhesExercicio />
            </RotaProtegida>
          }
        />

        <Route
          path="/admin-exercicios"
          element={
            <RotaProtegida>
              <AdminExercicios />
            </RotaProtegida>
          }
        />

        <Route
          path="/criar-ficha"
          element={
            <RotaProtegida>
              <CriarFicha />
            </RotaProtegida>
          }
        />

        <Route
          path="/editar-ficha/:id"
          element={
            <RotaProtegida>
              <EditarFicha />
            </RotaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
