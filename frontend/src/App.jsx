import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import {
  AdminDashboard,
  ManageAgents,
  ManagePlans,
  AgentDashboard,
  CustomerDashboard,
  ManageCustomers,
  DailyReports,
  Settings,
  MyCustomers,
  CollectionEntries,
  NewTransaction,
  MyCommission,
  MyPassbook,
  Profile,
  PlanSubscribers,
  ManageAccounts,
  CommissionPayouts
} from './pages';

const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'agent') return <Navigate to="/agent" replace />;
  if (user.role === 'user') return <Navigate to="/customer" replace />;
  return <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />
          
          <Route element={<AppLayout />}>
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/agents" element={<ManageAgents />} />
              <Route path="/admin/customers" element={<ManageCustomers />} />
              <Route path="/admin/reports" element={<DailyReports />} />
              <Route path="/admin/plans" element={<ManagePlans />} />
              <Route path="/admin/plans/:id/subscribers" element={<PlanSubscribers />} />
              <Route path="/admin/accounts" element={<ManageAccounts />} />
              <Route path="/admin/commissions" element={<CommissionPayouts />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>

            {/* Agent Routes */}
            <Route element={<ProtectedRoute allowedRoles={['agent']} />}>
              <Route path="/agent" element={<AgentDashboard />} />
              <Route path="/agent/customers" element={<MyCustomers />} />
              <Route path="/agent/collections" element={<CollectionEntries />} />
              <Route path="/agent/collections/new" element={<NewTransaction />} />
              <Route path="/agent/commission" element={<MyCommission />} />
            </Route>

            {/* Customer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/customer" element={<CustomerDashboard />} />
              <Route path="/customer/passbook" element={<MyPassbook />} />
              <Route path="/customer/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};


export default App;
