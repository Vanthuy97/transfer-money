import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ManageCapital from './pages/ManageCapital/ManageCapital';
import ManageTransactions from './pages/ManageTransactions/ManageTransactions';
import AddEditTransaction from './pages/AddEditTransaction/AddEditTransaction';
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
              path="/manage-capital"
              element={
                <PrivateRoute>
                  <ManageCapital />
                </PrivateRoute>
              }
            />
            <Route
              path="/quan-ly-von"
              element={
                <PrivateRoute>
                  <ManageCapital />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-transactions"
              element={
                <PrivateRoute>
                  <ManageTransactions />
                </PrivateRoute>
              }
            />
            <Route
              path="/quan-ly-giao-dich"
              element={
                <PrivateRoute>
                  <ManageTransactions />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-edit-transaction"
              element={
                <PrivateRoute>
                  <AddEditTransaction />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-edit-transaction/:id"
              element={
                <PrivateRoute>
                  <AddEditTransaction />
                </PrivateRoute>
              }
            />
            <Route
              path="/them-luu-giao-dich"
              element={
                <PrivateRoute>
                  <AddEditTransaction />
                </PrivateRoute>
              }
            />
            <Route
              path="/them-luu-giao-dich/:id"
              element={
                <PrivateRoute>
                  <AddEditTransaction />
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

