import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";

import PublicLayout from "@/components/PublicLayout";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Compare from "@/pages/Compare";
import About from "@/pages/About";
import Benchmark from "@/pages/Benchmark";
import Vision from "@/pages/Vision";
import Upcoming from "@/pages/Upcoming";
import Brochures from "@/pages/Brochures";
import Rera from "@/pages/Rera";
import Contact from "@/pages/Contact";
import Locations from "@/pages/Locations";
import NotFound from "@/pages/NotFound";

import AdminLogin from "@/pages/admin/AdminLogin";
import ProtectedRoute from "@/pages/admin/ProtectedRoute";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProjects from "@/pages/admin/AdminProjects";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminContent from "@/pages/admin/AdminContent";
import AdminTeam from "@/pages/admin/AdminTeam";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/about" element={<About />} />
              <Route path="/benchmark" element={<Benchmark />} />
              <Route path="/vision" element={<Vision />} />
              <Route path="/upcoming" element={<Upcoming />} />
              <Route path="/brochures" element={<Brochures />} />
              <Route path="/rera" element={<Rera />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/locations" element={<Locations />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/projects" element={<AdminProjects />} />
                <Route path="/admin/leads" element={<AdminLeads />} />
                <Route path="/admin/content" element={<AdminContent />} />
                <Route path="/admin/team" element={<AdminTeam />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" richColors theme="dark" />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
