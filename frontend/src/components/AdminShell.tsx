"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminThemeProvider from "@/components/AdminThemeProvider";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminThemeProvider>
  );
}
