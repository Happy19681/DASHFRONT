import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { dashboardPages } from "@/app/navigation";
import DashboardPage from "@/features/dashboard/DashboardPage";
import DashboardResourcePage from "@/features/resources/DashboardResourcePage";
import { pageResources } from "@/features/resources/pageConfig";
import TransactionsPage from "@/features/transactions/TransactionsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          {dashboardPages.map((page) => (
            <Route
              element={page.path === "/transactions"
                ? <TransactionsPage />
                : <DashboardResourcePage config={pageResources[page.path.slice(1)]} />}
              key={page.path}
              path={page.path}
            />
          ))}
          <Route path="*" element={<Navigate replace to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
