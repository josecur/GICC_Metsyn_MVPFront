import { Navigate, type RouteObject } from "react-router-dom"
import { MainLayout } from "@/shared/layouts/MainLayout"
import { RequireAuth } from "@/features/auth/guards/RequireAuth"
import { RequireRole } from "@/features/auth/guards/RequireRole"
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage"
import { CriteriosAtpPage } from "@/features/criterios-atp/pages/CriteriosAtpPage"
import { TendenciasPage } from "@/features/tendencias/pages/TendenciasPage"
import { ExploracionPage } from "@/features/exploracion/pages/ExploracionPage"
import { ModeloMlPage } from "@/features/modelo-ml/pages/ModeloMlPage"
import { IngestaPage } from "@/features/ingesta/pages/IngestaPage"

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "criterios-atp", element: <CriteriosAtpPage /> },
      { path: "tendencias", element: <TendenciasPage /> },
      { path: "exploracion", element: <ExploracionPage /> },
      // Solo médico (Risk Score individual)
      { path: "modelo-ml", element: <RequireRole roles={["medico"]}><ModeloMlPage /></RequireRole> },
      // Solo médico (punto de entrada de datos)
      { path: "ingesta", element: <RequireRole roles={["medico"]}><IngestaPage /></RequireRole> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]
