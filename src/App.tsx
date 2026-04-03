import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AccountsPage } from "@/pages/AccountsPage";
import { FlowPage } from "@/pages/FlowPage";
import { LoginPage } from "@/pages/LoginPage";
import { MappingPage } from "@/pages/MappingPage";
import { NarrativePage } from "@/pages/NarrativePage";
import { QuestionsPage } from "@/pages/QuestionsPage";
import { RequirementsPage } from "@/pages/RequirementsPage";
import { useAppStore } from "@/store/useAppStore";

function Protected({ children }: { children: ReactNode }) {
  const authenticated = useAppStore((s) => s.authenticated);
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<Navigate to="/flow" replace />} />
          <Route path="flow" element={<FlowPage />} />
          <Route path="requirements" element={<RequirementsPage />} />
          <Route path="mapping" element={<MappingPage />} />
          <Route path="narrative" element={<NarrativePage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="questions" element={<QuestionsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/flow" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
