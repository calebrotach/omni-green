import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AccountsPage } from "@/pages/AccountsPage";
import { FlowPage } from "@/pages/FlowPage";
import { MappingPage } from "@/pages/MappingPage";
import { NarrativePage } from "@/pages/NarrativePage";
import { QuestionsPage } from "@/pages/QuestionsPage";
import { RequirementsPage } from "@/pages/RequirementsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/flow" replace />} />
          <Route path="flow" element={<FlowPage />} />
          <Route path="requirements" element={<RequirementsPage />} />
          <Route path="mapping" element={<MappingPage />} />
          <Route path="narrative" element={<NarrativePage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="questions" element={<QuestionsPage />} />
        </Route>
        <Route path="/login" element={<Navigate to="/flow" replace />} />
        <Route path="*" element={<Navigate to="/flow" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
