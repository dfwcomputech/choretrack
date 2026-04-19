import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './i18n/index'
import './index.css'
import LandingPage from './pages/LandingPage'
import App from './App.tsx'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<App />} />
        <Route path="/login" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900">Login Page (Coming Soon)</h1></div>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
