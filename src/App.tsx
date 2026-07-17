import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthPage from './pages/auth/AuthPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import CustomersPage from './pages/dashboard/customers/CustomersPage'
import NewCustomerPage from './pages/dashboard/customers/NewCustomerPage'
import CustomerDetailPage from './pages/dashboard/customers/CustomerDetailPage'
import InvoicesPage from './pages/dashboard/invoices/InvoicesPage'
import InvoiceDetailPage from './pages/dashboard/invoices/InvoiceDetailPage'
import NewInvoicePage from './pages/dashboard/invoices/NewInvoicePage'
import PaymentsPage from './pages/dashboard/payments/PaymentsPage'
import NewPaymentPage from './pages/dashboard/payments/NewPaymentPage'
import PaymentDetailPage from './pages/dashboard/payments/PaymentDetailPage'
import ReportsPage from './pages/dashboard/ReportsPage'
import UsersPage from './pages/dashboard/team/UsersPage'
import NewUserPage from './pages/dashboard/team/NewUserPage'

import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'

const qc = new QueryClient()

// Separate inner component so it sits inside the providers
function AppRoutes() {
  const { restoreSession } = useAuth()
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    restoreSession().finally(() => setSessionChecked(true))
  }, [])

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/new" element={<NewCustomerPage />} />
        <Route path="customers/:userNo" element={<CustomerDetailPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/new" element={<NewInvoicePage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="payments/new" element={<NewPaymentPage />} />
        <Route path="payments/:paymentNo" element={<PaymentDetailPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route
          path="team"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="team/new"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <NewUserPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}