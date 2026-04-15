import { BrowserRouter as Router, Routes, Route, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import Editor from './pages/Editor';
import PublicPortfolio from './pages/PublicPortfolio';
import AdminDashboard from './pages/AdminDashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import Profile from './pages/Profile';
import Premium from './pages/Premium';
import AuthCallback from './pages/AuthCallback';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import VerifyOTP from './pages/VerifyOTP';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PortfolioProvider>
          <Router>
            <div className="min-h-screen bg-gray-900 text-gray-100">
              <Navbar />
              <Routes>
                <Route path="/templates" element={<Templates />} />
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
                <Route path="/u/:username" element={<PublicPortfolio />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/verify-email" element={
                  <ProtectedRoute>
                    <VerifyOTP />
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/templates" element={
                  <ProtectedRoute>
                    <Templates />
                  </ProtectedRoute>
                } />
                <Route path="/editor" element={
                  <ProtectedRoute>
                    <Editor />
                  </ProtectedRoute>
                } />
                <Route path="/resume-builder" element={
                  <ProtectedRoute>
                    <ResumeBuilder />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/403" element={<Forbidden />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </PortfolioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;