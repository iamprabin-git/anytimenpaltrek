"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getRolePermissions,
  updateRolePermissions,
  updateSingleRolePermissions,
  type RolePermissionsData,
} from "@/lib/admin-api";

const PERMISSION_GROUPS: Record<string, string> = {
  dashboard: "Dashboard",
  profile: "Profile",
  packages: "Tour & Travel",
  blog: "Blog Management",
  users: "Customer Management",
  payment_settings: "Payment QR & Bank Details",
  reviews: "Review Management",
  inquiries: "Inquiry Management",
  bookings: "Payment Transactions",
  approvals: "Change Approvals",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  director: "Full access. Changes apply immediately without approval.",
  manager: "Full access. Approves changes submitted by Accountant and Reception.",
  accountant: "Handles payments and bookings. Changes require manager approval.",
  reception: "Handles customers, inquiries, and reviews. Changes require manager approval.",
};

function permissionsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

function groupCatalog(catalog: Record<string, string>) {
  const groups: Record<string, Array<{ key: string; label: string }>> = {};

  for (const [key, label] of Object.entries(catalog)) {
    const groupKey = key.split(".")[0];
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push({ key, label });
  }

  return Object.entries(PERMISSION_GROUPS)
    .filter(([groupKey]) => groups[groupKey]?.length)
    .map(([groupKey, title]) => ({
      key: groupKey,
      title,
      items: groups[groupKey],
    }));
}

export default function AdminRolesPage() {
  const [data, setData] = useState<RolePermissionsData | null>(null);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [saved, setSaved] = useState<Record<string, string[]>>({});
  const [activeRole, setActiveRole] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingAll, setSavingAll] = useState(false);
  const [savingRole, setSavingRole] = useState("");

  useEffect(() => {
    getRolePermissions()
      .then((result) => {
        setData(result);
        setSelected(result.permissions);
        setSaved(result.permissions);
        setActiveRole(Object.keys(result.roles)[0] || "");
      })
      .catch(() => setError("Failed to load role permissions."));
  }, []);

  const groupedPermissions = useMemo(
    () => (data ? groupCatalog(data.catalog) : []),
    [data]
  );

  const activePermissions = selected[activeRole] || [];
  const totalPermissions = data ? Object.keys(data.catalog).length : 0;
  const enabledCount = activePermissions.length;
  const requiresApproval = activeRole === "accountant" || activeRole === "reception";
  const roleIsDirty = !permissionsEqual(activePermissions, saved[activeRole] || []);
  const hasUnsavedRoles = Object.keys(data?.roles || {}).some((roleKey) =>
    !permissionsEqual(selected[roleKey] || [], saved[roleKey] || [])
  );

  function togglePermission(permission: string) {
    setSelected((prev) => {
      const current = prev[activeRole] || [];
      const next = current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission];
      return { ...prev, [activeRole]: next };
    });
  }

  function setGroupPermissions(groupKey: string, enabled: boolean) {
    const group = groupedPermissions.find((item) => item.key === groupKey);
    if (!group) return;

    setSelected((prev) => {
      const current = new Set(prev[activeRole] || []);
      for (const item of group.items) {
        if (enabled) current.add(item.key);
        else current.delete(item.key);
      }
      return { ...prev, [activeRole]: Array.from(current) };
    });
  }

  function setAllPermissions(enabled: boolean) {
    if (!data) return;
    setSelected((prev) => ({
      ...prev,
      [activeRole]: enabled ? Object.keys(data.catalog) : [],
    }));
  }

  async function handleSaveAll() {
    setSavingAll(true);
    setError("");
    setMessage("");
    try {
      const result = await updateRolePermissions(selected);
      setSaved(result.permissions);
      setSelected(result.permissions);
      setMessage("All role permissions saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save permissions.");
    } finally {
      setSavingAll(false);
    }
  }

  async function handleSaveRole(roleKey: string = activeRole) {
    setSavingRole(roleKey);
    setError("");
    setMessage("");
    try {
      const result = await updateSingleRolePermissions(roleKey, selected[roleKey] || []);
      setSaved(result.permissions);
      setSelected(result.permissions);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save role permissions.");
    } finally {
      setSavingRole("");
    }
  }

  if (!data) {
    return <p className="text-muted">{error || "Loading role permissions..."}</p>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="panel-title mb-2">Role Permissions</h1>
          <p className="text-sm text-muted">
            Choose a role, then enable the permissions it should have. Manager and Director apply changes immediately; Accountant and Reception require approval.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={savingAll || savingRole !== "" || !hasUnsavedRoles}
          className="btn-primary disabled:opacity-50"
        >
          {savingAll ? "Saving..." : "Save All Roles"}
        </button>
      </div>

      {message ? <p className="mb-4 text-green-600">{message}</p> : null}
      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      <div className="panel-card mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-[220px] flex-1">
          <label htmlFor="role-select" className="mb-2 block text-sm font-medium text-foreground">
            Select role
          </label>
          <select
            id="role-select"
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            className="panel-input w-full max-w-md"
          >
            {Object.entries(data.roles).map(([roleKey, roleLabel]) => (
              <option key={roleKey} value={roleKey}>
                {roleLabel}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-surface-muted px-3 py-1 text-sm font-medium text-foreground">
            {enabledCount} of {totalPermissions} enabled
          </span>
          <button
            type="button"
            onClick={() => setAllPermissions(true)}
            className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-muted"
          >
            Enable all
          </button>
          <button
            type="button"
            onClick={() => setAllPermissions(false)}
            className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-muted"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="panel-card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{data.roles[activeRole]}</h2>
            <p className="mt-1 text-sm text-muted">{ROLE_DESCRIPTIONS[activeRole]}</p>
            {roleIsDirty ? (
              <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">Unsaved changes for this role</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {requiresApproval ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                Requires manager approval
              </span>
            ) : (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Changes apply immediately
              </span>
            )}
            <button
              type="button"
              onClick={() => handleSaveRole(activeRole)}
              disabled={savingRole !== "" || savingAll || !roleIsDirty}
              className="btn-primary disabled:opacity-50"
            >
              {savingRole === activeRole ? "Saving..." : `Save ${data.roles[activeRole]}`}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {groupedPermissions.map((group) => {
          const groupKeys = group.items.map((item) => item.key);
          const groupEnabled = groupKeys.filter((key) => activePermissions.includes(key)).length;

          return (
            <section key={group.key} className="panel-card">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
                  <p className="text-xs text-muted">
                    {groupEnabled} of {group.items.length} permissions enabled
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGroupPermissions(group.key, true)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-surface-muted"
                  >
                    Enable group
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupPermissions(group.key, false)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-surface-muted"
                  >
                    Clear group
                  </button>
                </div>
              </div>

              <ul className="divide-y divide-border">
                {group.items.map((item) => {
                  const checked = activePermissions.includes(item.key);

                  return (
                    <li key={item.key}>
                      <label className="flex cursor-pointer items-start gap-3 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(item.key)}
                          className="mt-1"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-foreground">{item.label}</span>
                          <span className="block text-xs text-muted">{item.key}</span>
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            checked
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-surface-muted text-muted"
                          }`}
                        >
                          {checked ? "Enabled" : "Disabled"}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
