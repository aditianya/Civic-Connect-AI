import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Report from "./pages/Report";
import Reports from "./pages/Reports";
import "./App.css";
import AdminDashboard from "./pages/AdminDashboard";
import MyReports from "./pages/MyReports";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>}/>
        {/* Protected route */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>}/>
        <Route path="/dashboard"element={<ProtectedRoute> <Dashboard /></ProtectedRoute>}/>
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;