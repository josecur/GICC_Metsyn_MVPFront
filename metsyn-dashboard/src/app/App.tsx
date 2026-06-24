import { useEffect } from "react"
import { BrowserRouter, useRoutes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { routes } from "./routes"
import { useUiStore } from "@/shared/store/useUiStore"

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 } },
})

function AppRoutes() {
  return useRoutes(routes)
}

export default function App() {
  const theme = useUiStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
