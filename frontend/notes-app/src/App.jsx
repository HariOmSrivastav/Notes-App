import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Check if token exists
  return isAuthenticated ? element : <Navigate to="https://notes-app-068y.onrender.com/login" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root path to login */}
        <Route path="https://notes-app-068y.onrender.com/" element={<Navigate to="/login" replace />} />
        
        {/* Protected Dashboard Route */}
        <Route path="https://notes-app-068y.onrender.com/dashboard" element={<ProtectedRoute element={<Home/>} />} />
        
        <Route path="https://notes-app-068y.onrender.com/login" element={<Login/>} />
        <Route path="https://notes-app-068y.onrender.com/signup" element={<SignUp/>} />
      </Routes>
    </Router>
  );
};

export default App;