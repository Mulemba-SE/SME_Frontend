import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, the user must have at least one of these roles to access this route. */
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.some((role) => user?.roles?.includes(role))) {
    return (
      <div className="p-6 sm:p-8">
        <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">You do not have access to this page.</p>
          <p className="mt-1 text-sm text-gray-500">
            Your account role does not include permission for this section.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
