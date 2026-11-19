import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import React, { lazy, Suspense, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import { recordVisitorLog } from "./utils/visitorTracker";
import Navbar from "./components/Navbar";
import Home from "./Pages/Home";
import About from "./Pages/About";
import ServicesSection from "./components/ServicesSection";
import EducationSection from "./components/EducationSection";
import SocialHubSection from "./components/SocialHubSection";
import FaqSection from "./components/FaqSection";
import AnimatedBackground from "./components/Background";
import Footer from "./components/Footer";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const Portofolio = lazy(() => import("./Pages/Portofolio"));
const ContactPage = lazy(() => import("./Pages/Contact"));
const ProjectDetails = lazy(() => import("./components/ProjectDetail"));
const NotFoundPage = lazy(() => import("./Pages/404"));

const LandingPage = () => {
  useEffect(() => {
    recordVisitorLog("/");
  }, []);

  return (
    <div className="relative min-h-screen text-zinc-900 dark:text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-600 dark:selection:text-emerald-300">
      <Navbar />
      <main>
        <Home />
        <About />
        <ServicesSection />
        <Suspense fallback={<div className="h-32 flex items-center justify-center text-zinc-400 text-sm">Memuat portofolio...</div>}>
          <Portofolio />
        </Suspense>
        <EducationSection />
        <SocialHubSection />
        <FaqSection />
        <Suspense fallback={<div className="h-32 flex items-center justify-center text-zinc-400 text-sm">Memuat kontak...</div>}>
          <ContactPage />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

const ProjectPageLayout = () => {
  const location = useLocation();

  useEffect(() => {
    recordVisitorLog(location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen text-zinc-900 dark:text-zinc-100">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-400">Memuat rincian proyek...</div>}>
        <ProjectDetails />
      </Suspense>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <PortfolioProvider>
        <HelmetProvider>
          <AnimatedBackground />
          <BrowserRouter>
            <Routes>
              {/* PUBLIC LANDING */}
              <Route path="/" element={<LandingPage />} />

              {/* PROJECT DETAIL */}
              <Route path="/project/:slug" element={<ProjectPageLayout />} />

              {/* AUTH */}
              <Route path="/login" element={<Login />} />

              {/* ADMIN (PROTECTED) */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 NOT FOUND */}
              <Route
                path="*"
                element={
                  <Suspense fallback={null}>
                    <NotFoundPage />
                  </Suspense>
                }
              />
            </Routes>
          </BrowserRouter>
        </HelmetProvider>
      </PortfolioProvider>
    </ThemeProvider>
  );
}

export default App;
