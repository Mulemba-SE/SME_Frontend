import { Link } from "react-router-dom";
import { useAdminUsers } from "../../../hooks/useAdminUsers";
import { getApiErrorMessage } from "../../../api/client";
import { Avatar } from "../../../components/ui/Avatar";
import { formatDate } from "../../../lib/format";

const ROLE_STYLES: Record<string, string> = {
  MANAGER: "bg-purple-50 text-purple-700 border-purple-100",
  STAFF: "bg-blue-50 text-blue-700 border-blue-100",
  CUSTOMER: "bg-gray-50 text-gray-700 border-gray-200",
};

function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLES[role] ?? "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
}

function TableSkeleton() {
  return (
    <tbody className="divide-y divide-gray-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100" />
              <div className="h-3.5 bg-gray-100 rounded w-24" />
            </div>
          </td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-32" /></td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-20" /></td>
          <td className="px-4 py-3.5"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-20" /></td>
        </tr>
      ))}
    </tbody>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
        <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">Couldn't load the team</p>
      <p className="text-sm text-gray-500 max-w-xs">{message}</p>
    </div>
  );
}

export default function UsersPage() {
  const { data: users, isLoading, isError, error } = useAdminUsers();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Manager, Staff, and Customer accounts.</p>
        </div>

        <Link
          to="/dashboard/team/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 text-sm font-medium transition-colors"
        >
          + Add Team Member
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {isError ? (
          <InlineError message={getApiErrorMessage(error, "Please try again.")} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3">CreatedAt</th>
                </tr>
              </thead>
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <tbody className="divide-y divide-gray-100">
                  {(users ?? []).map((u) => {
                    const displayName = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={displayName} size="table" />
                            <span className="font-medium text-gray-900">{displayName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">{u.email}</td>
                        <td className="px-4 py-3.5 text-gray-600">{u.phoneNumber || "—"}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex gap-1.5">
                            {u.roles.map((role) => (
                              <RoleBadge key={role} role={role} />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                          {u.createdAt ? formatDate(u.createdAt) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </table>
            {!isLoading && (users ?? []).length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <p className="text-sm font-semibold text-gray-900 mb-1">No team members yet</p>
                <p className="text-sm text-gray-500">Add your first Manager, Staff, or Customer account.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
