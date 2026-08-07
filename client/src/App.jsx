import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PatientDashboard from './pages/Patient/PatientDashboard';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        {/* Public Routes */}
        <Route index element={
          <div className="flex-1 flex flex-col justify-center items-center">
            <h1 className="text-4xl font-bold text-gray-900">Welcome to MedConnect AI</h1>
            <p className="mt-4 text-lg text-gray-600">The intelligent healthcare platform.</p>
          </div>
        } />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        {/* Protected Patient Routes */}
        <Route path="patient/dashboard" element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />

        {/* Protected Doctor Routes */}
        <Route path="doctor/dashboard" element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />

        {/* Protected Admin Routes */}
        <Route path="admin/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
