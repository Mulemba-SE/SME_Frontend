import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthPage from './pages/auth/AuthPage'
import ChangePasswordPage from './pages/auth/ChangePasswordPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import CustomerDashboardPage from './pages/dashboard/CustomerDashboardPage'
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
const operationalRoles = ["MANAGER", "STAFF"]
const customerInvoicePaymentRoles = ["MANAGER", "STAFF", "CUSTOMER"]

// Separate inner component so it sits inside the providers
function AppRoutes() {
  const { restoreSession, user } = useAuth()
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    restoreSession().finally(() => setSessionChecked(true))
    // We intentionally omit restoreSession from deps because its reference changes on every render
    // and we only want to run this once when the app initializes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      {/* Protected, standalone (no dashboard chrome) */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <ProtectedRoute allowedRoles={customerInvoicePaymentRoles}>
              {user?.roles?.includes("CUSTOMER") ? <CustomerDashboardPage /> : <DashboardPage />}
            </ProtectedRoute>
          }
        />
        <Route
          path="customers"
          element={
            <ProtectedRoute allowedRoles={operationalRoles}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="customers/new"
          element={
            <ProtectedRoute allowedRoles={operationalRoles}>
              <NewCustomerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="customers/:userNo"
          element={
            <ProtectedRoute allowedRoles={operationalRoles}>
              <CustomerDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices"
          element={
            <ProtectedRoute allowedRoles={customerInvoicePaymentRoles}>
              <InvoicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices/new"
          element={
            <ProtectedRoute allowedRoles={operationalRoles}>
              <NewInvoicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices/:id"
          element={
            <ProtectedRoute allowedRoles={customerInvoicePaymentRoles}>
              <InvoiceDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payments"
          element={
            <ProtectedRoute allowedRoles={customerInvoicePaymentRoles}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payments/new"
          element={
            <ProtectedRoute allowedRoles={operationalRoles}>
              <NewPaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payments/:paymentNo"
          element={
            <ProtectedRoute allowedRoles={customerInvoicePaymentRoles}>
              <PaymentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
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
