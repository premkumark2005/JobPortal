import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SeekerDashboard from './pages/SeekerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import JobDetails from './pages/JobDetails';
import PostJob from './pages/PostJob';
import ApplicationDetails from './pages/ApplicationDetails';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route 
                path="/seeker/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['seeker']}>
                    <SeekerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/recruiter/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/jobs/:id" element={<JobDetails />} />
              
              <Route 
                path="/post-job" 
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <PostJob />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/applications/job/:jobId" 
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <ApplicationDetails />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/applications/:applicationId" 
                element={
                  <ProtectedRoute allowedRoles={['seeker']}>
                    <ApplicationDetails />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 