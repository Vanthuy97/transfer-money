import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QuanLyVon from './pages/QuanLyVon';
import QuanLyGiaoDich from './pages/QuanLyGiaoDich';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/quan-ly-von"
              element={
                <PrivateRoute>
                  <QuanLyVon />
                </PrivateRoute>
              }
            />
            <Route
              path="/quan-ly-giao-dich"
              element={
                <PrivateRoute>
                  <QuanLyGiaoDich />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

