import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthPage from './pages/auth/AuthPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import CustomersPage from './pages/dashboard/customers/CustomersPage'
import NewCustomerPage from './pages/dashboard/customers/NewCustomerPage'
import CustomerDetailPage from './pages/dashboard/customers/CustomerDetailPage'
import InvoicesPage from './pages/dashboard/invoices/InvoicesPage'
import NewInvoicePage from './pages/dashboard/invoices/NewInvoicePage'
import PaymentsPage from './pages/dashboard/payments/PaymentsPage'
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
        <Route path="invoices/:id" element={<ComingSoon title="Invoice details" />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="reports" element={<ComingSoon title="Reports" />} />
      </Route>

      {/* Catch-all */}
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

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
        <svg width="22" height="22" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <p className="text-base font-semibold text-gray-900 mb-1">{title}</p>
      <p className="text-sm text-gray-400 max-w-xs">This section is under construction.</p>
    </div>
  )
}